/**
 * Personal OS — Cloudflare Worker
 *
 * Routes:
 *   GET  /auth/google              → Google OAuth redirect
 *   GET  /auth/google/callback     → Google OAuth callback (sets session)
 *   GET  /auth/me                  → Current session info
 *   POST /auth/logout              → Invalidate session
 *   GET  /api/integrations         → List integration connection status
 *   POST /api/integrations/oura    → Save Oura PAT to D1
 *   DELETE /api/integrations/oura  → Remove Oura PAT
 *   GET  /api/oura/*               → Oura API proxy (session-based, PAT from D1)
 *   POST /ai-review                → AI health review (Gemini)
 *   GET  /*                        → Legacy Oura proxy (PAT via Authorization header)
 */

const GOOGLE_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_INFO_URL  = 'https://www.googleapis.com/oauth2/v3/userinfo';
const SESSION_TTL      = 30 * 24 * 60 * 60;  // 30 days (seconds)
const STATE_TTL        = 10 * 60;             // 10 minutes

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return corsOptions();

    const url  = new URL(request.url);
    const path = url.pathname;

    try {
      // ── Public routes ──────────────────────────────────────────────────
      if (path === '/auth/google')          return handleGoogleLogin(request, env);
      if (path === '/auth/google/callback') return handleGoogleCallback(request, env);
      if (path === '/ai-review' && request.method === 'POST') return handleAIReview(request, env);

      // ── Session (optional — degraded mode if DB absent) ───────────────
      const session = await getSession(request, env);

      // ── Authenticated endpoints ────────────────────────────────────────
      if (path === '/auth/me') {
        if (!session) return json({ error: 'unauthenticated' }, 401);
        return json({ user: session.user });
      }

      if (path === '/auth/logout') {
        if (session) {
          await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(session.id).run();
        }
        return json({ ok: true });
      }

      if (path === '/api/integrations' && request.method === 'GET') {
        if (!session) return json({ error: 'unauthenticated' }, 401);
        return handleGetIntegrations(env, session);
      }

      if (path === '/api/integrations/oura') {
        if (!session) return json({ error: 'unauthenticated' }, 401);
        if (request.method === 'POST')   return handleSaveOuraPAT(request, env, session);
        if (request.method === 'DELETE') return handleDeleteIntegration(env, session, 'oura');
      }

      // ── Authenticated Oura proxy (/api/oura/…) ─────────────────────────
      if (path.startsWith('/api/oura/')) {
        if (!session) return json({ error: 'unauthenticated' }, 401);
        return handleOuraProxyAuthed(request, env, session, url);
      }

      // ── Legacy Oura proxy (PAT in Authorization header) ───────────────
      return handleOuraProxyLegacy(request, url);

    } catch (e) {
      console.error('Worker error:', e.stack || e.message);
      return json({ error: 'internal_error', message: e.message }, 500);
    }
  }
};

// ════════════════════════════════════════════════════════════════════════
// Session helpers
// ════════════════════════════════════════════════════════════════════════

function uid() { return crypto.randomUUID(); }

async function getSession(request, env) {
  if (!env.DB) return null;
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) return null;

  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(`
    SELECT s.id, u.id AS user_id, u.email, u.name, u.picture
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(token, now).first();

  if (!row) return null;
  return {
    id:   row.id,
    user: { id: row.user_id, email: row.email, name: row.name, picture: row.picture }
  };
}

// ════════════════════════════════════════════════════════════════════════
// Google OAuth
// ════════════════════════════════════════════════════════════════════════

async function handleGoogleLogin(request, env) {
  if (!env.GOOGLE_CLIENT_ID) {
    return json({ error: 'GOOGLE_CLIENT_ID not configured' }, 500);
  }
  const state       = uid();
  const now         = Math.floor(Date.now() / 1000);
  const redirectUri = new URL('/auth/google/callback', request.url).href;

  if (env.DB) {
    await env.DB.prepare(
      'INSERT INTO oauth_states (state, expires_at) VALUES (?, ?)'
    ).bind(state, now + STATE_TTL).run();
    // Cleanup expired states
    await env.DB.prepare('DELETE FROM oauth_states WHERE expires_at < ?').bind(now).run();
  }

  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
    prompt:        'select_account',
  });

  return Response.redirect(`${GOOGLE_AUTH_URL}?${params}`, 302);
}

async function handleGoogleCallback(request, env) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error)         return callbackPage(null, `Google OAuth エラー: ${error}`);
  if (!code || !state) return callbackPage(null, 'code / state が不正です');

  // Verify state
  if (env.DB) {
    const now      = Math.floor(Date.now() / 1000);
    const stateRow = await env.DB.prepare(
      'SELECT state FROM oauth_states WHERE state = ? AND expires_at > ?'
    ).bind(state, now).first();
    if (!stateRow) return callbackPage(null, 'State が無効または期限切れです');
    await env.DB.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run();
  }

  // Exchange code → tokens
  const redirectUri = new URL('/auth/google/callback', request.url).href;
  const tokenRes    = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return callbackPage(null, 'アクセストークン取得失敗');

  // Get Google user info
  const infoRes  = await fetch(GOOGLE_INFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userInfo = await infoRes.json();
  if (!userInfo.sub) return callbackPage(null, 'ユーザー情報取得失敗');

  // Upsert user
  const now    = Math.floor(Date.now() / 1000);
  const userId = uid();
  await env.DB.prepare(`
    INSERT INTO users (id, google_id, email, name, picture, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(google_id) DO UPDATE SET
      email   = excluded.email,
      name    = excluded.name,
      picture = excluded.picture
  `).bind(userId, userInfo.sub, userInfo.email, userInfo.name || '', userInfo.picture || '', now).run();

  const user = await env.DB.prepare(
    'SELECT id FROM users WHERE google_id = ?'
  ).bind(userInfo.sub).first();

  // Create session (30 days)
  const sessionToken = uid();
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sessionToken, user.id, now, now + SESSION_TTL).run();

  return callbackPage(sessionToken);
}

function callbackPage(sessionToken, errorMsg) {
  const tokenJson = sessionToken ? JSON.stringify(sessionToken) : 'null';
  const script = sessionToken ? `
try { localStorage.setItem('pos-session', ${tokenJson}); } catch(e) {}
if (window.opener && !window.opener.closed) {
  window.opener.postMessage({ type: 'pos-auth', session: ${tokenJson} }, '*');
  setTimeout(() => window.close(), 300);
} else {
  document.getElementById('msg').textContent = 'ログイン完了。このタブを閉じてください。';
}
` : `document.getElementById('msg').textContent = ${JSON.stringify(errorMsg || '不明なエラー')};
document.getElementById('msg').style.color = '#D44E4E';`;

  return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#C8CDD4;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:rgba(255,255,255,0.75);border-radius:16px;padding:36px 32px;text-align:center;max-width:340px;width:90%;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
h2{font-size:15px;font-weight:600;color:#1A1C22;margin-bottom:8px}
p{font-size:12px;color:rgba(26,28,34,0.6);line-height:1.6}
</style></head>
<body><div class="card">
<h2>${sessionToken ? '✓ ログイン完了' : 'エラー'}</h2>
<p id="msg">${sessionToken ? 'このウィンドウを閉じてPersonal OSへ戻ってください' : ''}</p>
</div>
<script>${script}</script></body></html>`, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}

// ════════════════════════════════════════════════════════════════════════
// Integration management
// ════════════════════════════════════════════════════════════════════════

async function handleGetIntegrations(env, session) {
  const { results } = await env.DB.prepare(`
    SELECT service,
           CASE WHEN token IS NOT NULL THEN 1 ELSE 0 END AS connected,
           updated_at
    FROM integrations WHERE user_id = ?
  `).bind(session.user.id).all();
  return json({ integrations: results || [] });
}

async function handleSaveOuraPAT(request, env, session) {
  const body = await request.json().catch(() => ({}));
  const { token } = body;
  if (!token || typeof token !== 'string' || !token.startsWith('oura_')) {
    return json({ error: 'Invalid Oura PAT — must start with oura_' }, 400);
  }
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`
    INSERT INTO integrations (user_id, service, token, updated_at)
    VALUES (?, 'oura', ?, ?)
    ON CONFLICT(user_id, service) DO UPDATE SET
      token = excluded.token, updated_at = excluded.updated_at
  `).bind(session.user.id, token, now).run();
  return json({ ok: true });
}

async function handleDeleteIntegration(env, session, service) {
  await env.DB.prepare(
    'DELETE FROM integrations WHERE user_id = ? AND service = ?'
  ).bind(session.user.id, service).run();
  return json({ ok: true });
}

// ════════════════════════════════════════════════════════════════════════
// Oura proxy
// ════════════════════════════════════════════════════════════════════════

async function handleOuraProxyAuthed(request, env, session, url) {
  const row = await env.DB.prepare(
    'SELECT token FROM integrations WHERE user_id = ? AND service = ?'
  ).bind(session.user.id, 'oura').first();

  if (!row?.token) {
    return json({ error: 'oura_not_connected', message: 'Settings から Oura PAT を登録してください' }, 403);
  }

  const ouraPath = url.pathname.replace('/api/oura', '');
  const ouraUrl  = `https://api.ouraring.com${ouraPath}${url.search}`;
  const res      = await fetch(ouraUrl, { headers: { Authorization: `Bearer ${row.token}` } });
  const body     = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

async function handleOuraProxyLegacy(request, url) {
  const ouraUrl = 'https://api.ouraring.com' + url.pathname + url.search;
  const res     = await fetch(ouraUrl, {
    headers: { Authorization: request.headers.get('Authorization') || '' }
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization',
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
// AI Review (Gemini)
// ════════════════════════════════════════════════════════════════════════

async function handleAIReview(request, env) {
  if (!env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY not set' }, 500);
  }
  const data   = await request.json();
  const prompt = data.lang === 'en' ? buildPromptEn(data) : buildPrompt(data);

  const gemRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
      })
    }
  );
  const gemData = await gemRes.json();
  if (!gemData.candidates?.[0]?.content?.parts?.[0]?.text) {
    return json({ error: 'gemini_no_candidates', detail: gemData }, 500);
  }
  return new Response(gemData.candidates[0].content.parts[0].text, {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

function buildPrompt(d) {
  return `あなたはパーソナルヘルスコーチです。以下のOura Ringデータを分析し、簡潔な日本語の健康レビューをJSONで返してください。

データ:
- 回復力スコア: ${d.readiness ?? '—'}
- 睡眠スコア: ${d.sleepScore ?? '—'}
- 総睡眠時間: ${d.totalSleep ?? '—'}
- HRV: ${d.hrv ?? '—'} ms
- 安静時心拍: ${d.rhr ?? '—'} bpm
- 活動スコア: ${d.activityScore ?? '—'}
- 歩数: ${d.steps ?? '—'}
- ストレス状態: ${d.stressState ?? '—'}
- 睡眠負債: ${d.sleepDebt ?? '—'}
- 呼吸数: ${d.breathingRate ?? '—'} /min
- SpO2: ${d.spo2 ?? '—'} %

以下の構造のJSONのみを返してください（説明文不要）:
{
  "stateName": "今日の状態を表す短いフレーズ（10文字以内）",
  "chips": [
    {"label": "項目名（8文字以内）", "type": "gr"},
    {"label": "項目名（8文字以内）", "type": "bl"},
    {"label": "項目名（8文字以内）", "type": "nt"}
  ],
  "recommended": ["推奨アクション1（20文字以内）", "推奨アクション2", "推奨アクション3"],
  "avoid": ["避けること1（20文字以内）", "避けること2", "避けること3"],
  "why": "スコアの根拠と解釈を2文で（80文字以内）"
}
chipのtype: "gr"=緑(良好), "bl"=青(要注意), "nt"=ニュートラル, "am"=オレンジ(警告), "rd"=赤(要対処)`;
}

function buildPromptEn(d) {
  return `You are a personal health coach. Analyze the following Oura Ring data and return a concise health review in English as JSON.

Data:
- Readiness score: ${d.readiness ?? '—'}
- Sleep score: ${d.sleepScore ?? '—'}
- Total sleep: ${d.totalSleep ?? '—'}
- HRV: ${d.hrv ?? '—'} ms
- Resting heart rate: ${d.rhr ?? '—'} bpm
- Activity score: ${d.activityScore ?? '—'}
- Steps: ${d.steps ?? '—'}
- Stress state: ${d.stressState ?? '—'}
- Sleep debt: ${d.sleepDebt ?? '—'}
- Breathing rate: ${d.breathingRate ?? '—'} /min
- SpO2: ${d.spo2 ?? '—'} %

Return ONLY this JSON (no extra text):
{
  "stateName": "Short phrase for today's state (max 20 chars)",
  "chips": [
    {"label": "Label (max 10 chars)", "type": "gr"},
    {"label": "Label (max 10 chars)", "type": "bl"},
    {"label": "Label (max 10 chars)", "type": "nt"}
  ],
  "recommended": ["Action 1 (max 30 chars)", "Action 2", "Action 3"],
  "avoid": ["Avoid 1 (max 30 chars)", "Avoid 2", "Avoid 3"],
  "why": "2-sentence explanation (max 120 chars)"
}
chip type: "gr"=green(good), "bl"=blue(caution), "nt"=neutral, "am"=orange(warning), "rd"=red(critical)`;
}

// ════════════════════════════════════════════════════════════════════════
// Utilities
// ════════════════════════════════════════════════════════════════════════

function corsOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

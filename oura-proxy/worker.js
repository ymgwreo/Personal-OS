export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        }
      });
    }

    const url = new URL(request.url);

    // AI Review endpoint
    if (url.pathname === '/ai-review' && request.method === 'POST') {
      return handleAIReview(request, env);
    }

    // Oura proxy (existing)
    const ouraUrl = 'https://api.ouraring.com' + url.pathname + url.search;
    const res = await fetch(ouraUrl, {
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
};

async function handleAIReview(request, env) {
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const data = await request.json();
  const prompt = data.lang === 'en' ? buildPromptEn(data) : buildPrompt(data);

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
      })
    }
  );

  const geminiData = await geminiRes.json();

  if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
    return new Response(JSON.stringify({ error: 'gemini_no_candidates', detail: geminiData }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const text = geminiData.candidates[0].content.parts[0].text;

  return new Response(text, {
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

Return ONLY this JSON structure (no extra text):
{
  "stateName": "Short phrase for today's state (max 20 chars)",
  "chips": [
    {"label": "Label (max 10 chars)", "type": "gr"},
    {"label": "Label (max 10 chars)", "type": "bl"},
    {"label": "Label (max 10 chars)", "type": "nt"}
  ],
  "recommended": ["Action 1 (max 30 chars)", "Action 2", "Action 3"],
  "avoid": ["Avoid 1 (max 30 chars)", "Avoid 2", "Avoid 3"],
  "why": "2-sentence explanation of the scores and interpretation (max 120 chars)"
}

chip type: "gr"=green(good), "bl"=blue(caution), "nt"=neutral, "am"=orange(warning), "rd"=red(critical)`;
}

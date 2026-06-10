/* ═══ STORE ═══ */
const Store = {
  getTasks()        { return JSON.parse(localStorage.getItem('tasks')         || '[]'); },
  setTasks(v)       { localStorage.setItem('tasks',         JSON.stringify(v)); },
  getNotes()        { return JSON.parse(localStorage.getItem('notes')         || '[]'); },
  setNotes(v)       { localStorage.setItem('notes',         JSON.stringify(v)); },
  getJournal()      { return JSON.parse(localStorage.getItem('journal')       || '[]'); },
  setJournal(v)     { localStorage.setItem('journal',       JSON.stringify(v)); },
  getNoteBoard()    { return JSON.parse(localStorage.getItem('os-notes-board') || '[]'); },
  setNoteBoard(v)   { localStorage.setItem('os-notes-board', JSON.stringify(v)); },
  getGoals()        { return JSON.parse(localStorage.getItem('os-goals')       || '[]'); },
  setGoals(v)       { localStorage.setItem('os-goals',       JSON.stringify(v)); },
  getRoutineItems() { return JSON.parse(localStorage.getItem('os-routine-items') || '[]'); },
  setRoutineItems(v){ localStorage.setItem('os-routine-items', JSON.stringify(v)); },
  getRoutineLog()   { return JSON.parse(localStorage.getItem('os-routine-log')   || '{}'); },
  setRoutineLog(v)  { localStorage.setItem('os-routine-log',   JSON.stringify(v)); },
  getManualLog()    { return JSON.parse(localStorage.getItem('os-manual-log')     || '[]'); },
  setManualLog(v)   { localStorage.setItem('os-manual-log',    JSON.stringify(v)); },
  getLibrary()      { return JSON.parse(localStorage.getItem('os-library')         || '{"bookmarks":[],"reading":[],"watching":[]}'); },
  setLibrary(v)     { localStorage.setItem('os-library',         JSON.stringify(v)); },
  getTemplates()    { return JSON.parse(localStorage.getItem('os-templates')       || '[]'); },
  setTemplates(v)   { localStorage.setItem('os-templates',       JSON.stringify(v)); },
  get(key, def)     { const v = localStorage.getItem(key); return v !== null ? v : def; },
  set(key, val)     { localStorage.setItem(key, String(val)); },
  clearAll()        { localStorage.clear(); location.reload(); },
};

/* ═══ DATA MODELS ═══ */
let tasks   = Store.getTasks();
let notes   = Store.getNotes();
let journal = Store.getJournal();

(function seedDemo() {
  if (tasks.length === 0) {
    tasks = [
      { id:'T001', title:'音声入力フロー設計', tags:['Coding'], category:'Coding', priority:'high', status:'todo',       createdAt:new Date().toISOString(), sessions:[] },
      { id:'T002', title:'要件定義をまとめる',  tags:['Coding'], category:'Coding', priority:'med',  status:'done',       createdAt:new Date().toISOString(), sessions:[] },
      { id:'T003', title:'UIモックアップ作成',  tags:['Design'], category:'Design', priority:'high', status:'todo',       createdAt:new Date().toISOString(), sessions:[] },
      { id:'T004', title:'Whisper API 調査',    tags:['Coding'], category:'Coding', priority:'med',  status:'wishlist',   createdAt:new Date().toISOString(), sessions:[] },
      { id:'T005', title:'ドキュメント整理',    tags:['Admin'],  category:'Admin',  priority:'low',  status:'todo',       createdAt:new Date().toISOString(), sessions:[] },
    ];
    Store.setTasks(tasks);
  }
  if (notes.length === 0) {
    notes = [
      { id:'n001', title:'Personal OS 設計メモ', body:'タスクステータスは5段階: Wishlist → Pending → Running → Done → Archive', color:'#D4D0BA', createdAt:'2026-04-22' },
      { id:'n002', title:'英語学習プラン',        body:'毎日50単語。週1回リスニング集中デー。シャドーイングを朝に。',             color:'#C4CCBA', createdAt:'2026-04-21' },
      { id:'n003', title:'Atomic Habits',         body:'習慣はアイデンティティの変化。1%の改善が複利で効く。環境設計が最重要。', color:'#CCBCB8', createdAt:'2026-04-20' },
    ];
    Store.setNotes(notes);
  }
  if (journal.length === 0) {
    journal = [
      { id:'j001', time:'09:14', source:'Voice', tag:'Think', text:'音声入力を起点に内容を分類するフローを考えていた。AIが決めるのではなく、ユーザーが確認するステップが絶対必要。タスクとジャーナルを分断しない設計。' },
      { id:'j002', time:'11:20', source:'Text',  tag:'Idea',  text:'Ganttチャートで「今どのタスクが走っているか」を視覚的に確認できるのが大事。週次で俯瞰できる設計にしたい。' },
      { id:'j003', time:'13:45', source:'Text',  tag:'Note',  text:'Daily Habitのチェックボックスは毎日0:00で自動リセットされる設計が良い。継続率の可視化も欲しい。' },
    ];
    Store.setJournal(journal);
  }
})();

/* NAV */
const pageCfg = {
  home:      { title:'Personal OS', pills:[] },
  tasks:     { title:'Tasks',       pills:['Today','All','Archive'] },
  calendar:  { title:'Calendar',    pills:[] },
  health:    { title:'Health',      pills:[] },
  journal:   { title:'Journal',     pills:['Stream','Notes','Knowledge'] },
  analytics: { title:'Analytics',   pills:['Weekly','Tags','Trends','AI Review'] },
  notes:     { title:'Notes Board', pills:[] },
  goals:     { title:'Goals / OKR', pills:[] },
  routine:   { title:'Routine',     pills:[] },
  log:       { title:'Manual Log',  pills:[] },
  library:   { title:'Library',     pills:[] },
  settings:  { title:'Settings',    pills:[] },
};

function setPeriod(el) {
  const grp = el.closest('.period-grp');
  grp.querySelectorAll('.pb').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

/* ── Health Widget Grid ── */
let _hwEdit = false;
let _hwDrag = null;
let _hwColW = 0;
let _hwRowH = 180;
let _hwGap  = 1;

const HW_SIZE = {
  xs:{cols:1,rows:1}, sm:{cols:2,rows:1},
  md:{cols:4,rows:2}, lg:{cols:6,rows:3}, xl:{cols:8,rows:2}
};

// Default col/row start positions for each widget (8-column grid)
const HW_DEFAULT_POS = {
  'hw-score':         {col:1, row:1},
  'hw-hrv-kpi':       {col:2, row:1},
  'hw-readiness-kpi': {col:3, row:1},
  'hw-activity':      {col:4, row:1},
  'hw-ring':          {col:5, row:1},
  'hw-hrv-trend':     {col:6, row:1},
  'hw-temp':          {col:7, row:1},
  'hw-calories':      {col:8, row:1},
  'hw-timeline':      {col:1, row:2},  // MD = 4col × 2row (left half, paired with Duration)
  'hw-duration':      {col:5, row:2},  // MD = 4col × 2row (right half, paired with Timeline)
  'hw-ai':            {col:1, row:4},  // XL = 8col × 2row
  'hw-steps':         {col:1, row:6}   // XS = 1col × 1row (below AI Review)
};

function hwSpanFromSize(size) { return HW_SIZE[size] || {cols:2,rows:1}; }
function hwSizeFromSpan(cols, rows) {
  for (const [k,v] of Object.entries(HW_SIZE)) { if (v.cols===cols && v.rows===rows) return k; }
  return null;
}

// Apply explicit grid position + size (uses col/row start + span)
function applyHwPos(hw, col, row, cols, rows) {
  hw.style.gridColumn = col + ' / span ' + cols;
  hw.style.gridRow    = row + ' / span ' + rows;
  hw.dataset.col  = col;
  hw.dataset.row  = row;
  hw.dataset.cols = cols;
  hw.dataset.rows = rows;
  const named = hwSizeFromSpan(cols, rows);
  hw.querySelectorAll('.hw-sz').forEach(b =>
    b.classList.toggle('on', !!named && b.textContent.toLowerCase() === named)
  );
}

// Calculate grid cell (1-based) from mouse position
function hwCellFromPoint(grid, clientX, clientY) {
  const rect = grid.getBoundingClientRect();
  const relX  = clientX - rect.left;
  const relY  = clientY - rect.top + grid.scrollTop;
  return {
    col: Math.max(1, Math.floor(relX / (_hwColW + _hwGap)) + 1),
    row: Math.max(1, Math.floor(relY / (_hwRowH + _hwGap)) + 1)
  };
}

// Show/hide drop ghost (a grid child that shows target position)
function hwShowGhost(col, row, cols, rows) {
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return;
  let g = document.getElementById('hw-ghost');
  if (!g) { g = document.createElement('div'); g.id = 'hw-ghost'; grid.appendChild(g); }
  const c = Math.max(1, Math.min(9 - cols, col));
  const r = Math.max(1, row);
  g.style.gridColumn = c + ' / span ' + cols;
  g.style.gridRow    = r + ' / span ' + rows;
  g.style.display    = '';
  g.dataset.col = c; g.dataset.row = r;
}
function hwHideGhost() {
  const g = document.getElementById('hw-ghost');
  if (g) g.style.display = 'none';
}

// Find widget that overlaps the given cell rect (used for drag preview)
function hwFindSwapTarget(hw, col, row, cols, rows) {
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return null;
  const c = Math.max(1, Math.min(9 - cols, col));
  const r = Math.max(1, row);
  for (const other of grid.querySelectorAll('.hw')) {
    if (other === hw) continue;
    const oc = parseInt(other.dataset.col)||1, or_ = parseInt(other.dataset.row)||1;
    const os = parseInt(other.dataset.cols)||1, ot = parseInt(other.dataset.rows)||1;
    if (oc < c + cols && oc + os > c && or_ < r + rows && or_ + ot > r) return other;
  }
  return null;
}

// Place widget at cell position; swap if another widget occupies that space
function hwPlaceWidget(hw, col, row) {
  const cols = parseInt(hw.dataset.cols) || 1;
  const rows = parseInt(hw.dataset.rows) || 1;
  const c = Math.max(1, Math.min(9 - cols, col));
  const r = Math.max(1, row);
  const grid = document.getElementById('health-grid-daily');
  let swapWith = null;
  for (const other of grid.querySelectorAll('.hw')) {
    if (other === hw) continue;
    const oc = parseInt(other.dataset.col)||1, or_ = parseInt(other.dataset.row)||1;
    const os = parseInt(other.dataset.cols)||1, ot = parseInt(other.dataset.rows)||1;
    if (oc < c + cols && oc + os > c && or_ < r + rows && or_ + ot > r) { swapWith = other; break; }
  }
  if (swapWith) {
    applyHwPos(swapWith, parseInt(hw.dataset.col)||1, parseInt(hw.dataset.row)||1,
               parseInt(swapWith.dataset.cols)||1, parseInt(swapWith.dataset.rows)||1);
  }
  applyHwPos(hw, c, r, cols, rows);
}

function updateHwGridMetrics() {
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return;
  _hwColW = (grid.offsetWidth - 7 * _hwGap) / 8;
  _hwRowH = Math.round(_hwColW * 0.72);
  grid.style.gridAutoRows = _hwRowH + 'px';
}

// Combined init: drag (mousedown on .hw-controls) + resize (mousedown on .hw-resize-handle)
function initHwInteract() {
  const grid = document.getElementById('health-grid-daily');
  if (!grid || grid._interactInited) return;
  grid._interactInited = true;

  grid.addEventListener('mousedown', function(e) {
    // ── RESIZE ──
    const handle = e.target.closest('.hw-resize-handle');
    if (handle && _hwEdit) {
      e.preventDefault(); e.stopPropagation();
      const hw = handle.closest('.hw');
      if (!hw) return;
      const sx = e.clientX, sy = e.clientY;
      const sc = parseInt(hw.dataset.cols) || hwSpanFromSize(hw.dataset.size||'sm').cols;
      const sr = parseInt(hw.dataset.rows) || hwSpanFromSize(hw.dataset.size||'sm').rows;
      function onMove(ev) {
        const nc = Math.max(1, Math.min(6, Math.round(sc + (ev.clientX-sx) / (_hwColW + _hwGap))));
        const nr = Math.max(1, Math.min(6, Math.round(sr + (ev.clientY-sy) / (_hwRowH + _hwGap))));
        applyHwPos(hw, parseInt(hw.dataset.col)||1, parseInt(hw.dataset.row)||1, nc, nr);
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        saveHwLayout();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      return;
    }

    // ── DRAG ──
    const controls = e.target.closest('.hw-controls');
    if (!controls || !_hwEdit) return;
    e.preventDefault();
    const hw = controls.closest('.hw');
    if (!hw) return;
    _hwDrag = hw;
    hw.classList.add('hw-dragging');
    const sc2 = parseInt(hw.dataset.cols)||1, sr2 = parseInt(hw.dataset.rows)||1;
    // Show ghost at current position immediately
    hwShowGhost(parseInt(hw.dataset.col)||1, parseInt(hw.dataset.row)||1, sc2, sr2);
    function clearSwapHint() {
      grid.querySelectorAll('.hw.hw-swap-hint').forEach(el => el.classList.remove('hw-swap-hint'));
    }
    function onMove(ev) {
      const cell = hwCellFromPoint(grid, ev.clientX, ev.clientY);
      hwShowGhost(cell.col, cell.row, sc2, sr2);
      clearSwapHint();
      const swap = hwFindSwapTarget(hw, cell.col, cell.row, sc2, sr2);
      if (swap) swap.classList.add('hw-swap-hint');
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      clearSwapHint();
      const g = document.getElementById('hw-ghost');
      const tc = g ? (parseInt(g.dataset.col)||1) : (parseInt(hw.dataset.col)||1);
      const tr = g ? (parseInt(g.dataset.row)||1) : (parseInt(hw.dataset.row)||1);
      hwPlaceWidget(hw, tc, tr);
      hw.classList.remove('hw-dragging');
      hwHideGhost();
      _hwDrag = null;
      saveHwLayout();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  window.addEventListener('resize', updateHwGridMetrics);
}

function toggleHwEdit() {
  _hwEdit = !_hwEdit;
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return;
  grid.classList.toggle('hw-edit', _hwEdit);
  const btn = document.getElementById('hw-edit-btn');
  if (btn) {
    btn.textContent = _hwEdit ? 'Done' : 'Edit Layout';
    btn.style.color = _hwEdit ? 'var(--am)' : '';
    btn.style.fontWeight = _hwEdit ? '700' : '';
  }
  if (!_hwEdit) saveHwLayout();
}

function setHwSize(btn, size) {
  const hw = btn.closest('.hw');
  if (!hw) return;
  ['hw-xs','hw-sm','hw-md','hw-lg','hw-xl'].forEach(c => hw.classList.remove(c));
  hw.classList.add('hw-' + size);
  hw.dataset.size = size;
  const {cols, rows} = hwSpanFromSize(size);
  applyHwPos(hw, parseInt(hw.dataset.col)||1, parseInt(hw.dataset.row)||1, cols, rows);
}

function saveHwLayout() {
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return;
  const layout = Array.from(grid.querySelectorAll('.hw')).map(hw => ({
    id:   hw.dataset.wid,
    col:  parseInt(hw.dataset.col)  || 1,
    row:  parseInt(hw.dataset.row)  || 1,
    cols: parseInt(hw.dataset.cols) || 1,
    rows: parseInt(hw.dataset.rows) || 1
  }));
  try { localStorage.setItem('hw-layout-v4', JSON.stringify(layout)); } catch(e) {}
}

function loadHwLayout() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem('hw-layout-v4')); } catch(e) {}
  const grid = document.getElementById('health-grid-daily');
  if (!grid) return;
  if (saved && saved.length && saved[0].col !== undefined) {
    saved.forEach(item => {
      const el = grid.querySelector(`[data-wid="${item.id}"]`);
      if (el) applyHwPos(el, item.col||1, item.row||1, item.cols||1, item.rows||1);
    });
  } else {
    // First load: apply default positions from HW_DEFAULT_POS
    grid.querySelectorAll('.hw').forEach(hw => {
      const pos = HW_DEFAULT_POS[hw.dataset.wid] || {col:1, row:1};
      const {cols, rows} = hwSpanFromSize(hw.dataset.size || 'sm');
      applyHwPos(hw, pos.col, pos.row, cols, rows);
    });
  }
}

// Stub legacy HTML event handlers (harmless, no-ops)
function hwDragStart(e,el){ e.preventDefault(); }
function hwDragOver(e,el) {}
function hwDragLeave(el)  {}
function hwDrop(e,el)     { e.preventDefault(); }
function hwDragEnd(el)    {}

/* ══════════════════════════════
   OURA INTEGRATION
══════════════════════════════ */
const WORKER_BASE = 'https://muddy-boat-633b.nxoxo-l-l-leo.workers.dev';
const OURA_BASE   = `${WORKER_BASE}/v2/usercollection`;  // legacy (PAT in header)
const OURA_AUTH   = `${WORKER_BASE}/api/oura/v2/usercollection`;  // session-based

/* ── Session management ── */
function posSession()    { return localStorage.getItem('pos-session') || ''; }
function posAuthHeader() { const s = posSession(); return s ? { Authorization: `Bearer ${s}` } : {}; }

async function posCheckAuth() {
  const tok = posSession();
  if (!tok) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/auth/me`, { headers: posAuthHeader() });
    if (!res.ok) { localStorage.removeItem('pos-session'); return null; }
    return (await res.json()).user;
  } catch { return null; }
}

function posLogin() {
  const w = 480, h = 600;
  const left = Math.round((screen.width  - w) / 2);
  const top  = Math.round((screen.height - h) / 2);
  window.open(`${WORKER_BASE}/auth/google`, 'pos-auth',
    `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`);
  window.addEventListener('message', function onMsg(e) {
    if (e.data?.type !== 'pos-auth') return;
    window.removeEventListener('message', onMsg);
    localStorage.setItem('pos-session', e.data.session);
    // Auto-migrate localStorage PAT → D1
    const localTok = localStorage.getItem('oura-pat');
    if (localTok) {
      fetch(`${WORKER_BASE}/api/integrations/oura`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${e.data.session}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: localTok })
      }).then(r => { if (r.ok) localStorage.removeItem('oura-pat'); });
    }
    afterLogin();
  });
}

function lgShowStep(step, errorMsg = '') {
  document.getElementById('lg-step-google').style.display = step === 'google' ? '' : 'none';
  document.getElementById('lg-step-oura').style.display  = step === 'oura'   ? '' : 'none';
  const errEl = document.getElementById('lg-oura-error');
  if (errEl) { errEl.textContent = errorMsg; errEl.style.display = errorMsg ? 'block' : 'none'; }
  const gate = document.getElementById('login-gate');
  if (gate) gate.style.display = 'flex';
}

function lgHide() {
  const gate = document.getElementById('login-gate');
  if (gate) gate.style.display = 'none';
}

async function afterLogin(showToast = true) {
  sRefreshAccountStatus();
  try {
    const res = await fetch(`${WORKER_BASE}/api/integrations`, { headers: posAuthHeader() });
    if (res.ok) {
      const { integrations } = await res.json();
      if (integrations.find(i => i.service === 'oura' && i.connected)) {
        localStorage.setItem('pos-fully-setup', '1');
        lgHide();
        if (showToast) toast('ログインしました');
        return;
      }
      // Oura not in D1 → ask for PAT
      lgShowStep('oura');
      return;
    }
  } catch {}
  // Network error or unexpected response → let user in, Health will handle Oura if needed
  localStorage.setItem('pos-fully-setup', '1');
  lgHide();
  if (showToast) toast('ログインしました');
}

async function lgConnectOura() {
  const input = document.getElementById('lg-oura-input');
  const tok   = input?.value.trim().replace(/[^\x00-\xFF]/g, '');
  if (!tok) { lgShowStep('oura', 'トークンを入力してください'); return; }
  const res = await fetch(`${WORKER_BASE}/api/integrations/oura`, {
    method: 'POST',
    headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tok })
  }).catch(() => null);
  if (!res?.ok) {
    lgShowStep('oura', `保存失敗 (${res?.status ?? 'network'}) — もう一度試してください`);
    return;
  }
  localStorage.setItem('pos-fully-setup', '1');
  lgHide();
  toast('Oura 接続完了');
  sRefreshAccountStatus();
}

function posLogout() {
  fetch(`${WORKER_BASE}/auth/logout`, { method: 'POST', headers: posAuthHeader() }).catch(() => {});
  localStorage.removeItem('pos-session');
  localStorage.removeItem('pos-fully-setup');
  lgShowStep('google');
  toast('ログアウトしました');
  sRefreshAccountStatus();
}

/* ── Oura token check (truthy = can fetch data) ── */
function ouraToken() {
  return posSession() || localStorage.getItem('oura-pat') || '';
}

async function ouraGet(endpoint, params = {}) {
  const session  = posSession();
  const localTok = localStorage.getItem('oura-pat') || '';
  if (!session && !localTok) { const e = new Error('NO_TOKEN'); e.code = 'NO_TOKEN'; throw e; }

  const base    = session ? OURA_AUTH : OURA_BASE;
  const headers = session ? { Authorization: `Bearer ${session}` }
                          : { Authorization: `Bearer ${localTok}` };

  const url = new URL(`${base}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const r = await fetch(url.toString(), { headers });
  if (r.status === 401) {
    const e = new Error('INVALID_TOKEN'); e.code = 'INVALID_TOKEN'; throw e;
  }
  if (r.status === 403) {
    // Oura PAT not yet saved in D1 for this account
    const e = new Error('NO_TOKEN'); e.code = 'NO_TOKEN'; throw e;
  }
  if (!r.ok) throw new Error(`OURA_HTTP_${r.status}`);
  return r.json();
}

function hCacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch{}
}
function hCacheGet(key, ttl = 30*60*1000) {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    if (!raw || Date.now() - raw.t > ttl) return null;
    return raw.d;
  } catch { return null; }
}

function hFmt(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function hTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('ja-JP', { hour:'2-digit', minute:'2-digit' });
}
function hPrev(dateStr, n = 1) {
  const d = new Date(dateStr); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function hTxt(id, v) { const e = document.getElementById(id); if (e) e.textContent = (v == null ? '—' : String(v)); }
function hStyle(id, prop, val) { const e = document.getElementById(id); if (e) e.style[prop] = val; }

async function ouraLoadDay(dateStr) {
  const key = `oura-day-${dateStr}`;
  const cached = hCacheGet(key);
  if (cached) return cached;
  const prev = hPrev(dateStr);
  const [rd, ds, sl, ac] = await Promise.all([
    ouraGet('daily_readiness', { start_date: dateStr, end_date: dateStr }),
    ouraGet('daily_sleep',     { start_date: dateStr, end_date: dateStr }),
    ouraGet('sleep',           { start_date: prev,    end_date: dateStr }),
    ouraGet('daily_activity',  { start_date: dateStr, end_date: dateStr }),
  ]);
  const sleepItems = (sl.data || []).filter(s => s.day === dateStr);
  const longSleep = sleepItems.find(s => s.type === 'long_sleep')
    || sleepItems.sort((a,b) => (b.total_sleep_duration||0) - (a.total_sleep_duration||0))[0]
    || null;
  const data = {
    readiness:  rd.data?.[0]  || null,
    dailySleep: ds.data?.[0]  || null,
    sleep:      longSleep,
    activity:   ac.data?.[0]  || null,
  };
  hCacheSet(key, data);
  return data;
}

async function ouraLoadWeek(endStr) {
  const key = `oura-week-${endStr}`;
  const cached = hCacheGet(key);
  if (cached) return cached;
  const startStr = hPrev(endStr, 6);
  const [rd, ds, ac] = await Promise.all([
    ouraGet('daily_readiness', { start_date: startStr, end_date: endStr }),
    ouraGet('daily_sleep',     { start_date: startStr, end_date: endStr }),
    ouraGet('daily_activity',  { start_date: startStr, end_date: endStr }),
  ]);
  const data = { readiness: rd.data||[], sleep: ds.data||[], activity: ac.data||[], startStr };
  hCacheSet(key, data);
  return data;
}

async function ouraLoadMonth(endStr) {
  const key = `oura-month-${endStr}`;
  const cached = hCacheGet(key, 2*60*60*1000);
  if (cached) return cached;
  const startStr = hPrev(endStr, 29);
  const [rd, ds, ac, sl] = await Promise.all([
    ouraGet('daily_readiness', { start_date: startStr, end_date: endStr }),
    ouraGet('daily_sleep',     { start_date: startStr, end_date: endStr }),
    ouraGet('daily_activity',  { start_date: startStr, end_date: endStr }),
    ouraGet('sleep',           { start_date: startStr, end_date: endStr }),
  ]);
  const data = {
    readiness: rd.data||[], sleep: ds.data||[], activity: ac.data||[],
    sleepDetail: sl.data||[], startStr,
  };
  hCacheSet(key, data);
  return data;
}

function hStateName(score) {
  if (!score) return '— No Data';
  if (score >= 85) return 'Optimal Performance Day';
  if (score >= 70) return 'Good Recovery Day';
  if (score >= 55) return 'Moderate Recovery';
  return 'Rest & Restore Day';
}

function hStateTags(data) {
  const tags = [];
  const r = data.readiness; const sl = data.sleep;
  if (!r) return tags;
  if ((r.contributors?.hrv_balance||100) < 70) tags.push({l:'HRV watch',c:'bl'});
  if ((r.temperature_deviation||0) > 0.5) tags.push({l:'Elevated temp',c:'am'});
  if (sl?.deep_sleep_duration > 7200) tags.push({l:'Deep sleep ↑',c:'gr'});
  if ((r.contributors?.activity_balance||100) < 60) tags.push({l:'Low activity',c:'nt'});
  if (!tags.length) tags.push({l:'Stable', c:'gr'});
  return tags;
}

function hRecs(data) {
  const s = data.readiness?.score || 0;
  const hrv = data.readiness?.contributors?.hrv_balance || 100;
  const ok = [], ng = [];
  if (s >= 80) { ok.push('Focus work'); ok.push(hrv >= 70 ? 'Moderate exercise' : 'Light walk (30m)'); ok.push('Sleep by 23:00'); }
  else if (s >= 65) { ok.push('Focus work'); ok.push('Light walk (30m)'); ok.push('Early sleep'); }
  else { ok.push('Light stretch'); ok.push('Rest'); ok.push('Early sleep (22:30)'); }
  ng.push('Caffeine after 14:00'); ng.push('Late-night screens');
  if (s < 80 || hrv < 70) ng.push('High intensity training');
  return { ok: ok.slice(0,3), ng: ng.slice(0,3) };
}

function hWhyText(data) {
  const r = data.readiness; const sl = data.sleep;
  const parts = [];
  if (r) {
    const hrv = r.contributors?.hrv_balance;
    if (hrv && hrv < 70) parts.push(`HRV バランス ${hrv}/100`);
    const dev = r.temperature_deviation;
    if (dev != null && Math.abs(dev) > 0.2) parts.push(`体温偏差 ${dev>0?'+':''}${dev.toFixed(1)}°C`);
  }
  if (sl) {
    if (sl.deep_sleep_duration > 7200) parts.push(`深い睡眠 ${hFmt(sl.deep_sleep_duration)} · 良好`);
    else if (sl.deep_sleep_duration > 0 && sl.deep_sleep_duration < 3600) parts.push(`深い睡眠 ${hFmt(sl.deep_sleep_duration)} · 不足`);
    if (sl.average_hrv) parts.push(`HRV ${Math.round(sl.average_hrv)} ms`);
  }
  return parts.join(' · ') || '各指標は正常範囲内です。';
}

function hAiText(data) {
  const rd = data.readiness; const ds = data.dailySleep; const sl = data.sleep; const ac = data.activity;
  const parts = [];
  if (ds?.score) parts.push(`睡眠スコア ${ds.score}`);
  if (rd?.score) parts.push(`レディネス ${rd.score}`);
  if (sl?.deep_sleep_duration > 7200) parts.push('深睡眠が良好');
  if (sl?.average_hrv) parts.push(`HRV ${Math.round(sl.average_hrv)} ms`);
  if (rd?.contributors?.hrv_balance < 70) parts.push('HRV バランス低め — 回復優先を');
  const dev = rd?.temperature_deviation;
  if (dev != null && Math.abs(dev) > 0.3) parts.push(`体温偏差 ${dev>0?'+':''}${dev.toFixed(1)}°C`);
  if (ac?.steps) parts.push(`歩数 ${ac.steps.toLocaleString()}`);
  return parts.length ? parts.join('。') + '。' : 'データを取得できませんでした。';
}

function hRenderDay(data) {
  const today = new Date();
  hTxt('h-today-date', today.toLocaleDateString('ja-JP', {month:'short',day:'numeric',weekday:'short'}));

  // Today's State
  hTxt('h-state-name', hStateName(data.readiness?.score));
  const tagsEl = document.getElementById('h-state-tags');
  if (tagsEl) tagsEl.innerHTML = hStateTags(data).map(t =>
    `<span class="h-chip ${t.c}">${t.l}</span>`).join('');

  const {ok, ng} = hRecs(data);
  const recOk = document.getElementById('h-rec-ok');
  const recNg = document.getElementById('h-rec-ng');
  if (recOk) recOk.innerHTML = ok.map(r => `<div class="h-action ok"><span class="h-action-icon">+</span>${r}</div>`).join('');
  if (recNg) recNg.innerHTML = ng.map(r => `<div class="h-action ng"><span class="h-action-icon">−</span>${r}</div>`).join('');
  hTxt('h-why', hWhyText(data));
  hTxt('h-ai-text', hAiText(data));
  hTxt('h-ai-date', today.toLocaleDateString('ja-JP', {month:'short',day:'numeric'}) + ' · ' + today.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}));

  // Readiness
  const rd = data.readiness;
  if (rd) {
    hTxt('h-rd-score', rd.score);
    hTxt('h-rd-ring-n', rd.score);
    hTxt('h-rd-sub', rd.score>=85?'Optimal':rd.score>=70?'Recovered · Stable':rd.score>=55?'Moderate':'Low · Rest needed');
    const circ = 131.9;
    const ringEl = document.getElementById('h-rd-ring');
    if (ringEl) ringEl.setAttribute('stroke-dashoffset', (circ*(1-(rd.score||0)/100)).toFixed(1));
    const c = rd.contributors || {};
    const bars = [['h-bar-act-bal','h-bar-act-bal-v',c.activity_balance,'var(--gr)'],
                  ['h-bar-hrv-bal','h-bar-hrv-bal-v',c.hrv_balance,'var(--bl)'],
                  ['h-bar-rhr',    'h-bar-rhr-v',    c.resting_heart_rate,'var(--am)'],
                  ['h-bar-rec',    'h-bar-rec-v',    c.recovery_index,'var(--tl)']];
    bars.forEach(([fillId, valId, val, color]) => {
      hStyle(fillId, 'width', `${val||0}%`); hStyle(fillId, 'background', color);
      hTxt(valId, val);
    });
  }

  // Sleep
  const ds = data.dailySleep; const sl = data.sleep;
  if (ds) {
    hTxt('h-sl-score', ds.score);
    hTxt('h-sl-sub', ds.score>=85?'Excellent':ds.score>=70?'Good':ds.score>=55?'Fair':'Poor');
  }
  if (sl) {
    hTxt('h-sl-total', hFmt(sl.total_sleep_duration));
    hTxt('h-sl-bed',  hTime(sl.bedtime_start));
    hTxt('h-sl-wake', hTime(sl.bedtime_end));
    hTxt('h-sl-eff',  sl.efficiency ? `${sl.efficiency}%` : '—');
    hTxt('h-sl-deep-v', hFmt(sl.deep_sleep_duration));
    hTxt('h-sl-rem-v',  hFmt(sl.rem_sleep_duration));
    hTxt('h-sl-lt-v',   hFmt(sl.light_sleep_duration));
    const total = sl.total_sleep_duration || 1;
    const segs = [['h-sl-awk',sl.awake_time],['h-sl-lt',sl.light_sleep_duration],
                  ['h-sl-rem',sl.rem_sleep_duration],['h-sl-deep',sl.deep_sleep_duration]];
    segs.forEach(([id, sec]) => hStyle(id, 'flex', String(sec||0)));
  }

  // Activity
  const ac = data.activity;
  if (ac) {
    hTxt('h-ac-score', ac.score);
    hTxt('h-ac-steps', ac.steps ? ac.steps.toLocaleString() : '—');
    hTxt('h-ac-cal', ac.active_calories ? `${ac.active_calories} kcal` : '— kcal');
    hStyle('h-ac-steps-bar', 'width', `${Math.min(100,((ac.steps||0)/10000)*100)}%`);
    hStyle('h-ac-cal-bar',   'width', `${Math.min(100,((ac.active_calories||0)/600)*100)}%`);
    const badgesEl = document.getElementById('h-ac-badges');
    if (badgesEl && (ac.high_activity_time || ac.medium_activity_time)) {
      const badges = [];
      if (ac.high_activity_time)   badges.push(`<span class="tag" style="background:rgba(46,122,110,0.1);color:var(--tl)">High ${hFmt(ac.high_activity_time)}</span>`);
      if (ac.medium_activity_time) badges.push(`<span class="tag" style="background:rgba(78,126,200,0.1);color:var(--bl)">Med ${hFmt(ac.medium_activity_time)}</span>`);
      badgesEl.innerHTML = badges.join('');
    }
  }

  // HRV & Body
  if (sl) {
    hTxt('h-hrv-val', sl.average_hrv ? Math.round(sl.average_hrv) : '—');
    hTxt('h-hrv-rhr', sl.lowest_heart_rate || '—');
  }
  if (rd) {
    const dev = rd.temperature_deviation;
    const tempEl = document.getElementById('h-hrv-temp');
    if (tempEl) {
      tempEl.textContent = dev != null ? `${dev>0?'+':''}${dev.toFixed(1)}°C` : '—';
      tempEl.style.color = dev == null ? 'var(--t1)' : Math.abs(dev) > 0.5 ? 'var(--am)' : 'var(--gr)';
    }
    hTxt('h-hrv-temp-sub', dev != null ? (Math.abs(dev)<=0.3?'正常範囲内':dev>0?'わずかに上昇':'わずかに低下') : '—');
  }
}

function hRenderWeek(data) {
  const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
  const rdMap = {}, slMap = {}, acMap = {};
  (data.readiness||[]).forEach(r => rdMap[r.day] = r);
  (data.sleep||[]).forEach(s => slMap[s.day] = s);
  (data.activity||[]).forEach(a => acMap[a.day] = a);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }

  const tbody = document.getElementById('h-week-tbody');
  if (tbody) tbody.innerHTML = days.map((day, i) => {
    const rd = rdMap[day], sl = slMap[day], ac = acMap[day];
    const isToday = i === days.length - 1;
    const label = `${parseInt(day.slice(5,7))}/${parseInt(day.slice(8,10))}${isToday?' · today':''}`;
    return `<tr${i%2===0?' style="background:rgba(0,0,0,0.02)"':''}>
      <td style="padding:4px 0;color:${isToday?'var(--am)':'var(--t2)'}${isToday?';font-weight:500':''}">${label}</td>
      <td style="text-align:center">${sl?.score??'—'}</td>
      <td style="text-align:center;color:var(--bl)">${rd?.contributors?.hrv_balance??'—'}</td>
      <td style="text-align:center;color:var(--gr)">${rd?.score??'—'}</td>
      <td style="text-align:center">${ac?.score??'—'}</td>
      <td style="text-align:center;color:var(--t3)">${ac?.steps?ac.steps.toLocaleString():'—'}</td>
    </tr>`;
  }).join('');

  const rdScores = Object.values(rdMap).map(r=>r.score).filter(Boolean);
  const slScores = Object.values(slMap).map(s=>s.score).filter(Boolean);
  const acScores = Object.values(acMap).map(a=>a.score).filter(Boolean);
  const stepArr  = Object.values(acMap).map(a=>a.steps).filter(Boolean);
  hTxt('h-w-sl',    avg(slScores));
  hTxt('h-w-rd',    avg(rdScores));
  hTxt('h-w-ac',    avg(acScores));
  hTxt('h-w-steps', stepArr.length ? Math.round(avg(stepArr)).toLocaleString() : '—');
}

function hRenderMonth(data) {
  const avg  = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
  const sum  = arr => arr.reduce((a,b)=>a+b,0);
  const slScores = (data.sleep||[]).map(s=>s.score).filter(Boolean);
  const rdScores = (data.readiness||[]).map(r=>r.score).filter(Boolean);
  const acScores = (data.activity||[]).map(a=>a.score).filter(Boolean);
  const stepArr  = (data.activity||[]).map(a=>a.steps).filter(Boolean);
  const hrvArr   = (data.sleepDetail||[]).filter(s=>s.type==='long_sleep').map(s=>s.average_hrv).filter(Boolean);

  hTxt('h-m-sl',    avg(slScores));
  hTxt('h-m-rd',    avg(rdScores));
  hTxt('h-m-ac',    avg(acScores));
  hTxt('h-m-steps', stepArr.length ? Math.round(avg(stepArr)).toLocaleString() : '—');
  hTxt('h-m-best-sl', slScores.length ? Math.max(...slScores) : '—');
  hTxt('h-m-best-rd', rdScores.length ? Math.max(...rdScores) : '—');
  hTxt('h-m-avg-hrv', hrvArr.length ? Math.round(avg(hrvArr))+'ms' : '—');
  hTxt('h-m-total-steps', stepArr.length ? sum(stepArr).toLocaleString() : '—');

  buildSp('h-m-sl-sp', slScores, 'var(--tl)');
  buildSp('h-m-rd-sp', rdScores, 'var(--gr)');

  const startLabel = data.startStr ? `${parseInt(data.startStr.slice(5,7))}/${parseInt(data.startStr.slice(8,10))}` : '—';
  hTxt('h-m-sp-start',  startLabel);
  hTxt('h-m-sp-start2', startLabel);
}

function hShowState(state) {
  const map = { setup:'flex', loading:'flex', error:'flex', content:'block' };
  ['h-setup','h-loading','h-error','h-content'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = id.replace('h-','');
    el.style.display = key === state ? (map[key]||'block') : 'none';
  });
}

async function initHealthView() {
  if (!ouraToken()) { hShowState('setup'); return; }
  hShowState('loading');
  // Reset to Daily
  document.querySelectorAll('.hpb').forEach((b,i) => b.classList.toggle('on', i===0));
  ['h-daily','h-weekly','h-monthly'].forEach((id,i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = i===0 ? 'flex' : 'none';
  });
  try {
    const today = new Date().toISOString().slice(0,10);
    const data = await ouraLoadDay(today);
    hRenderDay(data);
    hShowState('content');
  } catch(e) {
    console.error('Health init:', e);
    const msgs = { NO_TOKEN: '— トークン未設定', INVALID_TOKEN: 'トークンが無効です。設定を確認してください。' };
    if (e.code === 'NO_TOKEN') { hShowState('setup'); return; }
    const msgEl = document.getElementById('h-error-msg');
    if (msgEl) msgEl.textContent = msgs[e.code] || `取得失敗: ${e.message}`;
    hShowState('error');
  }
}

async function syncOura(force = false) {
  if (force) {
    const today = new Date().toISOString().slice(0,10);
    ['day','week','month'].forEach(t => localStorage.removeItem(`oura-${t}-${today}`));
  }
  await initHealth();
}

function hSaveToken() {
  const input = document.getElementById('h-token-input');
  const tok   = input?.value.trim().replace(/[^\x00-\xFF]/g, '');
  if (!tok) return;
  const session = posSession();
  if (session) {
    fetch(`${WORKER_BASE}/api/integrations/oura`, {
      method:  'POST',
      headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: tok })
    }).then(r => r.ok && toast('Oura 接続完了（アカウントに保存）'));
  } else {
    localStorage.setItem('oura-pat', tok);
  }
  initHealthView();
}
function hClearToken() {
  localStorage.removeItem('oura-pat');
  const session = posSession();
  if (session) {
    fetch(`${WORKER_BASE}/api/integrations/oura`, { method: 'DELETE', headers: posAuthHeader() });
  }
  const si = document.getElementById('s-oura-token');
  if (si) si.value = '';
  hShowState('setup');
  sRefreshOuraStatus();
}
async function sSaveOuraToken() {
  const input = document.getElementById('s-oura-token');
  const tok   = input?.value.trim().replace(/[^\x00-\xFF]/g, '');
  if (!tok) return;
  const session = posSession();
  if (session) {
    const res = await fetch(`${WORKER_BASE}/api/integrations/oura`, {
      method:  'POST',
      headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: tok })
    });
    toast(res.ok ? 'Oura トークンをアカウントに保存しました' : '保存失敗');
  } else {
    localStorage.setItem('oura-pat', tok);
    toast('Oura トークンを保存しました（ローカル）');
  }
  sRefreshOuraStatus();
}
async function sRefreshOuraStatus() {
  const el = document.getElementById('s-oura-status');
  if (!el) return;
  const session = posSession();
  if (session) {
    try {
      const res  = await fetch(`${WORKER_BASE}/api/integrations`, { headers: posAuthHeader() });
      const data = res.ok ? await res.json() : null;
      const oura = data?.integrations?.find(i => i.service === 'oura');
      el.innerHTML = oura?.connected
        ? '<span style="color:var(--gr)">接続済み（アカウント）</span>'
        : '<span style="color:var(--t3)">未接続</span>';
      return;
    } catch {}
  }
  const tok = localStorage.getItem('oura-pat') || '';
  el.innerHTML = tok
    ? `<span style="color:var(--gr)">接続済み（ローカル） <span style="font-size:8px">${tok.slice(0,10)}…</span></span>`
    : '<span style="color:var(--t3)">未接続</span>';
  const si = document.getElementById('s-oura-token');
  if (si && tok) si.placeholder = '再設定する場合は入力';
}
async function sRefreshAccountStatus() {
  const el   = document.getElementById('s-account-status');
  if (!el) return;
  const user = await posCheckAuth();
  if (user) {
    const pic = user.picture
      ? `<img src="${user.picture}" style="width:28px;height:28px;border-radius:50%;flex-shrink:0">`
      : `<div style="width:28px;height:28px;border-radius:50%;background:var(--am);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:700">${(user.name||user.email)[0].toUpperCase()}</div>`;
    el.innerHTML = `<div style="display:flex;align-items:center;gap:10px">
      ${pic}
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name || '—'}</div>
        <div style="font-size:9px;color:var(--t3);font-family:var(--fm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.email}</div>
      </div>
      <button onclick="posLogout()" style="flex-shrink:0;background:transparent;border:none;font-size:9px;color:var(--t3);cursor:pointer;font-family:var(--fm);text-decoration:underline;padding:0">ログアウト</button>
    </div>`;
  } else {
    el.innerHTML = `<button onclick="posLogin()" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.7);border:1px solid var(--b2);border-radius:var(--r2);padding:9px 14px;cursor:pointer;font-size:11px;font-weight:500;color:var(--t1);width:100%;max-width:300px">
      <svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Googleでログイン
    </button>`;
  }
}

function setHealthPeriod(mode, el) {
  document.querySelectorAll('.hpb').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('#scr-health .content').forEach(v => v.classList.remove('active'));
  const idMap = {D:'h-daily', W:'h-weekly', M:'h-monthly', X:'h-detail', C:'h-calibration'};
  const target = document.getElementById(idMap[mode]);
  if (target) target.classList.add('active');
}

function go(btn, name) {
  document.querySelectorAll('.sb-i').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  document.getElementById('scr-' + name).classList.add('on');
  document.getElementById('ttl').textContent = pageCfg[name].title;
  const pp = document.getElementById('tp-pills');
  pp.innerHTML = pageCfg[name].pills.map((p,i) => `<div class="tp${i===0?' on':''}" onclick="selP(this)">${p}</div>`).join('');
  if (name === 'calendar') calRender();
  if (name === 'health') { initHealth(); }
  if (name === 'analytics') { showAnalyticsTab('Weekly'); buildSp('recovery-sp',[65,70,78,68,82,74,82],'var(--gr)'); }
  if (name === 'journal') { renderJournal(); renderNotes(); }
  if (name === 'tasks') { renderTasks(); renderSessionLog(); updateKpiCounts(); renderTagFilterPills(); renderHabits(); renderWishlist(); }
  if (name === 'settings') { sRefreshOuraStatus(); sRefreshAccountStatus(); loadFocusAutoSetting(); }
  if (name === 'notes') { renderNotesBoard(); }
  if (name === 'goals') { renderGoals(); }
  if (name === 'routine') { renderRoutine(); }
  if (name === 'log') { initLogDate(); renderLogTable(); renderLogSparklines(); }
  if (name === 'library') { renderLibrary(); }
  const dock = document.getElementById('input-dock');
  const hBar = document.getElementById('health-period-bar');
  if (dock) { dock.classList.remove('open'); }           /* close dock on every nav */
  if (hBar) hBar.style.display = name === 'health' ? 'flex' : 'none';
  const fb = document.querySelector('.float-fb');
  const twLaunch = document.getElementById('tw-launch');
  if (fb) fb.style.display = name === 'health' ? 'flex' : 'none';
  if (twLaunch) twLaunch.style.display = name === 'health' ? 'inline-flex' : 'none';
}

function selP(el) {
  el.closest('#tp-pills').querySelectorAll('.tp').forEach(t => t.classList.remove('on','am'));
  el.classList.add('on');
  const activeScr = document.querySelector('.scr.on');
  if (activeScr && activeScr.id === 'scr-analytics') showAnalyticsTab(el.textContent.trim());
}

/* CLOCK */
function tick() {
  const n = new Date();
  const t = n.toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'});
  const d = n.toLocaleDateString('ja-JP', {month:'short',day:'numeric',weekday:'short'});
  ['clk'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=t; });
  ['clkd'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=d; });
}
tick(); setInterval(tick, 1000);

/* SPARKLINES */
function buildSp(id, data, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  const max = Math.max(...data);
  data.forEach((v, i) => {
    const b = document.createElement('div');
    b.className = 'spb' + (i === data.length-1 ? ' hi' : '');
    b.style.height = ((v / max * 75) + 15) + '%';
    b.style.background = i === data.length-1 ? 'var(--am)' : color;
    b.style.flex = '1';
    el.appendChild(b);
  });
}
buildSp('hrv-home', [48,55,62,52,66,58,62], 'var(--bl)');

/* TASK TOGGLE */
function tgl(el) {
  el.classList.toggle('done');
  const n = el.nextElementSibling;
  if (n?.classList.contains('tn')) n.classList.toggle('done');
  const habitKey = el.dataset.habit;
  if (habitKey) {
    const isDone = el.classList.contains('done');
    const statusEl = n?.nextElementSibling;
    if (statusEl) statusEl.textContent = isDone ? 'Done' : '—';
    const habits = JSON.parse(Store.get('habits', '{}'));
    habits[habitKey] = isDone;
    Store.set('habits', JSON.stringify(habits));
  }
}

/* ── DAILY HABITS (dynamic, persisted) ── */
const DEFAULT_HABITS = ['サプリ', '散歩', '英語', '朝食', 'ストレッチ', 'プロテイン'];
function getHabitList() {
  const raw = Store.get('habit-list', 'null');
  if (raw && raw !== 'null') { try { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } catch {} }
  return DEFAULT_HABITS.slice();
}
function setHabitList(list) { Store.set('habit-list', JSON.stringify(list)); }

function renderHabits() {
  const wrap = document.getElementById('habit-items');
  if (!wrap) return;
  const done = JSON.parse(Store.get('habits', '{}'));
  const list = getHabitList();
  wrap.innerHTML = list.map(h => `
    <div class="ti habit-row">
      <div class="tck${done[h] ? ' done' : ''}" onclick="tgl(this)" data-habit="${_escHtml(h)}"></div>
      <div class="tn${done[h] ? ' done' : ''}">${_escHtml(h)}</div>
      <span class="habit-status">${done[h] ? 'Done' : '—'}</span>
      <span class="habit-del" onclick="deleteHabit('${_escHtml(h).replace(/'/g,"\\'")}')" title="削除">×</span>
    </div>`).join('') || '<div style="font-size:10px;color:var(--t4)">習慣がありません。＋で追加</div>';
}

function toggleHabitAdd() {
  const row = document.getElementById('habit-add-row');
  if (!row) return;
  const show = row.style.display === 'none' || !row.style.display;
  row.style.display = show ? 'flex' : 'none';
  if (show) setTimeout(() => document.getElementById('habit-add-input')?.focus(), 20);
}

function addHabit() {
  const inp = document.getElementById('habit-add-input');
  const name = inp?.value.trim();
  if (!name) return;
  const list = getHabitList();
  if (!list.includes(name)) { list.push(name); setHabitList(list); }
  inp.value = '';
  toggleHabitAdd();
  renderHabits();
}

function deleteHabit(name) {
  const list = getHabitList().filter(h => h !== name);
  setHabitList(list);
  const done = JSON.parse(Store.get('habits', '{}'));
  delete done[name];
  Store.set('habits', JSON.stringify(done));
  renderHabits();
}

function loadHabits() { renderHabits(); }

/* ── WISHLIST (free-form bullet memo) ── */
function getWishList() {
  const raw = Store.get('wishlist-memo', 'null');
  if (raw && raw !== 'null') { try { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } catch {} }
  return [];
}
function setWishList(list) { Store.set('wishlist-memo', JSON.stringify(list)); }

// One-time migration: fold any legacy status:'wishlist' tasks into the memo
function migrateWishlistTasks() {
  if (Store.get('wishlist-migrated', '') === '1') return;
  const legacy = (tasks || []).filter(t => t.status === 'wishlist');
  if (legacy.length) {
    const list = getWishList();
    legacy.forEach(t => { if (!list.includes(t.title)) list.push(t.title); });
    setWishList(list);
    tasks = tasks.filter(t => t.status !== 'wishlist');
    Store.setTasks(tasks);
  }
  Store.set('wishlist-migrated', '1');
}

function renderWishlist() {
  const wrap = document.getElementById('wish-items');
  if (!wrap) return;
  const list = getWishList();
  wrap.innerHTML = list.map((w, i) => `
    <div class="wish-row">
      <span class="wish-bullet">•</span>
      <span class="wish-text">${_escHtml(w)}</span>
      <span class="wish-promote" onclick="promoteWish(${i})" title="タスクに昇格">→</span>
      <span class="wish-del" onclick="deleteWish(${i})" title="削除">×</span>
    </div>`).join('') || '<div style="font-size:10px;color:var(--t4)">空です。＋で追加</div>';
}

function toggleWishAdd() {
  const row = document.getElementById('wish-add-row');
  if (!row) return;
  const show = row.style.display === 'none' || !row.style.display;
  row.style.display = show ? 'flex' : 'none';
  if (show) setTimeout(() => document.getElementById('wish-add-input')?.focus(), 20);
}

function addWish() {
  const inp = document.getElementById('wish-add-input');
  const text = inp?.value.trim();
  if (!text) return;
  const list = getWishList();
  list.push(text);
  setWishList(list);
  inp.value = '';
  renderWishlist();
}

function deleteWish(i) {
  const list = getWishList();
  list.splice(i, 1);
  setWishList(list);
  renderWishlist();
}

// Optional: turn a wishlist line into a real Todo task
function promoteWish(i) {
  const list = getWishList();
  const text = list[i];
  if (!text) return;
  tasks.push({ id: nextTaskId(), title: text, status: 'todo', priority: 'none',
    category: '', color: null, tags: [], sessions: [], dueDate: null, estimate: null,
    notes: '', subtasks: [], recurring: null, createdAt: new Date().toISOString() });
  Store.setTasks(tasks);
  list.splice(i, 1);
  setWishList(list);
  renderWishlist();
  renderTasks();
  updateKpiCounts();
  toast(text + ' をタスクに追加');
}

function renderTasksMini() {
  const el = document.getElementById('tasks-mini-body');
  if (!el) return;
  const priColor = { high:'var(--rd)', med:'var(--am)', low:'var(--bl)', none:'var(--t3)' };
  const priBg    = { high:'rgba(212,78,78,0.15)', med:'rgba(196,154,30,0.15)', low:'rgba(78,126,200,0.15)', none:'var(--s2)' };
  const shown = tasks.filter(t => t.status !== 'wishlist').slice(0, 5);
  if (!shown.length) {
    el.innerHTML = '<div style="padding:8px 0;font-size:10px;color:var(--t3)">タスクなし</div>';
    return;
  }
  el.innerHTML = shown.map(t => {
    const done = t.status === 'done';
    const pri  = t.priority || 'none';
    const label = pri !== 'none' ? pri.charAt(0).toUpperCase() + pri.slice(1) : t.status;
    return `<div class="ti">
      <div class="tck${done ? ' done' : ''}"></div>
      <div class="tn${done ? ' done' : ''}">${t.title}</div>
      <span class="tag" style="background:${priBg[pri]};color:${priColor[pri]}">${label}</span>
    </div>`;
  }).join('');
}

/* CALENDAR */
const _calNow = new Date();
let calYear = _calNow.getFullYear(), calMonth = _calNow.getMonth();
let calDate = new Date();
let calView = 'week';
const CAL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAL_DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const SLEEP_SCORES = {
  '2026-5': [72,68,80,84,76,82,85,74,70,78,82,86,80,75,71,73,79,84,88,82]
};

const GCAL_SLOT_H = 44;
const GCAL_START_H = 0;
const GCAL_END_H = 24;

function calGoToday() {
  calDate = new Date();
  calYear = calDate.getFullYear();
  calMonth = calDate.getMonth();
  calRender();
}

function calPrev() {
  if (calView === 'month') {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
  } else if (calView === 'week') {
    calDate = new Date(calDate); calDate.setDate(calDate.getDate() - 7);
    calYear = calDate.getFullYear(); calMonth = calDate.getMonth();
  } else {
    calDate = new Date(calDate); calDate.setDate(calDate.getDate() - 1);
    calYear = calDate.getFullYear(); calMonth = calDate.getMonth();
  }
  calRender();
}

function calNext() {
  if (calView === 'month') {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
  } else if (calView === 'week') {
    calDate = new Date(calDate); calDate.setDate(calDate.getDate() + 7);
    calYear = calDate.getFullYear(); calMonth = calDate.getMonth();
  } else {
    calDate = new Date(calDate); calDate.setDate(calDate.getDate() + 1);
    calYear = calDate.getFullYear(); calMonth = calDate.getMonth();
  }
  calRender();
}

function calV(el, view) {
  document.querySelectorAll('.gcal-vb').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  calView = view;
  const showMap = { month: 'flex', week: 'flex', day: 'flex', gantt: 'block' };
  ['month','week','day','gantt'].forEach(v => {
    const e = document.getElementById('cv-' + v);
    if (!e) return;
    e.style.display = v === view ? showMap[v] : 'none';
  });
  calRender();
}

function calRender(preserveScroll = false) {
  _calUpdateTitle();
  _calBuildMini();
  if (calView === 'month') buildMonth();
  else if (calView === 'week') _calBuildWeek(preserveScroll);
  else if (calView === 'day') buildDay(preserveScroll);
}

// Re-render the active calendar view without jumping scroll or disrupting interaction.
// bustCache=true forces a fresh Google fetch (used by realtime polling).
function calSoftRefresh(bustCache) {
  const scr = document.getElementById('scr-calendar');
  if (!scr || !scr.classList.contains('on')) return;     // only when calendar visible
  if (_dragState) return;                                 // never interrupt a drag/resize
  const dp = document.getElementById('gcal-detail-pop');
  const cp = document.getElementById('gcal-create-pop');
  if ((dp && dp.style.display !== 'none') || (cp && cp.style.display !== 'none')) return; // popover open
  if (bustCache) _gcalEvCache = {};
  calRender(true);   // preserveScroll=true → no jump to "now"
}

// Realtime polling: while the calendar is open, refetch Google events periodically
// so external edits (other devices / the Google app) appear without a manual refresh.
let _calPollTimer = null;
function startCalendarPolling() {
  if (_calPollTimer) return;
  _calPollTimer = setInterval(() => calSoftRefresh(true), 8000); // every 8s
}
// Also refresh immediately when the tab/window regains focus
document.addEventListener('visibilitychange', () => { if (!document.hidden) calSoftRefresh(true); });
window.addEventListener('focus', () => calSoftRefresh(true));

function _calUpdateTitle() {
  const ttl = document.getElementById('cal-ttl');
  if (!ttl) return;
  if (calView === 'month') {
    ttl.textContent = CAL_MONTHS[calMonth] + ' ' + calYear;
  } else if (calView === 'week') {
    const ws = _calWeekStart(calDate);
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    ttl.textContent = ws.getMonth() === we.getMonth()
      ? CAL_MONTHS[ws.getMonth()] + ' ' + ws.getFullYear()
      : CAL_MONTHS[ws.getMonth()].slice(0,3) + ' – ' + CAL_MONTHS[we.getMonth()].slice(0,3) + ' ' + we.getFullYear();
  } else {
    ttl.textContent = CAL_DAYS_SHORT[calDate.getDay()] + ', ' + CAL_MONTHS[calDate.getMonth()].slice(0,3) + ' ' + calDate.getDate() + ' ' + calDate.getFullYear();
  }
}

function _calWeekStart(d) {
  const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); dt.setHours(0,0,0,0); return dt;
}

function _calBuildMini() {
  const mini = document.getElementById('gcal-mini-cal');
  if (!mini) return;
  const yr = calView === 'month' ? calYear : calDate.getFullYear();
  const mo = calView === 'month' ? calMonth : calDate.getMonth();
  const today = new Date();
  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const prev = new Date(yr, mo, 0).getDate();
  let h = `<div class="gcal-mini-nav">
    <span class="gcal-mini-nav-ttl">${CAL_MONTHS[mo].slice(0,3)} ${yr}</span>
    <div style="display:flex;gap:2px">
      <button class="gcal-mini-nav-btn" onclick="calPrev()">&#8249;</button>
      <button class="gcal-mini-nav-btn" onclick="calNext()">&#8250;</button>
    </div>
  </div><div class="gcal-mini-grid">
  <div class="gcal-mini-dow">S</div><div class="gcal-mini-dow">M</div><div class="gcal-mini-dow">T</div><div class="gcal-mini-dow">W</div><div class="gcal-mini-dow">T</div><div class="gcal-mini-dow">F</div><div class="gcal-mini-dow">S</div>`;
  for (let i = 0; i < first; i++) h += `<div class="gcal-mini-day other">${prev - first + i + 1}</div>`;
  for (let d = 1; d <= days; d++) {
    const isToday = yr === today.getFullYear() && mo === today.getMonth() && d === today.getDate();
    const isSel = !isToday && yr === calDate.getFullYear() && mo === calDate.getMonth() && d === calDate.getDate();
    h += `<div class="gcal-mini-day${isToday?' today':isSel?' sel':''}" onclick="calJump(${yr},${mo},${d})">${d}</div>`;
  }
  const trailing = (first + days) % 7;
  if (trailing > 0) for (let i = 1; i <= 7 - trailing; i++) h += `<div class="gcal-mini-day other">${i}</div>`;
  h += '</div>';
  mini.innerHTML = h;
}

function calJump(yr, mo, d) {
  calDate = new Date(yr, mo, d); calYear = yr; calMonth = mo; calRender();
}

function buildMonth() {
  const cells = document.getElementById('mc');
  if (!cells) return;
  cells.innerHTML = '';
  const yr = calYear, mo = calMonth;
  const today = new Date();
  const isCurrent = yr === today.getFullYear() && mo === today.getMonth();
  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const prev = new Date(yr, mo, 0).getDate();
  const scores = SLEEP_SCORES[`${yr}-${mo+1}`] || [];

  for (let i = 0; i < first; i++) {
    const el = document.createElement('div'); el.className = 'gcal-md other';
    el.innerHTML = `<div class="gcal-mdn">${prev - first + i + 1}</div>`; cells.appendChild(el);
  }
  for (let d = 1; d <= days; d++) {
    const isToday = isCurrent && d === today.getDate();
    const score = scores[d - 1];
    const el = document.createElement('div'); el.className = 'gcal-md';
    el.innerHTML = `<div class="gcal-mdn${isToday ? ' today' : ''}">${d}</div>`;
    if (score) {
      const c = score>=85?'var(--gr)':score>=75?'var(--bl)':score>=65?'var(--am)':'var(--rd)';
      const bg = score>=85?'rgba(62,168,106,0.14)':score>=75?'rgba(78,126,200,0.14)':score>=65?'rgba(196,154,30,0.14)':'rgba(212,78,78,0.14)';
      el.innerHTML += `<div class="gcal-mev" style="background:${bg};color:${c}">Sleep ${score}</div>`;
    }
    const dStr = new Date(yr, mo, d).toDateString();
    (tasks || []).filter(t => t.sessions && t.sessions.some(s => s.start && new Date(s.start).toDateString() === dStr))
      .slice(0, 2).forEach(t => {
        el.innerHTML += `<div class="gcal-mev" style="background:rgba(78,126,200,0.12);color:var(--bl)">${t.title}</div>`;
      });
    el.onclick = () => { calDate = new Date(yr, mo, d); calJump(yr, mo, d); calV(document.querySelector('.gcal-vb[onclick*="day"]'), 'day'); };
    cells.appendChild(el);
  }
  const trailing = (first + days) % 7;
  if (trailing > 0) for (let i = 1; i <= 7 - trailing; i++) {
    const el = document.createElement('div'); el.className = 'gcal-md other';
    el.innerHTML = `<div class="gcal-mdn">${i}</div>`; cells.appendChild(el);
  }
}

let _gcalEvCache = {};     // key → { ts, events, connected }
let _gcalConnected = null; // true/false/null (unknown)

function _localIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function _fetchGcalEvents(startDate, endDate) {
  const key = _localIso(startDate) + ':' + _localIso(endDate);
  const cached = _gcalEvCache[key];
  if (cached && Date.now() - cached.ts < 5 * 60000) return cached; // 5min cache

  if (!posSession()) return { connected: false, events: [] };
  try {
    const res = await fetch(
      `${WORKER_BASE}/api/calendar/events?timeMin=${encodeURIComponent(startDate.toISOString())}&timeMax=${encodeURIComponent(endDate.toISOString())}`,
      { headers: posAuthHeader() }
    );
    if (!res.ok) return { connected: false, events: [] };
    const data = await res.json();
    // Overlay local pending edits/deletes so a just-moved event never snaps back.
    const events = _applyPendingOverlay(data.events || []);
    const result = { ts: Date.now(), connected: data.connected !== false, events };
    _gcalEvCache[key] = result;
    _gcalConnected = result.connected;
    _gcalUpdateBanner();
    _reconcileTaskEventsFromGcal(result.events);   // pull external Google edits back into tasks
    return result;
  } catch { return { connected: false, events: [] }; }
}

// If a task-linked Google event was edited externally, update the local session times.
const _RECONCILE_GUARD_MS = 30000; // don't let polling overwrite a just-made local edit
function _reconcileTaskEventsFromGcal(events) {
  let changed = false;
  for (const ev of events) {
    const tid = ev.extendedProperties?.private?.posTaskId;
    if (!tid || !ev.start?.dateTime) continue;
    const match = findSessionByEventId(ev.id);
    if (!match) continue;
    // Skip if the user edited this session locally very recently — the PATCH to
    // Google may still be in flight; otherwise we'd revert their drag ("元に戻る").
    if (match.session._localEditTs && Date.now() - match.session._localEditTs < _RECONCILE_GUARD_MS) continue;
    const newStart = new Date(ev.start.dateTime).toISOString();
    const newEnd   = ev.end?.dateTime ? new Date(ev.end.dateTime).toISOString() : match.session.end;
    if (match.session.start !== newStart || match.session.end !== newEnd) {
      match.session.start = newStart;
      if (match.session.end) match.session.end = newEnd;
      changed = true;
    }
  }
  if (changed) { Store.setTasks(tasks); renderTasks(); }
}

function _gcalUpdateBanner() {
  const banner = document.getElementById('gcal-connect-banner');
  if (!banner) return;
  banner.style.display = _gcalConnected === false ? 'flex' : 'none';
}

function _gcalEventColor(colorId) {
  const colors = {
    1: ['#D50000','#fff'], 2: ['#E67C73','#fff'], 3: ['#F4511E','#fff'],
    4: ['#F6BF26','#1A1C22'], 5: ['#33B679','#fff'], 6: ['#0B8043','#fff'],
    7: ['#039BE5','#fff'], 8: ['#3F51B5','#fff'], 9: ['#7986CB','#fff'],
    10: ['#8E24AA','#fff'], 11: ['#616161','#fff'],
  };
  const c = colors[colorId] || ['#4285F4','#fff'];
  return { bg: c[0], c: c[1] };
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const _EV_COLORS = [
  { bg:'rgba(78,126,200,0.18)',  c:'var(--bl)', border:'rgba(78,126,200,0.5)'  },
  { bg:'rgba(62,168,106,0.18)',  c:'var(--gr)', border:'rgba(62,168,106,0.5)'  },
  { bg:'rgba(196,154,30,0.18)',  c:'var(--am)', border:'rgba(196,154,30,0.5)'  },
  { bg:'rgba(212,78,78,0.18)',   c:'var(--rd)', border:'rgba(212,78,78,0.5)'   },
  { bg:'rgba(139,94,212,0.18)',  c:'var(--pu)', border:'rgba(139,94,212,0.5)'  },
];

function _calBuildTimeGrid(gutterEl, gridEl, days, gcalEvents = [], preserveScroll = false) {
  if (!gutterEl || !gridEl) return;
  const totalH = GCAL_END_H * GCAL_SLOT_H; // 0–24
  const today = new Date();
  const nowH = today.getHours() + today.getMinutes() / 60;

  // Gutter: time labels (skip midnight label at top)
  let gutterHtml = `<div style="height:${totalH}px;position:relative">`;
  for (let h = 1; h < GCAL_END_H; h++) {
    const top = h * GCAL_SLOT_H;
    const lbl = h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h - 12) + ' PM';
    gutterHtml += `<div class="gcal-hr-lbl" style="top:${top}px">${lbl}</div>`;
  }
  gutterHtml += '</div>';
  gutterEl.innerHTML = gutterHtml;

  // Day columns
  let gridHtml = '';
  days.forEach(d => {
    const isToday = d.toDateString() === today.toDateString();
    const dTaskStr = d.toDateString();
    // Use LOCAL date string to avoid UTC offset issues (e.g. JST = UTC+9)
    const dIsoStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    gridHtml += `<div class="gcal-dc${isToday ? ' today-col' : ''}" data-date="${dIsoStr}" style="height:${totalH}px">`;

    // Hour lines
    for (let h = 0; h < GCAL_END_H; h++) {
      gridHtml += `<div class="gcal-hr-line" style="top:${h * GCAL_SLOT_H}px"></div>`;
      if (h > 0) gridHtml += `<div class="gcal-hr-line half" style="top:${h * GCAL_SLOT_H - GCAL_SLOT_H/2}px"></div>`;
    }

    // ── Collect all events for this day (gcal + task) into one list ──────
    const items = [];

    gcalEvents.forEach(ev => {
      if (!ev.start?.dateTime) return;
      // Task-linked events are rendered from local sessions below — skip to avoid dupes
      if (ev.extendedProperties?.private?.posTaskId) return;
      const sd = new Date(ev.start.dateTime);
      const sdLocal = `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,'0')}-${String(sd.getDate()).padStart(2,'0')}`;
      if (sdLocal !== dIsoStr) return;
      const ed = ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(sd.getTime() + 3600000);
      const sMin = sd.getHours() * 60 + sd.getMinutes();
      const eMin = Math.min(ed.getHours() * 60 + ed.getMinutes() + (ed.getDate() > sd.getDate() ? 1440 : 0), _DAY_MIN);
      const duration = ed.getTime() - sd.getTime();
      const clr      = _gcalEventColor(ev.colorId);
      const sStr     = sd.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      const eStr2    = ed.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      const editable = ev._editable !== false;
      items.push({
        s: sMin, e: Math.max(eMin, sMin + 20 / _PXPERMIN),
        cls: 'gcal-ev gcal-ev-google' + (editable ? '' : ' gcal-ev-readonly'),
        style: `background:${clr.bg};color:${clr.c};touch-action:none;cursor:${editable ? 'grab' : 'default'}`,
        attrs: `data-event-id="${_escHtml(ev.id)}" data-calendar-id="${_escHtml(ev._calendarId || 'primary')}" data-duration="${duration}" data-title="${_escHtml(ev.summary || '(No title)')}"`,
        inner: `<div class="gcal-ev-title">${_escHtml(ev.summary || '(No title)')}</div><div class="gcal-ev-time">${sStr}–${eStr2}</div>${editable ? '<div class="gcal-ev-resize"></div>' : ''}`,
      });
    });

    let colIdx = 0;
    (tasks || []).forEach(task => {
      if (!task.sessions) return;
      task.sessions.forEach((s, sIdx) => {
        if (!s.start) return;
        const sd = new Date(s.start);
        if (sd.toDateString() !== dTaskStr) return;
        const sMin = sd.getHours() * 60 + sd.getMinutes();
        if (sMin >= _DAY_MIN) return;
        const running = !s.end && task.id === currentRunningId;
        const endD  = s.end ? new Date(s.end) : (running ? today : new Date(sd.getTime() + 60 * 60000));
        const eMin  = Math.min(endD.getHours() * 60 + endD.getMinutes(), _DAY_MIN);
        const hex   = taskColor(task);
        const clr   = { bg: hex + '2e', c: hex, border: hex };
        colIdx++;
        const sStr = sd.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const eStr = endD.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const duration = (eMin - sMin) * 60000;
        // Running session isn't draggable (its end is "now"); finished ones are.
        const editable = !running;
        items.push({
          s: sMin, e: Math.max(eMin, sMin + 20 / _PXPERMIN),
          cls: 'gcal-ev gcal-ev-task' + (editable ? '' : ' gcal-ev-readonly'),
          style: `background:${clr.bg};color:${clr.c};border-left:3px solid ${hex};touch-action:none;cursor:${editable ? 'grab' : 'default'}`,
          attrs: `data-task-id="${_escHtml(task.id)}" data-session-idx="${sIdx}" data-duration="${duration}" data-title="${_escHtml(task.title)}"`,
          inner: `<div class="gcal-ev-title">${running ? '▶ ' : ''}${_escHtml(task.title)}</div><div class="gcal-ev-time">${sStr}–${eStr}</div>${editable ? '<div class="gcal-ev-resize"></div>' : ''}`,
        });
      });
    });

    // ── Overlap layout: events sharing time split the width equally ──────
    _assignLanes(items);
    items.forEach(it => {
      const wPct = 100 / it.ncols;
      const top    = it.s * _PXPERMIN;
      const height = Math.max(20, (it.e - it.s) * _PXPERMIN);
      const left   = `calc(${it.lane * wPct}% + 1px)`;
      const width  = `calc(${wPct}% - 2px)`;
      gridHtml += `<div class="${it.cls}" ${it.attrs} style="top:${top}px;height:${height}px;left:${left};width:${width};${it.style}">${it.inner}</div>`;
    });

    // ── Now indicator ───────────────────────────────────────────────────
    if (isToday && nowH < GCAL_END_H) {
      const top = nowH * GCAL_SLOT_H;
      gridHtml += `<div class="gcal-now-line" style="top:${top}px"><div class="gcal-now-dot"></div><div class="gcal-now-bar"></div></div>`;
    }
    gridHtml += '</div>';
  });
  gridEl.innerHTML = gridHtml;

  // Scroll to current time (or 7am if today not in view) — skipped on soft refresh
  // so the user's scroll position never jumps when data updates.
  const scrollArea = gutterEl.closest('.gcal-scroll-area');
  if (scrollArea && !preserveScroll) {
    const scrollH = days.some(d => d.toDateString() === today.toDateString())
      ? Math.max(0, (today.getHours() - 1.5) * GCAL_SLOT_H)
      : 7 * GCAL_SLOT_H;
    setTimeout(() => { scrollArea.scrollTop = scrollH; }, 50);
  }
  _calInitInteract();
}

// ════════════════════════════════════════════════════════════════════════
// Calendar drag-to-move + click-to-create
// ════════════════════════════════════════════════════════════════════════

let _dragState = null;
let _createEvData = null;
let _suppressColClick = false;

const _SNAP_MIN  = 15;                       // snap to 15-minute grid
const _PXPERMIN  = GCAL_SLOT_H / 60;          // pixels per minute
const _DAY_MIN   = 24 * 60;

function _fmtMin(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function _calInitInteract() {
  document.querySelectorAll('.gcal-ev-google[data-event-id]:not(.gcal-ev-readonly), .gcal-ev-task:not(.gcal-ev-readonly)').forEach(el => {
    el.addEventListener('pointerdown', _calPointerDown, { passive: false });
  });
  document.querySelectorAll('.gcal-dc').forEach(col => {
    col.addEventListener('click', e => {
      if (_suppressColClick) { _suppressColClick = false; return; }
      if (e.target.closest('.gcal-ev')) return;
      _calNewEventAt(col, e);
    });
  });
}

const _DRAG_THRESHOLD = 4; // px before a press becomes a drag (vs a click)

// Assign each item a lane + ncols so overlapping events split the column width.
// Clusters = maximal chains of overlapping events; within a cluster, greedy lanes.
function _assignLanes(items) {
  items.sort((a, b) => a.s - b.s || a.e - b.e);
  let i = 0;
  while (i < items.length) {
    let cluster = [items[i]];
    let maxEnd  = items[i].e;
    let j = i + 1;
    while (j < items.length && items[j].s < maxEnd) {
      cluster.push(items[j]);
      maxEnd = Math.max(maxEnd, items[j].e);
      j++;
    }
    const laneEnds = []; // end time of last event placed in each lane
    for (const it of cluster) {
      let lane = laneEnds.findIndex(end => end <= it.s);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(it.e); }
      else laneEnds[lane] = it.e;
      it.lane = lane;
    }
    const ncols = laneEnds.length;
    for (const it of cluster) it.ncols = ncols;
    i = j;
  }
}

// Re-run overlap layout on the events already present in a column (post-drag).
function _calRelayoutColumn(col) {
  if (!col) return;
  const els = Array.from(col.querySelectorAll('.gcal-ev'));
  const items = els.map(el => {
    const top = parseFloat(el.style.top) || 0;
    const h   = parseFloat(el.style.height) || 20;
    return { el, s: top / _PXPERMIN, e: (top + h) / _PXPERMIN };
  });
  _assignLanes(items);
  for (const it of items) {
    const w = 100 / it.ncols;
    it.el.style.left  = `calc(${it.lane * w}% + 1px)`;
    it.el.style.width = `calc(${w}% - 2px)`;
    it.el.style.right = 'auto';
  }
}

function _colAtX(cols, clientX) {
  // Clamp to first/last column instead of wrapping (fixes left-of-SUN → SAT bug)
  const rects = cols.map(c => c.getBoundingClientRect());
  if (clientX < rects[0].left) return cols[0];
  for (let i = 0; i < cols.length; i++) {
    if (clientX >= rects[i].left && clientX < rects[i].right) return cols[i];
  }
  return cols[cols.length - 1];
}

function _calPointerDown(e) {
  if (e.button !== 0) return;
  const el   = e.currentTarget;
  const grid = el.closest('[id^="gcal-day-grid"]');
  const scrollArea = grid?.closest('.gcal-scroll-area');
  const col  = el.closest('.gcal-dc');
  if (!grid || !scrollArea || !col) return;

  e.preventDefault();
  e.stopPropagation();
  el.setPointerCapture(e.pointerId);

  const isResize  = !!e.target.closest('.gcal-ev-resize');
  const elRect    = el.getBoundingClientRect();
  const colRect   = col.getBoundingClientRect();
  const startMin  = Math.round(parseFloat(el.style.top) / _PXPERMIN);
  const durMin    = Math.round((parseInt(el.dataset.duration) || 3600000) / 60000);

  _dragState = {
    mode: isResize ? 'resize' : 'move',
    el, grid, scrollArea,
    cols: Array.from(grid.querySelectorAll('.gcal-dc')),
    eventId: el.dataset.eventId,
    calendarId: el.dataset.calendarId || 'primary',
    taskId: el.dataset.taskId || null,           // set for task-session blocks
    sessionIdx: el.dataset.sessionIdx != null ? parseInt(el.dataset.sessionIdx) : null,
    title: el.dataset.title || '',
    insetLeft: elRect.left - colRect.left,
    width: elRect.width,
    grabOffsetY: e.clientY - elRect.top,
    startMin, durMin,
    curStartMin: startMin, curDurMin: durMin,
    dateStr: col.dataset.date,
    origCol: col,
    downX: e.clientX, downY: e.clientY,
    dragging: false,
    pointerId: e.pointerId,
  };

  el.addEventListener('pointermove',   _calPointerMove);
  el.addEventListener('pointerup',     _calPointerUp);
  el.addEventListener('pointercancel', _calPointerUp);
}

function _calBeginDragVisual(st) {
  st.dragging = true;
  const { el } = st;
  el.classList.add('gcal-ev-dragging');
  el.style.zIndex = '999';
  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.28)';
  if (st.mode === 'move') el.style.cursor = 'grabbing';
}

function _calPointerMove(e) {
  const st = _dragState;
  if (!st) return;

  // Honour drag threshold so a click doesn't move the event
  if (!st.dragging) {
    if (Math.abs(e.clientX - st.downX) < _DRAG_THRESHOLD &&
        Math.abs(e.clientY - st.downY) < _DRAG_THRESHOLD) return;
    _calBeginDragVisual(st);
  }

  // Edge auto-scroll (like Google Calendar)
  const saRect = st.scrollArea.getBoundingClientRect();
  if (e.clientY < saRect.top + 36)         st.scrollArea.scrollTop -= 10;
  else if (e.clientY > saRect.bottom - 36) st.scrollArea.scrollTop += 10;

  const { el } = st;

  if (st.mode === 'move') {
    // Clamp to first/last column (no wrap)
    const targetCol = _colAtX(st.cols, e.clientX);
    // colRect.top already reflects scroll position — do NOT add scrollTop
    const colRect = targetCol.getBoundingClientRect();

    const rawTopPx = e.clientY - colRect.top - st.grabOffsetY;
    let startMin = Math.round(rawTopPx / _PXPERMIN / _SNAP_MIN) * _SNAP_MIN;
    startMin = Math.max(0, Math.min(startMin, _DAY_MIN - st.durMin));

    st.curStartMin = startMin;
    st.dateStr     = targetCol.dataset.date;
    st.targetCol   = targetCol;

    // Position the REAL element (fixed) snapped to the target column + time
    el.style.position = 'fixed';
    el.style.left   = (colRect.left + st.insetLeft) + 'px';
    el.style.width  = st.width + 'px';
    el.style.right  = 'auto';
    el.style.top    = (colRect.top + startMin * _PXPERMIN) + 'px';
    el.style.height = (st.durMin * _PXPERMIN) + 'px';

    _calSetEvLabel(el, startMin, startMin + st.durMin);
  } else {
    // Resize: keep start fixed, change end (snap 15, min 15)
    const col = el.closest('.gcal-dc');
    const colRect = col.getBoundingClientRect();   // already scroll-adjusted
    const rawEndPx = e.clientY - colRect.top;
    let endMin = Math.round(rawEndPx / _PXPERMIN / _SNAP_MIN) * _SNAP_MIN;
    endMin = Math.max(st.startMin + _SNAP_MIN, Math.min(endMin, _DAY_MIN));

    st.curDurMin = endMin - st.startMin;
    el.style.height = (st.curDurMin * _PXPERMIN) + 'px';

    _calSetEvLabel(el, st.startMin, endMin);
  }
}

function _calSetEvLabel(el, startMin, endMin) {
  const lbl = el.querySelector('.gcal-ev-time');
  if (lbl) lbl.textContent = `${_fmtMin(startMin)}–${_fmtMin(endMin)}`;
}

async function _calPointerUp(e) {
  const st = _dragState;
  if (!st) return;
  _dragState = null;
  const { el } = st;

  el.removeEventListener('pointermove',   _calPointerMove);
  el.removeEventListener('pointerup',     _calPointerUp);
  el.removeEventListener('pointercancel', _calPointerUp);
  try { el.releasePointerCapture(st.pointerId); } catch {}

  el.classList.remove('gcal-ev-dragging');
  el.style.zIndex = '';
  el.style.boxShadow = '';
  el.style.cursor = 'grab';

  // Below threshold → it was a click, not a drag → open detail
  if (!st.dragging) {
    if (st.taskId) { openTaskDetail(st.taskId); }      // task block → task drawer
    else if (st.mode === 'move') gcalOpenDetail(el);    // gcal event → event popover
    return;
  }
  _suppressColClick = true;

  const newStartMin = st.mode === 'move'   ? st.curStartMin : st.startMin;
  const newDurMin   = st.mode === 'resize' ? st.curDurMin   : st.durMin;
  const dateStr     = st.dateStr;

  // ── Settle the element in place WITHOUT a full re-render ──
  if (st.mode === 'move' && st.targetCol) st.targetCol.appendChild(el);
  el.style.position = '';
  el.style.top    = (newStartMin * _PXPERMIN) + 'px';
  el.style.height = (newDurMin * _PXPERMIN) + 'px';
  el.dataset.duration = newDurMin * 60000;
  _calSetEvLabel(el, newStartMin, newStartMin + newDurMin);
  _calRelayoutColumn(st.origCol);
  if (st.targetCol && st.targetCol !== st.origCol) _calRelayoutColumn(st.targetCol);

  // Build new times
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDt = new Date(`${dateStr}T${String(Math.floor(newStartMin/60)).padStart(2,'0')}:${String(newStartMin%60).padStart(2,'0')}:00`);
  const endDt   = new Date(startDt.getTime() + newDurMin * 60000);

  // ── TASK-SESSION block: update the local task, then mirror to Google ──
  if (st.taskId) {
    const task = tasks.find(t => t.id === st.taskId);
    const session = task?.sessions?.[st.sessionIdx];
    if (session) {
      const prevS = { start: session.start, end: session.end };
      session.start = startDt.toISOString();
      session.end   = endDt.toISOString();
      session._localEditTs = Date.now();                // guard against poll revert
      Store.setTasks(tasks);
      renderTasks(); renderSessionLog();
      syncUpdateSession(task, st.sessionIdx);           // mirror to Google Calendar
      const undo = async () => {
        session.start = prevS.start; session.end = prevS.end;
        session._localEditTs = Date.now();
        Store.setTasks(tasks); renderTasks(); calRender();
        syncUpdateSession(task, st.sessionIdx);
        gcalSnack('元に戻しました');
      };
      gcalSnack(`${task.title} を${_fmtMin(newStartMin)}に${st.mode === 'resize' ? '長さ変更' : '移動'}`, undo);
    }
    return;
  }

  // Record the intended position as a "pending edit" overlaid on every fetch,
  // so polling can NEVER revert it (even with Google's eventual-consistency lag).
  const prev = _gcalCacheUpdateEvent(st.eventId, startDt.toISOString(), endDt.toISOString());
  const prevPending = _gcalPendingEdits[st.eventId];
  _gcalSetPending(st.eventId, startDt.toISOString(), endDt.toISOString());

  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(st.eventId)}?calendarId=${encodeURIComponent(st.calendarId)}`, {
      method:  'PATCH',
      headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        start: { dateTime: startDt.toISOString(), timeZone: tz },
        end:   { dateTime: endDt.toISOString(),   timeZone: tz },
      }),
    });
    if (res.ok) {
      const verb = st.mode === 'resize' ? '長さを変更' : '移動';
      const undo = prev ? async () => {
        _gcalCacheUpdateEvent(st.eventId, prev.start, prev.end);
        _gcalSetPending(st.eventId, prev.start, prev.end);
        calRender(true);
        try { await _gcalPatchBack(st.eventId, st.calendarId, prev.start, prev.end); gcalSnack('元に戻しました'); }
        catch { toast('元に戻せませんでした'); }
      } : null;
      gcalSnack(`${st.title ? st.title + ' を' : '予定を'}${_fmtMin(newStartMin)}に${verb}`, undo);
    } else {
      // Do NOT roll back the on-screen position — keep the user's move, just report.
      const err = await res.json().catch(() => ({}));
      toast('カレンダー更新失敗: ' + (err.detail?.error?.message || err.error || res.status));
    }
  } catch {
    toast('カレンダー更新に失敗（通信エラー）— 位置は保持します');
  }
}

// ── Pending-edit overlay: keeps locally-moved events in place until Google catches up
let _gcalPendingEdits   = {};   // eventId -> { startIso, endIso }
let _gcalPendingDeletes = {};   // eventId -> ts (hidden until the fetch stops returning it)
function _gcalSetPending(eventId, startIso, endIso) {
  _gcalPendingEdits[eventId] = { startIso, endIso };
}
// Overlay pending edits/deletes on a freshly fetched events array (mutates + filters).
function _applyPendingOverlay(events) {
  // edits
  for (const ev of events) {
    const pe = _gcalPendingEdits[ev.id];
    if (!pe) continue;
    const gStart = ev.start?.dateTime ? new Date(ev.start.dateTime).getTime() : null;
    if (gStart === new Date(pe.startIso).getTime()) { delete _gcalPendingEdits[ev.id]; continue; } // Google caught up
    if (ev.start) ev.start.dateTime = pe.startIso;
    if (ev.end && pe.endIso) ev.end.dateTime = pe.endIso;
  }
  // deletes: drop events we deleted locally but Google may still return briefly
  const returned = new Set(events.map(e => e.id));
  for (const id in _gcalPendingDeletes) { if (!returned.has(id)) delete _gcalPendingDeletes[id]; }
  return events.filter(e => !_gcalPendingDeletes[e.id]);
}

// Mutate an event's start/end in all cache entries; return previous {start,end}
function _gcalCacheUpdateEvent(eventId, newStartIso, newEndIso) {
  let prev = null;
  for (const key in _gcalEvCache) {
    const entry = _gcalEvCache[key];
    if (!entry?.events) continue;
    for (const ev of entry.events) {
      if (ev.id !== eventId) continue;
      if (!prev) prev = { start: ev.start?.dateTime, end: ev.end?.dateTime };
      if (ev.start) ev.start.dateTime = newStartIso;
      if (ev.end)   ev.end.dateTime   = newEndIso;
    }
  }
  return prev;
}

// Lightweight snackbar (no grid reflow). Optional Undo button.
let _snackTimer = null;
function gcalSnack(msg, undoFn) {
  let bar = document.getElementById('gcal-snack');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'gcal-snack';
    document.body.appendChild(bar);
  }
  bar.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = msg;
  bar.appendChild(span);
  if (undoFn) {
    const btn = document.createElement('button');
    btn.className = 'gcal-snack-undo';
    btn.textContent = '元に戻す';
    btn.onclick = () => { bar.classList.remove('show'); clearTimeout(_snackTimer); undoFn(); };
    bar.appendChild(btn);
  }
  bar.classList.add('show');
  clearTimeout(_snackTimer);
  _snackTimer = setTimeout(() => bar.classList.remove('show'), undoFn ? 7000 : 2600);
}

// PATCH an event back to given start/end/summary (used by Undo)
function _gcalPatchBack(eventId, calendarId, startIso, endIso, summary) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const body = {};
  if (startIso)      body.start = { dateTime: startIso, timeZone: tz };
  if (endIso)        body.end   = { dateTime: endIso,   timeZone: tz };
  if (summary != null) body.summary = summary;
  return fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(eventId)}?calendarId=${encodeURIComponent(calendarId)}`, {
    method: 'PATCH', headers: { ...posAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

// ── Cache helpers for edit/delete ──────────────────────────────────────────
function _gcalCacheEdit(eventId, { startIso, endIso, summary }) {
  let prev = null;
  for (const key in _gcalEvCache) {
    const entry = _gcalEvCache[key];
    if (!entry?.events) continue;
    for (const ev of entry.events) {
      if (ev.id !== eventId) continue;
      if (!prev) prev = { start: ev.start?.dateTime, end: ev.end?.dateTime, summary: ev.summary };
      if (startIso && ev.start) ev.start.dateTime = startIso;
      if (endIso   && ev.end)   ev.end.dateTime   = endIso;
      if (summary != null)      ev.summary = summary;
    }
  }
  return prev;
}

function _gcalCacheDelete(eventId) {
  const removed = [];
  for (const key in _gcalEvCache) {
    const entry = _gcalEvCache[key];
    if (!entry?.events) continue;
    const idx = entry.events.findIndex(ev => ev.id === eventId);
    if (idx >= 0) { removed.push({ key, ev: entry.events[idx], idx }); entry.events.splice(idx, 1); }
  }
  return removed;
}

function _gcalCacheRestore(removed) {
  removed.forEach(({ key, ev }) => {
    if (_gcalEvCache[key]?.events) _gcalEvCache[key].events.push(ev);
  });
}

// ════════════════════════════════════════════════════════════════════════
// Event detail / edit / delete popover (Google-Calendar-style)
// ════════════════════════════════════════════════════════════════════════

let _detailCtx = null;

function gcalOpenDetail(el) {
  const col      = el.closest('.gcal-dc');
  const dateStr  = col?.dataset.date;
  const startMin = Math.round(parseFloat(el.style.top) / _PXPERMIN);
  const durMin   = Math.round((parseInt(el.dataset.duration) || 3600000) / 60000);
  _detailCtx = {
    eventId:    el.dataset.eventId,
    calendarId: el.dataset.calendarId || 'primary',
    title:      el.dataset.title || '(無題)',
    dateStr, startMin, durMin,
  };

  // Fill VIEW mode
  const d = new Date(`${dateStr}T00:00:00`);
  const dateDisp = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' });
  document.getElementById('gcd-title').textContent = _detailCtx.title;
  document.getElementById('gcd-when').textContent  =
    `${dateDisp} ${_fmtMin(startMin)} – ${_fmtMin(startMin + durMin)}`;

  document.getElementById('gcd-view').style.display = 'block';
  document.getElementById('gcd-edit').style.display = 'none';

  const pop = document.getElementById('gcal-detail-pop');
  pop.style.display = 'block';
  const r = el.getBoundingClientRect();
  let left = r.right + 8;
  if (left + 300 > window.innerWidth) left = Math.max(8, r.left - 308);
  pop.style.left = left + 'px';
  pop.style.top  = Math.min(r.top, window.innerHeight - 240) + 'px';
}

function gcalDetailClose() {
  const pop = document.getElementById('gcal-detail-pop');
  if (pop) pop.style.display = 'none';
  _detailCtx = null;
}

function gcalDetailEditMode() {
  if (!_detailCtx) return;
  const { title, dateStr, startMin, durMin } = _detailCtx;
  document.getElementById('gcd-in-title').value = title === '(無題)' ? '' : title;
  document.getElementById('gcd-in-date').value  = dateStr;
  document.getElementById('gcd-in-start').value = `${String(Math.floor(startMin/60)).padStart(2,'0')}:${String(startMin%60).padStart(2,'0')}`;
  const endMin = startMin + durMin;
  document.getElementById('gcd-in-end').value   = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`;
  document.getElementById('gcd-view').style.display = 'none';
  document.getElementById('gcd-edit').style.display = 'block';
  setTimeout(() => document.getElementById('gcd-in-title').focus(), 30);
}

async function gcalDetailSave() {
  if (!_detailCtx) return;
  const { eventId, calendarId } = _detailCtx;
  const title   = document.getElementById('gcd-in-title').value.trim() || '(無題)';
  const dateStr = document.getElementById('gcd-in-date').value;
  const startV  = document.getElementById('gcd-in-start').value;
  const endV    = document.getElementById('gcd-in-end').value;
  if (!dateStr || !startV || !endV) { toast('日付と時刻を入力してください'); return; }

  const tz      = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDt = new Date(`${dateStr}T${startV}:00`);
  let   endDt   = new Date(`${dateStr}T${endV}:00`);
  if (endDt <= startDt) endDt = new Date(startDt.getTime() + 30 * 60000); // guard

  gcalDetailClose();

  const prev = _gcalCacheEdit(eventId, { startIso: startDt.toISOString(), endIso: endDt.toISOString(), summary: title });
  _gcalSetPending(eventId, startDt.toISOString(), endDt.toISOString());   // never let polling revert it
  calRender(true);

  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(eventId)}?calendarId=${encodeURIComponent(calendarId)}`, {
      method:  'PATCH',
      headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        summary: title,
        start: { dateTime: startDt.toISOString(), timeZone: tz },
        end:   { dateTime: endDt.toISOString(),   timeZone: tz },
      }),
    });
    if (res.ok) {
      const undo = prev ? async () => {
        _gcalCacheEdit(eventId, { startIso: prev.start, endIso: prev.end, summary: prev.summary });
        _gcalSetPending(eventId, prev.start, prev.end);
        calRender(true);
        try { await _gcalPatchBack(eventId, calendarId, prev.start, prev.end, prev.summary); gcalSnack('元に戻しました'); }
        catch { toast('元に戻せませんでした'); }
      } : null;
      gcalSnack('予定を更新しました', undo);
    } else {
      // keep the on-screen change; just report
      const err = await res.json().catch(() => ({}));
      toast('更新に失敗: ' + (err.detail?.error?.message || err.error || res.status));
    }
  } catch {
    toast('更新に失敗（通信エラー）— 表示は保持します');
  }
}

async function gcalDetailDelete() {
  if (!_detailCtx) return;
  const { eventId, calendarId } = _detailCtx;
  gcalDetailClose();

  const removed = _gcalCacheDelete(eventId);
  _gcalPendingDeletes[eventId] = Date.now();   // keep it hidden until Google stops returning it
  delete _gcalPendingEdits[eventId];
  calRender(true);

  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(eventId)}?calendarId=${encodeURIComponent(calendarId)}`, {
      method:  'DELETE',
      headers: posAuthHeader(),
    });
    if (res.ok || res.status === 204 || res.status === 410) {
      const undo = removed.length ? async () => {
        delete _gcalPendingDeletes[eventId];
        _gcalCacheRestore(removed);
        calRender(true);
        const ev = removed[0].ev;
        try {
          const r2 = await fetch(`${WORKER_BASE}/api/calendar/events`, {
            method: 'POST', headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary: ev.summary, start: ev.start, end: ev.end }),
          });
          const data = await r2.json().catch(() => ({}));
          if (data.id) { removed.forEach(({ ev }) => { ev.id = data.id; ev._calendarId = 'primary'; }); calRender(); }
          gcalSnack('元に戻しました');
        } catch { toast('元に戻せませんでした'); }
      } : null;
      gcalSnack('予定を削除しました', undo);
    } else {
      delete _gcalPendingDeletes[eventId];
      _gcalCacheRestore(removed);
      calRender(true);
      const err = await res.json().catch(() => ({}));
      toast('削除に失敗: ' + (err.detail?.error?.message || err.error || res.status));
    }
  } catch {
    delete _gcalPendingDeletes[eventId];
    _gcalCacheRestore(removed);
    calRender(true);
    toast('削除に失敗しました（通信エラー）');
  }
}

function _calNewEventAt(col, e) {
  // colRect.top already reflects scroll position — do NOT add scrollTop
  const colRect    = col.getBoundingClientRect();
  const rawY       = e.clientY - colRect.top;
  // Snap to 30-min
  const slotMins   = Math.round(rawY / (GCAL_SLOT_H / 2)) * 30;
  const startH     = Math.max(0, Math.min(Math.floor(slotMins / 60), 23));
  const startM     = ((slotMins % 60) + 60) % 60;

  const dateStr = col.dataset.date;
  const startDt = new Date(`${dateStr}T${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}:00`);
  const endDt   = new Date(startDt.getTime() + 3600000);

  _createEvData = { startDt, endDt };

  const timeStr = startDt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const endStr  = endDt.toLocaleTimeString('ja-JP',   { hour: '2-digit', minute: '2-digit' });
  const dateDisp = startDt.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
  document.getElementById('gcal-pop-lbl').textContent = `${dateDisp}  ${timeStr} – ${endStr}`;
  document.getElementById('gcal-pop-input').value = '';

  const pop = document.getElementById('gcal-create-pop');
  pop.style.display = 'block';
  pop.style.left = Math.min(e.clientX + 8, window.innerWidth - 260) + 'px';
  pop.style.top  = Math.min(e.clientY,     window.innerHeight - 130) + 'px';
  setTimeout(() => document.getElementById('gcal-pop-input').focus(), 40);
}

function gcalPopClose() { document.getElementById('gcal-create-pop').style.display = 'none'; _createEvData = null; }

async function gcalPopSubmit() {
  const title = document.getElementById('gcal-pop-input').value.trim();
  if (!title || !_createEvData) return;
  gcalPopClose();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events`, {
      method:  'POST',
      headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        summary: title,
        start: { dateTime: _createEvData.startDt.toISOString(), timeZone: tz },
        end:   { dateTime: _createEvData.endDt.toISOString(),   timeZone: tz },
      }),
    });
    _gcalEvCache = {};
    calRender();
    toast(res.ok ? '予定を作成しました' : '作成に失敗しました');
  } catch { toast('作成に失敗しました'); }
}

async function _calBuildWeek(preserveScroll = false) {
  const hdr = document.getElementById('gcal-week-hdr');
  const gutterEl = document.getElementById('gcal-gutter-col');
  const gridEl = document.getElementById('gcal-day-grid');
  if (!hdr || !gutterEl || !gridEl) return;

  const ws = _calWeekStart(calDate);
  const we = new Date(ws); we.setDate(we.getDate() + 7);
  const today = new Date();
  const days = Array.from({length:7}, (_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return d; });

  let hdrHtml = '<div class="gcal-gutter"></div>';
  days.forEach(d => {
    const isToday = d.toDateString() === today.toDateString();
    hdrHtml += `<div class="gcal-whd-col">
      <div class="gcal-whd-name">${CAL_DAYS_SHORT[d.getDay()]}</div>
      <div class="gcal-whd-num${isToday?' today':''}" onclick="calJump(${d.getFullYear()},${d.getMonth()},${d.getDate()})">${d.getDate()}</div>
    </div>`;
  });
  hdr.innerHTML = hdrHtml;
  const { events } = await _fetchGcalEvents(ws, we);
  _calBuildTimeGrid(gutterEl, gridEl, days, events, preserveScroll);
}

async function buildDay(preserveScroll = false) {
  const hdr = document.getElementById('gcal-day-hdr');
  const gutterEl = document.getElementById('gcal-gutter-col-day');
  const gridEl = document.getElementById('gcal-day-grid-day');
  if (!hdr || !gutterEl || !gridEl) return;

  const today = new Date();
  const isToday = calDate.toDateString() === today.toDateString();
  hdr.innerHTML = `<div class="gcal-gutter"></div>
    <div class="gcal-whd-col">
      <div class="gcal-whd-name">${CAL_DAYS_SHORT[calDate.getDay()]}</div>
      <div class="gcal-whd-num${isToday?' today':''}">${calDate.getDate()}</div>
    </div>`;
  const start = new Date(calDate); start.setHours(0,0,0,0);
  const end   = new Date(calDate); end.setDate(end.getDate() + 1);
  const { events } = await _fetchGcalEvents(start, end);
  _calBuildTimeGrid(gutterEl, gridEl, [calDate], events, preserveScroll);
}

/* INPUT DOCK TOGGLE */
function toggleInputDock() {
  const dock = document.getElementById('input-dock');
  const btn  = document.getElementById('voice-top');
  if (!dock) return;
  const isOpen = dock.classList.toggle('open');
  if (btn) btn.classList.toggle('active', isOpen);
  if (isOpen) {
    setTimeout(() => { const inp = document.getElementById('inp'); if (inp) inp.focus(); }, 50);
  }
}

/* VOICE */
let voiceOn = false, voiceTimer = null, lastVoice = false;
function toggleVoice() {
  clearTimeout(voiceTimer); // B-03: always clear before toggling
  voiceOn = !voiceOn;
  const btn = document.getElementById('vbtn');
  const topBtn = document.getElementById('voice-top');
  if (voiceOn) {
    btn.classList.add('rec');
    if (topBtn) topBtn.textContent = '■ Stop';
    toast('録音中...');
    voiceTimer = setTimeout(() => {
      voiceOn = false;
      lastVoice = true; // B-06: flag next send as Voice source
      btn.classList.remove('rec');
      if (topBtn) topBtn.textContent = 'Talk';
      const inp = document.getElementById('inp');
      inp.value = 'Whisper APIでリアルタイム音声変換を試してみたい';
      ar(inp);
      toast('音声をテキスト化しました — AI分類中...');
    }, 2500);
  } else {
    btn.classList.remove('rec');
    if (topBtn) topBtn.textContent = 'Talk';
  }
}

/* INPUT */
let mode = 'task';
const modeColors = { task:'var(--am)', journal:'var(--bl)', notes:'var(--tl)' };
const modePh = {
  task:    'Add a task... AI will classify automatically',
  journal: 'Write freely... saved as life log',
  notes:   'Quick note or knowledge...',
};

function cycleModeDisplay() {
  const modes = ['task','journal','notes'];
  const next = modes[(modes.indexOf(mode) + 1) % modes.length];
  mode = next;
  document.getElementById('mode-label').textContent = next.charAt(0).toUpperCase() + next.slice(1);
  document.getElementById('mode-dot').style.background = modeColors[next];
  document.getElementById('inp').placeholder = modePh[next];
}

function ar(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,90)+'px'; }
function hk(e) {
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { send(); return; }
  if (e.key === 'Escape') {
    const dock = document.getElementById('input-dock');
    if (dock) { dock.classList.remove('open'); }
    const btn = document.getElementById('voice-top');
    if (btn) btn.classList.remove('active');
  }
}

function send() {
  const inp = document.getElementById('inp');
  const text = inp.value.trim();
  if (!text) return;
  const source = lastVoice ? 'Voice' : 'Text'; // B-06
  lastVoice = false;
  if (mode === 'task') {
    const newTask = { id:nextTaskId(), title:text, tags:[], priority:'none', status:'todo', category:'', source, createdAt:new Date().toISOString(), sessions:[] };
    tasks.push(newTask);
    Store.setTasks(tasks);
    const board = document.getElementById('kanban-board');
    if (board && board.children.length) { renderTasks(); updateKpiCounts(); }
    toast('Task added');
  } else if (mode === 'journal') {
    const now = new Date();
    const entry = { id:'j'+Date.now(), time:now.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}), source, tag:'Note', text };
    journal.unshift(entry);
    Store.setJournal(journal);
    renderJournal();
    toast('Journal entry saved');
  } else {
    const colors = ['#D4D0BA','#C4CCBA','#CCBCB8','#C0C4CC','#C8C0CC'];
    const note = { id:'n'+Date.now(), title:text.slice(0,30), body:text, color:colors[notes.length % colors.length], createdAt:new Date().toDateString() };
    notes.unshift(note);
    Store.setNotes(notes);
    renderNotes();
    toast('Note saved');
  }
  inp.value = ''; inp.style.height = 'auto';
  // close input dock after sending
  const dock = document.getElementById('input-dock');
  if (dock) dock.classList.remove('open');
  const voiceBtn = document.getElementById('voice-top');
  if (voiceBtn) voiceBtn.classList.remove('active');
}

/* TASK ENGINE */
const KANBAN_COLS = [
  { key:'todo',       label:'To Do',        color:'var(--t2)' },
  { key:'pending',    label:'Pending',      color:'var(--am)' },
  { key:'inprogress', label:'In Progress',  color:'var(--gr)' },
  { key:'done',       label:'Done',         color:'var(--gr)' },
];

/* ── TASK COLOR SYSTEM ──────────────────────────────────────────────────
   Palette maps a display hex to the nearest Google Calendar colorId (1–11),
   so a color chosen on a task reflects in its calendar event. */
const TASK_COLORS = [
  { name:'Blue',   hex:'#4E7EC8', gcal:'7'  },
  { name:'Green',  hex:'#3EA86A', gcal:'10' },
  { name:'Purple', hex:'#8B5ED4', gcal:'3'  },
  { name:'Amber',  hex:'#C49A1E', gcal:'5'  },
  { name:'Red',    hex:'#C44040', gcal:'11' },
  { name:'Teal',   hex:'#2E7A6E', gcal:'2'  },
  { name:'Orange', hex:'#D4622A', gcal:'6'  },
  { name:'Gray',   hex:'#6B7280', gcal:'8'  },
];
const DEFAULT_TASK_COLOR = '#6B7280';

// category → hex map, persisted; seeded with sensible defaults
function getCategoryColors() {
  const stored = JSON.parse(Store.get('category-colors', 'null') || 'null');
  if (stored) return stored;
  const seed = { Coding:'#4E7EC8', Design:'#8B5ED4', Health:'#3EA86A',
    Learning:'#C49A1E', Admin:'#6B7280', Focus:'#C44040' };
  return seed;
}
function setCategoryColor(category, hex) {
  if (!category) return;
  const map = getCategoryColors();
  map[category] = hex;
  Store.set('category-colors', JSON.stringify(map));
}
// resolve a task's effective color: explicit task.color > category color > default
function taskColor(task) {
  if (task && task.color) return task.color;
  if (task && task.category) {
    const map = getCategoryColors();
    if (map[task.category]) return map[task.category];
  }
  return DEFAULT_TASK_COLOR;
}
// nearest Google colorId for a hex (exact palette match, else luminance-ish fallback)
function hexToGcalColorId(hex) {
  if (!hex) return '8';
  const exact = TASK_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  if (exact) return exact.gcal;
  // fallback: nearest by RGB distance
  const toRgb = h => { const n = parseInt(h.replace('#',''),16); return [n>>16&255, n>>8&255, n&255]; };
  const [r,g,b] = toRgb(hex);
  let best = TASK_COLORS[0], bestD = Infinity;
  for (const c of TASK_COLORS) {
    const [cr,cg,cb] = toRgb(c.hex);
    const d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best.gcal;
}
function taskGcalColorId(task) { return hexToGcalColorId(taskColor(task)); }

/* ── TASK ⇆ GOOGLE CALENDAR SYNC (1 session = 1 event, dedicated calendar) ── */
let _tasksCalIdCache = null;
async function _tasksCalId() {
  if (_tasksCalIdCache) return _tasksCalIdCache;
  const ls = localStorage.getItem('tasks-cal-id');
  if (ls) { _tasksCalIdCache = ls; return ls; }
  if (!posSession()) { toast('未ログインのため同期できません'); return null; }
  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/tasks-calendar`, { headers: posAuthHeader() });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.id) {
      _tasksCalIdCache = data.id; localStorage.setItem('tasks-cal-id', data.id); return data.id;
    }
    // Surface the reason so it's not a silent failure
    const reason = data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : (data.error || res.status);
    toast('カレンダー作成失敗: ' + reason + '（ログアウト→再ログインで権限許可を）');
    return null;
  } catch (e) { toast('同期エラー: ' + e.message); return null; }
}

function _sessionBody(task, session, sIdx) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const endIso = session.end || new Date(new Date(session.start).getTime() + 60000).toISOString();
  return {
    summary: task.title,
    start: { dateTime: session.start, timeZone: tz },
    end:   { dateTime: endIso,        timeZone: tz },
    colorId: taskGcalColorId(task),
    extendedProperties: { private: { posTaskId: String(task.id), posSessionIdx: String(sIdx) } },
  };
}

// Create a calendar event for a task work-session; stores gcalEventId on the session.
async function syncCreateSession(task, sIdx) {
  const calId = await _tasksCalId();
  if (!calId) return;
  const session = task.sessions[sIdx];
  if (!session || session.gcalEventId) return;
  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events?calendarId=${encodeURIComponent(calId)}`, {
      method: 'POST', headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(_sessionBody(task, session, sIdx)),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.id) {
      session.gcalEventId = data.id; session.gcalCalId = calId; Store.setTasks(tasks);
      gcalSnack('Googleカレンダーに記録しました');
    } else {
      const reason = data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : (data.error || res.status);
      toast('カレンダー記録失敗: ' + reason);
    }
  } catch (e) { toast('カレンダー記録エラー: ' + e.message); }
}

// Update the session's event (e.g. when it gets an end time on pause/complete).
async function syncUpdateSession(task, sIdx) {
  const session = task.sessions[sIdx];
  if (!session) return;
  if (!session.gcalEventId) return syncCreateSession(task, sIdx);
  const calId = session.gcalCalId || await _tasksCalId();
  if (!calId) return;
  // Protect the task event from poll-reconcile revert until Google catches up.
  const endIso = session.end || new Date(new Date(session.start).getTime() + 60000).toISOString();
  _gcalSetPending(session.gcalEventId, session.start, endIso);
  try {
    const res = await fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(session.gcalEventId)}?calendarId=${encodeURIComponent(calId)}`, {
      method: 'PATCH', headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(_sessionBody(task, session, sIdx)),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const reason = data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : (data.error || res.status);
      toast('カレンダー更新失敗: ' + reason);
    }
  } catch (e) { toast('カレンダー更新エラー: ' + e.message); }
}

async function syncDeleteSession(session) {
  if (!session?.gcalEventId) return;
  const calId = session.gcalCalId;
  if (!calId) return;
  try {
    await fetch(`${WORKER_BASE}/api/calendar/events/${encodeURIComponent(session.gcalEventId)}?calendarId=${encodeURIComponent(calId)}`, {
      method: 'DELETE', headers: posAuthHeader(),
    });
  } catch {}
}

// Find a task+session by the gcal event id (for calendar→task reconciliation).
function findSessionByEventId(eventId) {
  for (const task of (tasks || [])) {
    if (!task.sessions) continue;
    const idx = task.sessions.findIndex(s => s.gcalEventId === eventId);
    if (idx >= 0) return { task, sIdx: idx, session: task.sessions[idx] };
  }
  return null;
}

// Render a small swatch picker; returns HTML. selected = current hex.
function colorPickerHtml(selected, onpickFnName) {
  return TASK_COLORS.map(c =>
    `<span class="color-sw${(selected||'').toLowerCase()===c.hex.toLowerCase()?' sel':''}" title="${c.name}"
      style="background:${c.hex}" onclick="${onpickFnName}('${c.hex}')"></span>`
  ).join('');
}

let currentRunningId = null;
let taskStartTime = null, taskTimerInterval = null;

function startTaskById(id) {
  if (currentRunningId && currentRunningId !== id) pauseTaskById(currentRunningId);
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.status = 'inprogress';
  currentRunningId = id;
  taskStartTime = new Date();
  if (!task.sessions) task.sessions = [];
  task.sessions.push({ start: taskStartTime.toISOString(), end: null });
  Store.setTasks(tasks);
  syncCreateSession(task, task.sessions.length - 1);   // → Google Calendar
  clearInterval(taskTimerInterval);
  taskTimerInterval = setInterval(tickTimer, 1000);
  syncHomeWithTasks();
  renderTasks();
  calSoftRefresh(false);
  // Start Pomo on task start
  startPomoForTask();
  // Open focus mode if auto-enabled
  if (localStorage.getItem('focus-mode-auto') === 'true') {
    openFocusMode(id);
  }
  toast(task.title + ' 開始');
}

function pauseTaskById(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  clearInterval(taskTimerInterval);
  if (task.sessions && task.sessions.length) {
    const last = task.sessions[task.sessions.length - 1];
    if (!last.end) last.end = new Date().toISOString();
    syncUpdateSession(task, task.sessions.length - 1);   // → Google Calendar (set end)
  }
  task.status = 'pending';
  currentRunningId = null;
  taskStartTime = null;
  Store.setTasks(tasks);
  syncHomeWithTasks();
  renderTasks();
  renderSessionLog();
  calSoftRefresh(false);
  toast('中断 — 再開すると続きから記録します');
}

function resumeTaskById(id) { startTaskById(id); }

function completeTaskById(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  clearInterval(taskTimerInterval);
  const elapsed = taskStartTime ? Math.floor((new Date() - taskStartTime) / 60000) : 0;
  if (task.sessions && task.sessions.length) {
    const last = task.sessions[task.sessions.length - 1];
    if (!last.end) last.end = new Date().toISOString();
    syncUpdateSession(task, task.sessions.length - 1);   // → Google Calendar (close out)
  }
  task.status = 'done';
  if (currentRunningId === id) {
    currentRunningId = null; taskStartTime = null;
    if (document.getElementById('focus-overlay').classList.contains('on')) closeFocusMode();
  }
  // Handle recurring: auto-spawn copy back in original column
  if (task.recurring) {
    const origStatus = task.recurring === 'daily' ? 'todo' : 'todo';
    const copy = { ...task, id: nextTaskId(), status: origStatus, sessions: [],
      createdAt: new Date().toISOString() };
    tasks.push(copy);
  }
  Store.setTasks(tasks);
  syncHomeWithTasks();
  renderTasks();
  renderSessionLog();
  updateKpiCounts();
  calSoftRefresh(false);
  toast('完了 — ' + elapsed + 'min 記録しました' + (task.recurring ? ' · 再スケジュール済み' : ''));
}

function tickTimer() {
  if (!taskStartTime || !currentRunningId) return;
  const task = tasks.find(t => t.id === currentRunningId);
  const totalMs  = task ? calcTotalTime(task) : (new Date() - taskStartTime);
  const totalSec = Math.floor(totalMs / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  const startStr = taskStartTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const kpiEl  = document.getElementById('task-running-time');
  const cardEl = document.getElementById('card-timer-' + currentRunningId);
  if (kpiEl)  kpiEl.textContent  = startStr + ' — ' + m + ':' + s;
  if (cardEl) cardEl.textContent = m + ':' + s;
}

function moveTask(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (newStatus === 'inprogress') { startTaskById(id); return; }
  if (currentRunningId === id) {
    clearInterval(taskTimerInterval);
    if (task.sessions && task.sessions.length) {
      const last = task.sessions[task.sessions.length - 1];
      if (!last.end) last.end = new Date().toISOString();
    }
    currentRunningId = null;
    taskStartTime = null;
  }
  task.status = newStatus;
  Store.setTasks(tasks);
  syncHomeWithTasks();
  renderTasks();
  renderSessionLog();
}

function deleteTask(id) {
  if (currentRunningId === id) { clearInterval(taskTimerInterval); currentRunningId = null; taskStartTime = null; }
  const victim = tasks.find(t => t.id === id);
  if (victim?.sessions) victim.sessions.forEach(s => syncDeleteSession(s));  // remove from Google Calendar
  tasks = tasks.filter(t => t.id !== id);
  Store.setTasks(tasks);
  syncHomeWithTasks();
  renderTasks();
  renderSessionLog();
  updateKpiCounts();
}

/* ── TIME HELPERS ── */
function fmtHHMM(iso) {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}
function fmtDur(ms) {
  if (ms <= 0) return '0m';
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60), rm = m % 60;
  return rm > 0 ? h + 'h ' + rm + 'm' : h + 'h';
}
function calcTotalTime(task) {
  if (!task.sessions || !task.sessions.length) return 0;
  let total = 0;
  for (const s of task.sessions) {
    const start = new Date(s.start);
    const end = s.end ? new Date(s.end) : (task.id === currentRunningId ? new Date() : null);
    if (end) total += end - start;
  }
  return total;
}
function renderTimeLog(task) {
  if (!task.sessions || !task.sessions.length) return '';
  const isRunning = task.id === currentRunningId;
  let html = '';
  for (let i = 0; i < task.sessions.length; i++) {
    const s = task.sessions[i];
    const startStr = fmtHHMM(s.start);
    const icon  = i === 0 ? '▶' : '↩';
    const label = i === 0 ? '開始' : '再開';
    const iconColor = 'var(--gr)';
    if (s.end) {
      const endStr = fmtHHMM(s.end);
      const dur = fmtDur(new Date(s.end) - new Date(s.start));
      const isLast = i === task.sessions.length - 1;
      const isDone = task.status === 'done' && isLast;
      const endIcon  = isDone ? '✓' : '⏸';
      const endLabel = isDone ? '完了' : '中断';
      const endColor = isDone ? 'var(--gr)' : 'var(--am)';
      html += '<div class="ttl-line">'
        + '<span style="color:' + iconColor + '">' + icon + '</span>'
        + '<span>' + label + ' ' + startStr + '</span>'
        + '<span class="ttl-arrow">→</span>'
        + '<span style="color:' + endColor + '">' + endIcon + '</span>'
        + '<span>' + endLabel + ' ' + endStr + '</span>'
        + '<span class="ttl-dur">+' + dur + '</span>'
        + '</div>';
    } else if (isRunning) {
      html += '<div class="ttl-line">'
        + '<span style="color:' + iconColor + '">' + icon + '</span>'
        + '<span>' + label + ' ' + startStr + '</span>'
        + '<span class="ttl-arrow">→</span>'
        + '<span style="color:var(--am)">⏱</span>'
        + '<span id="card-timer-' + task.id + '" class="task-timer" style="font-size:9px">00:00</span>'
        + '</div>';
    } else {
      html += '<div class="ttl-line">'
        + '<span style="color:' + iconColor + '">' + icon + '</span>'
        + '<span>' + label + ' ' + startStr + '</span>'
        + '</div>';
    }
  }
  const totalMs  = calcTotalTime(task);
  const totalStr = totalMs >= 60000 ? fmtDur(totalMs) : '';
  if (totalStr && task.sessions.length >= 1) {
    html += '<div class="ttl-total"><span>⏳</span><span>合計 ' + totalStr + '</span></div>';
  }
  return '<div class="task-timelog">' + html + '</div>';
}

/* ── TASK FILTER STATE ── */
let taskFilterSearch = '';
let taskFilterPri = 'all';
let taskFilterTag = null;

function applyTaskFilter() {
  const inp = document.getElementById('tf-search');
  taskFilterSearch = inp ? inp.value.trim().toLowerCase() : '';
  renderTasks();
}

function setFilterPri(el, pri) {
  taskFilterPri = pri;
  const bar = document.getElementById('task-filter-bar');
  if (bar) bar.querySelectorAll('.tf-pill[data-pri]').forEach(p => p.classList.toggle('on', p.dataset.pri === pri));
  renderTasks();
}

function setFilterTag(el, tag) {
  taskFilterTag = taskFilterTag === tag ? null : tag;
  const bar = document.getElementById('task-filter-bar');
  if (bar) bar.querySelectorAll('.tf-pill.tag-pill').forEach(p => p.classList.toggle('on', p.dataset.tag === taskFilterTag));
  renderTasks();
}

function getFilteredCards(colKey) {
  return tasks.filter(t => {
    if (t.status !== colKey) return false;
    if (taskFilterSearch && !t.title.toLowerCase().includes(taskFilterSearch)) return false;
    if (taskFilterPri !== 'all' && t.priority !== taskFilterPri) return false;
    if (taskFilterTag && !(t.tags || []).includes(taskFilterTag)) return false;
    return true;
  });
}

function renderTagFilterPills() {
  const el = document.getElementById('tf-tag-pills');
  if (!el) return;
  const allTags = [...new Set(tasks.flatMap(t => t.tags || []))].slice(0, 8);
  el.innerHTML = allTags.map(tag =>
    `<span class="tf-pill tag-pill${taskFilterTag === tag ? ' on' : ''}" data-tag="${tag}" onclick="setFilterTag(this,'${tag}')">${tag}</span>`
  ).join('');
}

function renderTasks() {
  const board = document.getElementById('kanban-board');
  if (!board) return;
  renderTasksMini();
  board.innerHTML = KANBAN_COLS.map(col => {
    const allCards = tasks.filter(t => t.status === col.key);
    const cards = getFilteredCards(col.key);
    return `<div class="kanban-col" id="kcol-${col.key}"
        ondragover="event.preventDefault();this.classList.add('drag-over-col')"
        ondragleave="this.classList.remove('drag-over-col')"
        ondrop="this.classList.remove('drag-over-col');moveTask(event.dataTransfer.getData('tid'),'${col.key}')">
      <div class="kanban-col-hd">
        <div class="kanban-col-hd-info">
          <span class="kanban-col-dot" style="background:${col.color}"></span>
          <span class="kanban-col-label" style="color:${col.color}">${col.label}</span>
          <span class="kanban-col-count">${allCards.length}</span>
        </div>
        <button class="task-btn" onclick="showAddForm('${col.key}')">+</button>
      </div>
      <div class="kanban-col-body" id="kbody-${col.key}">
        <div id="kadd-${col.key}" style="display:none">
          <div class="task-add-form">
            <input class="task-add-input" id="kinput-${col.key}" placeholder="タスク名..." onkeydown="if(event.key==='Enter')submitAddForm('${col.key}');if(event.key==='Escape')hideAddForm('${col.key}')">
            <div class="task-add-row">
              <select class="task-add-select" id="kpri-${col.key}"><option value="none">Pri</option><option value="high">High</option><option value="med">Med</option><option value="low">Low</option></select>
              <button class="task-btn amber" onclick="submitAddForm('${col.key}')">Add</button>
              <button class="task-btn" onclick="hideAddForm('${col.key}')">×</button>
            </div>
            <div class="task-add-colors" id="kcolor-${col.key}" data-color="">
              ${colorPickerHtml('', `pickAddColor.bind(null,'${col.key}')`)}
            </div>
          </div>
        </div>
        ${cards.map(t => renderCard(t)).join('')}
        ${cards.length === 0 ? `<div class="empty-state">${t('— empty —','— 空 —')}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function getDueDateBadge(task) {
  if (!task.dueDate) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(task.dueDate + 'T00:00:00');
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0)  return `<span class="task-due overdue">Overdue</span>`;
  if (diff === 0) return `<span class="task-due today">Today</span>`;
  if (diff === 1) return `<span class="task-due tomorrow">Tomorrow</span>`;
  return `<span class="task-due future">${task.dueDate.slice(5).replace('-','/')}</span>`;
}

function getEstimateBadge(task) {
  const totalMs = calcTotalTime(task);
  const totalMin = Math.round(totalMs / 60000);
  if (!task.estimate && !totalMin) return '';
  const est = task.estimate ? `~${task.estimate}m` : '';
  const act = totalMin ? `${totalMin}m` : '';
  if (!est && !act) return '';
  return `<span style="font-size:8px;color:var(--t3);font-family:var(--fm)">${est}${est && act ? ' / ' : ''}${act}</span>`;
}

function getSubtaskBar(task) {
  if (!task.subtasks || !task.subtasks.length) return '';
  const done = task.subtasks.filter(s => s.done).length;
  const total = task.subtasks.length;
  const pct = Math.round(done / total * 100);
  return `<div class="subtask-bar-wrap">
    <div class="subtask-bar-track"><div class="subtask-bar-fill" style="width:${pct}%"></div></div>
    <span class="subtask-label">${done}/${total} ✓</span>
  </div>`;
}

function renderCard(task) {
  const isRunning = task.id === currentRunningId;
  const priCls = task.priority === 'high' ? 'task-pri-high' : task.priority === 'med' ? 'task-pri-med' : 'task-pri-low';
  const recurBadge = task.recurring ? `<span class="recurring-badge" title="${task.recurring}">↺ ${task.recurring}</span>` : '';
  const clr = taskColor(task);
  return `<div class="kanban-card${isRunning ? ' running-card-k' : ''}"
      draggable="true"
      style="border-left:3px solid ${clr}"
      ondragstart="event.dataTransfer.setData('tid','${task.id}')"
      ondragend="document.querySelectorAll('.kanban-col').forEach(c=>c.classList.remove('drag-over-col'))">
    <div class="task-num" style="display:flex;align-items:center;gap:5px">
      <span>${task.id}</span>
      ${recurBadge}
      ${getDueDateBadge(task)}
      ${getEstimateBadge(task)}
    </div>
    <div class="task-title" onclick="openTaskDetail('${task.id}')" style="cursor:pointer" title="Click to edit">${task.title}</div>
    ${task.tags && task.tags.length ? '<div class="task-tags">' + task.tags.map(t => `<span class="task-tag">${t}</span>`).join('') + '</div>' : ''}
    <div class="task-meta">
      ${task.priority !== 'none' ? `<span class="task-badge ${priCls}">${task.priority.toUpperCase()}</span>` : ''}
      ${task.category ? `<span class="task-badge task-cat" style="background:${clr}1f;color:${clr}">${task.category}</span>` : ''}
    </div>
    ${getSubtaskBar(task)}
    ${renderTimeLog(task)}
    <div class="task-actions">${getTaskActions(task)}</div>
  </div>`;
}

function getTaskActions(task) {
  const status = task.status;
  const id = task.id;
  if (status === 'inprogress') return `
    <button class="task-btn" onclick="pauseTaskById('${id}')">Pause</button>
    <button class="task-btn amber" onclick="completeTaskById('${id}')">Done</button>
    <button class="task-btn danger" onclick="deleteTask('${id}')">×</button>`;
  if (status === 'done') return `
    <button class="task-btn" onclick="moveTask('${id}','todo')">Reopen</button>
    <button class="task-btn danger" onclick="deleteTask('${id}')">×</button>`;
  if (status === 'pending') return `
    <button class="task-btn amber" onclick="resumeTaskById('${id}')">Resume</button>
    <button class="task-btn danger" onclick="deleteTask('${id}')">×</button>`;
  return `
    <button class="task-btn amber" onclick="startTaskById('${id}')">Start</button>
    <button class="task-btn" onclick="moveTask('${id}','pending')">Pend</button>
    <button class="task-btn danger" onclick="deleteTask('${id}')">×</button>`;
}

function showAddForm(status) {
  document.querySelectorAll('[id^="kadd-"]').forEach(el => el.style.display = 'none');
  const form = document.getElementById('kadd-' + status);
  if (form) { form.style.display = ''; const inp = document.getElementById('kinput-' + status); if (inp) inp.focus(); }
}

function hideAddForm(status) {
  const form = document.getElementById('kadd-' + status);
  if (form) form.style.display = 'none';
}

function nextTaskId() {
  if (!tasks.length) return 'T001';
  const max = Math.max(...tasks.map(t => parseInt(t.id.replace('T', '')) || 0));
  return 'T' + String(max + 1).padStart(3, '0');
}

function pickAddColor(colKey, hex) {
  const box = document.getElementById('kcolor-' + colKey);
  if (!box) return;
  box.dataset.color = hex;
  const sws = box.querySelectorAll('.color-sw');
  sws.forEach(sw => sw.classList.remove('sel'));
  const idx = TASK_COLORS.findIndex(c => c.hex.toLowerCase() === hex.toLowerCase());
  if (idx >= 0 && sws[idx]) sws[idx].classList.add('sel');
}

function submitAddForm(status) {
  const inp = document.getElementById('kinput-' + status);
  const pri = document.getElementById('kpri-' + status);
  if (!inp || !inp.value.trim()) return;
  const colorBox = document.getElementById('kcolor-' + status);
  const color = colorBox && colorBox.dataset.color ? colorBox.dataset.color : null;
  const id = nextTaskId();
  tasks.push({ id, title: inp.value.trim(), status, priority: pri ? pri.value : 'none',
    category: '', color, tags: [], sessions: [],
    dueDate: null, estimate: null, notes: '', subtasks: [], recurring: null,
    createdAt: new Date().toISOString() });
  Store.setTasks(tasks);
  inp.value = '';
  hideAddForm(status);
  renderTasks();
  updateKpiCounts();
}

function renderSessionLog() {
  const el = document.getElementById('session-log-body');
  if (!el) return;
  const today = new Date().toDateString();
  const rows = [];
  tasks.forEach(task => {
    (task.sessions || []).forEach(s => {
      if (!s.start) return;
      const d = new Date(s.start);
      if (d.toDateString() !== today) return;
      const dur = s.end ? Math.round((new Date(s.end) - d) / 60000) + 'm' : 'Live';
      const col = s.end ? 'var(--t3)' : 'var(--am)';
      const name = task.title.length > 16 ? task.title.slice(0, 15) + '…' : task.title;
      rows.push(`<div style="display:grid;grid-template-columns:1fr 36px;padding:4px 0;border-bottom:1px solid var(--b1);align-items:center;gap:4px">
        <span style="font-size:10px;color:var(--t1);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${name}</span>
        <span style="font-size:9px;color:${col};text-align:right;font-family:var(--fm)">${dur}</span>
      </div>`);
    });
  });
  el.innerHTML = rows.length ? rows.join('') : '<div style="padding:12px 0;font-size:10px;color:var(--t3)">セッションなし</div>';
}

function syncHomeWithTasks() {
  const nameEl = document.getElementById('home-running-name');
  const subEl  = document.getElementById('home-running-sub');
  const rnEl   = document.getElementById('running-task-name');
  const slEl   = document.getElementById('running-status-label');
  if (currentRunningId) {
    const task = tasks.find(t => t.id === currentRunningId);
    if (task) {
      if (nameEl) nameEl.textContent = task.title;
      if (subEl)  subEl.textContent  = task.category || task.status;
      if (rnEl)   rnEl.textContent   = task.title;
      if (slEl)   slEl.textContent   = 'Active';
      return;
    }
  }
  if (nameEl) nameEl.textContent = '—';
  if (subEl)  subEl.innerHTML   = t('No task','タスクなし');
  if (rnEl)   rnEl.textContent   = '—';
  if (slEl)   slEl.textContent   = '—';
  const timeEl = document.getElementById('task-running-time');
  if (timeEl) timeEl.textContent = '—';
}

function updateKpiCounts() {
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const doneEl = document.getElementById('kpi-done');
  const ofEl   = document.getElementById('kpi-done-of');
  const rateEl = document.getElementById('kpi-rate');
  if (doneEl) doneEl.textContent = done;
  if (ofEl)   ofEl.textContent   = total;
  if (rateEl) rateEl.textContent = total > 0 ? Math.round(done/total*100) + '%' : '—';
  const focusMins = tasks.reduce((acc, t) => {
    return acc + (t.sessions || []).reduce((a2, s) => {
      if (!s.start || !s.end) return a2;
      return a2 + Math.round((new Date(s.end) - new Date(s.start)) / 60000);
    }, 0);
  }, 0);
  const focusEl = document.getElementById('kpi-focus');
  if (focusEl) focusEl.textContent = focusMins >= 60 ? Math.floor(focusMins/60) + 'h ' + (focusMins%60) + 'm' : focusMins + 'm';
}

function checkHabitReset() {
  const key = 'habit-reset-date';
  const today = new Date().toDateString();
  if (Store.get(key, '') !== today) {
    Store.set(key, today);
    Store.set('habits', '{}');
    renderHabits();
  }
}

/* backward compat stubs */
function startTask(btn, name) { const t = tasks.find(x => x.title === name); if (t) startTaskById(t.id); }
function pauseTask() { if (currentRunningId) pauseTaskById(currentRunningId); }
function endTask() { if (currentRunningId) completeTaskById(currentRunningId); }

/* POMODORO */
let pomoRunning = false, pomoSeconds = 25*60, pomoInterval = null;
function togglePomo() {
  pomoRunning = !pomoRunning;
  const btn = document.getElementById('pomo-btn');
  if (pomoRunning) {
    btn.textContent = '|| Pause';
    pomoInterval = setInterval(() => {
      if (pomoSeconds <= 0) { clearInterval(pomoInterval); pomoRunning=false; btn.textContent='> Start'; toast('Pomodoro 完了'); return; }
      pomoSeconds--;
      const m = Math.floor(pomoSeconds/60), s = pomoSeconds%60;
      document.getElementById('pomo-display').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      const pct = pomoSeconds / (25*60);
      document.getElementById('pomo-ring').setAttribute('stroke-dashoffset', 138.2 * (1 - pct));
    }, 1000);
  } else {
    clearInterval(pomoInterval);
    btn.textContent = '> Start';
  }
}

function resetPomo() {
  clearInterval(pomoInterval); pomoRunning=false;
  pomoSeconds=25*60;
  const pd = document.getElementById('pomo-display'); if (pd) pd.textContent='25:00';
  const pr = document.getElementById('pomo-ring'); if (pr) pr.setAttribute('stroke-dashoffset','0');
  const pb = document.getElementById('pomo-btn'); if (pb) pb.textContent='> Start';
  updatePomoKpiIndicator();
}

function startPomoForTask() {
  clearInterval(pomoInterval);
  pomoRunning = true;
  pomoSeconds = 25 * 60;
  const pomoInd = document.getElementById('pomo-kpi-indicator');
  if (pomoInd) pomoInd.style.display = 'flex';
  pomoInterval = setInterval(() => {
    if (pomoSeconds <= 0) {
      clearInterval(pomoInterval); pomoRunning = false;
      const pomoInd2 = document.getElementById('pomo-kpi-indicator');
      if (pomoInd2) pomoInd2.style.display = 'none';
      toast('Pomodoro 完了');
      return;
    }
    pomoSeconds--;
    updatePomoKpiIndicator();
    // sync focus overlay ring
    const fr = document.getElementById('focus-pomo-ring');
    const ft = document.getElementById('focus-pomo-time');
    if (fr) {
      const pct = pomoSeconds / (25*60);
      fr.setAttribute('stroke-dashoffset', (364.4 * (1 - pct)).toFixed(1));
    }
    if (ft) {
      const m = Math.floor(pomoSeconds/60), s = pomoSeconds%60;
      ft.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    // sync existing pomo widget
    const pd = document.getElementById('pomo-display');
    const pr = document.getElementById('pomo-ring');
    if (pd) { const m=Math.floor(pomoSeconds/60),s=pomoSeconds%60; pd.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
    if (pr) pr.setAttribute('stroke-dashoffset', (138.2*(1-pomoSeconds/(25*60))).toFixed(1));
  }, 1000);
}

function updatePomoKpiIndicator() {
  const ind = document.getElementById('pomo-kpi-indicator');
  const ring = document.getElementById('pomo-kpi-ring');
  const timeEl = document.getElementById('pomo-kpi-time');
  if (!ind) return;
  if (!pomoRunning) { ind.style.display = 'none'; return; }
  ind.style.display = 'flex';
  const m = Math.floor(pomoSeconds/60), s = pomoSeconds%60;
  if (timeEl) timeEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if (ring) {
    const pct = pomoSeconds / (25*60);
    ring.setAttribute('stroke-dashoffset', (50.3 * (1 - pct)).toFixed(1));
  }
}

/* ── FOCUS MODE ── */
let focusElapsedInterval = null;

function openFocusMode(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  const overlay = document.getElementById('focus-overlay');
  const titleEl = document.getElementById('focus-task-title');
  const subtasksEl = document.getElementById('focus-subtasks');
  if (titleEl) titleEl.textContent = task.title;
  // Render subtasks
  if (task.subtasks && task.subtasks.length) {
    subtasksEl.style.display = '';
    subtasksEl.innerHTML = task.subtasks.map(st =>
      `<div class="focus-subtask-item">
        <div class="focus-subtask-check${st.done ? ' done' : ''}" onclick="toggleFocusSubtask('${task.id}','${st.id}',this)">${st.done ? '✓' : ''}</div>
        <span class="focus-subtask-label${st.done ? ' done' : ''}">${st.title}</span>
      </div>`
    ).join('');
  } else {
    subtasksEl.style.display = 'none';
  }
  overlay.dataset.taskId = taskId;
  // Sync pomo ring
  const fr = document.getElementById('focus-pomo-ring');
  const ft = document.getElementById('focus-pomo-time');
  if (fr) { const pct = pomoSeconds/(25*60); fr.setAttribute('stroke-dashoffset',(364.4*(1-pct)).toFixed(1)); }
  if (ft) { const m=Math.floor(pomoSeconds/60),s=pomoSeconds%60; ft.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
  overlay.classList.add('on');
  // Elapsed timer
  clearInterval(focusElapsedInterval);
  focusElapsedInterval = setInterval(() => {
    const el = document.getElementById('focus-elapsed');
    if (!el || !taskStartTime) return;
    const ms = new Date() - taskStartTime;
    el.innerHTML = t('Elapsed: ','経過: ') + fmtDur(ms);
  }, 1000);
}

function closeFocusMode() {
  document.getElementById('focus-overlay').classList.remove('on');
  clearInterval(focusElapsedInterval);
}

function focusTogglePause() {
  const btn = document.getElementById('focus-pause-btn');
  if (!btn) return;
  if (currentRunningId) {
    if (pomoRunning) {
      // Pause pomo
      clearInterval(pomoInterval); pomoRunning = false;
      btn.textContent = '▶ Resume';
      pauseTaskById(currentRunningId);
    } else {
      // Resume
      const tid = document.getElementById('focus-overlay').dataset.taskId;
      if (tid) { resumeTaskById(tid); btn.textContent = '⏸ Pause'; }
    }
  }
}

function focusComplete() {
  const tid = document.getElementById('focus-overlay').dataset.taskId;
  if (tid) completeTaskById(tid);
  closeFocusMode();
}

function toggleFocusSubtask(taskId, stId, el) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;
  const st = task.subtasks.find(s => s.id === stId);
  if (!st) return;
  st.done = !st.done;
  Store.setTasks(tasks);
  el.classList.toggle('done', st.done);
  el.textContent = st.done ? '✓' : '';
  const label = el.nextElementSibling;
  if (label) label.classList.toggle('done', st.done);
  renderTasks();
}

/* WIDGETS */
let selWidget = null;
function openModal() { selWidget=null; document.getElementById('modal').classList.add('on'); }
function closeModal() { document.getElementById('modal').classList.remove('on'); }
function selW(el,id) { document.querySelectorAll('.wi').forEach(i=>i.classList.remove('sel')); el.classList.add('sel'); selWidget=id; }
function confirmAdd() {
  if (!selWidget) { toast('ウィジェットを選択してください'); return; }
  const el = document.getElementById(selWidget);
  if (el) { el.style.display = ''; Store.set('widget-hidden-' + selWidget, '0'); }
  toast('ウィジェットを追加しました');
  closeModal();
}
function removeW(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'none'; Store.set('widget-hidden-' + id, '1'); toast('ウィジェットを非表示にしました'); }
}

/* RENDER */
const TAG_BG   = { Think:'rgba(78,126,200,0.15)', Idea:'rgba(196,154,30,0.18)', Note:'rgba(62,168,106,0.12)', default:'var(--s2)' };
const TAG_COL  = { Think:'var(--bl)', Idea:'var(--am)', Note:'var(--gr)', default:'var(--t3)' };
const NOTE_COLORS = ['#D4D0BA','#C4CCBA','#CCBCB8','#C0C4CC','#C8C0CC','#BACCC4'];

function renderJournal() {
  const el = document.getElementById('journal-stream');
  if (!el) return;
  if (journal.length === 0) { el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3);font-size:11px">エントリーがありません</div>'; return; }
  el.innerHTML = journal.map(e => `
    <div class="je">
      <div class="je-top">
        <span class="je-time">${e.time}</span>
        <span class="je-src">${e.source}</span>
        <span class="tag" style="background:${TAG_BG[e.tag]||TAG_BG.default};color:${TAG_COL[e.tag]||TAG_COL.default}">${e.tag}</span>
      </div>
      <div class="je-text">${e.text}</div>
    </div>`).join('');
}

function renderNotes() {
  const el = document.getElementById('notes-grid');
  if (!el) return;
  el.innerHTML = notes.map(n => `
    <div class="nc" style="background:${n.color}" onclick="toast('${n.title.replace(/'/g,"\\'")}')">
      <div class="nc-t">${n.title}</div>
      <div class="nc-p">${n.body}</div>
      <div class="nc-m">${n.createdAt}</div>
    </div>`).join('') +
    `<div class="nc" style="background:#C0C0CC" onclick="openNoteNew()">
      <div style="font-size:20px;color:rgba(26,26,30,0.25);text-align:center;padding:20px 0">+</div>
    </div>`;
}

function openNoteNew() { toast('Note — Phase 2 で実装予定'); }

/* ANALYTICS TABS */
function showAnalyticsTab(label) {
  const map = { 'Weekly':'analytics-weekly', 'Tags':'analytics-tags', 'Trends':'analytics-trends', 'AI Review':'analytics-ai' };
  Object.values(map).forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
  const target = map[label];
  if (target) { const e = document.getElementById(target); if (e) e.style.display = ''; }
  if (label === 'AI Review') { setTimeout(renderMoodGraph, 50); }
}

/* TOAST */
function toast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); setTimeout(()=>t.classList.remove('on'),2200); }

/* ══════════════════════════════════════════════════════════════
   TASK DETAIL DRAWER
   ══════════════════════════════════════════════════════════════ */
let tddTaskId = null;

function openTaskDetail(id) {
  tddTaskId = id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  // Ensure new fields exist
  if (!task.dueDate)  task.dueDate  = null;
  if (!task.estimate) task.estimate = null;
  if (!task.notes)    task.notes    = '';
  if (!task.subtasks) task.subtasks = [];
  if (!task.recurring) task.recurring = null;

  const body = document.getElementById('tdd-body');
  const footer = document.getElementById('tdd-footer');
  if (!body) return;

  body.innerHTML = `
    <div>
      <div class="tdd-label">Title</div>
      <input class="tdd-input" id="tdd-title" value="${task.title.replace(/"/g,'&quot;')}">
    </div>
    <div class="tdd-row2">
      <div>
        <div class="tdd-label">Priority</div>
        <select class="tdd-select" id="tdd-pri">
          <option value="none"${task.priority==='none'?' selected':''}>None</option>
          <option value="high"${task.priority==='high'?' selected':''}>High</option>
          <option value="med"${task.priority==='med'?' selected':''}>Med</option>
          <option value="low"${task.priority==='low'?' selected':''}>Low</option>
        </select>
      </div>
      <div>
        <div class="tdd-label">Category</div>
        <input class="tdd-input" id="tdd-cat" value="${task.category||''}">
      </div>
    </div>
    <div>
      <div class="tdd-label">Color <span style="color:var(--t4);font-weight:400">（カレンダーにも反映）</span></div>
      <div class="task-add-colors" id="tdd-color" data-color="${task.color||''}">
        ${colorPickerHtml(task.color || (task.category ? getCategoryColors()[task.category] : '') || '', 'pickDetailColor')}
        <span class="color-sw color-sw-clear${task.color?'':' sel'}" title="カテゴリ色を使う" onclick="pickDetailColor('')">∅</span>
      </div>
    </div>
    <div class="tdd-row2">
      <div>
        <div class="tdd-label">Due Date</div>
        <input class="tdd-input" id="tdd-due" type="date" value="${task.dueDate||''}">
      </div>
      <div>
        <div class="tdd-label">Estimate (min)</div>
        <input class="tdd-input" id="tdd-est" type="number" min="0" value="${task.estimate||''}" placeholder="—">
      </div>
    </div>
    <div>
      <div class="tdd-label">Recurring</div>
      <select class="tdd-select" id="tdd-recurring">
        <option value="">None</option>
        <option value="daily"${task.recurring==='daily'?' selected':''}>Daily</option>
        <option value="weekly"${task.recurring==='weekly'?' selected':''}>Weekly</option>
        <option value="monthly"${task.recurring==='monthly'?' selected':''}>Monthly</option>
      </select>
    </div>
    <div>
      <div class="tdd-label">Tags (comma-separated)</div>
      <input class="tdd-input" id="tdd-tags" value="${(task.tags||[]).join(', ')}">
    </div>
    <div>
      <div class="tdd-label">Notes</div>
      <textarea class="tdd-textarea" id="tdd-notes" rows="3">${task.notes||''}</textarea>
    </div>
    <div>
      <div class="tdd-label" style="margin-bottom:5px">Subtasks (${(task.subtasks||[]).filter(s=>s.done).length}/${(task.subtasks||[]).length})</div>
      <div id="tdd-subtask-list">
        ${(task.subtasks||[]).map(st => `
          <div class="subtask-item" id="stitem-${st.id}">
            <div class="subtask-check${st.done?' done':''}" onclick="tddToggleSubtask('${st.id}')">${st.done?'✓':''}</div>
            <span class="subtask-text${st.done?' done':''}">${st.title}</span>
            <button class="subtask-del" onclick="tddDeleteSubtask('${st.id}')">×</button>
          </div>`).join('')}
      </div>
      <div class="subtask-add-row">
        <input class="subtask-add-input" id="tdd-new-subtask" placeholder="Add subtask…" onkeydown="if(event.key==='Enter')tddAddSubtask()">
        <button class="task-btn" onclick="tddAddSubtask()">Add</button>
      </div>
    </div>
    <div>
      <div class="tdd-label">Focus</div>
      <button class="task-btn amber" onclick="openFocusMode('${id}');closeTaskDetail()">Open Focus Mode</button>
    </div>
  `;

  footer.innerHTML = `
    <button class="btn-g" onclick="tddDeleteTask('${id}')" style="color:var(--rd)">Delete</button>
    <div style="flex:1"></div>
    <button class="btn-g" onclick="closeTaskDetail()">Cancel</button>
    <button class="btn-a" onclick="tddSave()">Save</button>
  `;

  document.getElementById('tdd-overlay').classList.add('on');
  document.getElementById('task-detail-drawer').classList.add('open');
}

function closeTaskDetail() {
  document.getElementById('tdd-overlay').classList.remove('on');
  document.getElementById('task-detail-drawer').classList.remove('open');
  tddTaskId = null;
}

function pickDetailColor(hex) {
  const box = document.getElementById('tdd-color');
  if (!box) return;
  box.dataset.color = hex;
  box.querySelectorAll('.color-sw').forEach(sw => sw.classList.remove('sel'));
  if (!hex) { const clr = box.querySelector('.color-sw-clear'); if (clr) clr.classList.add('sel'); return; }
  const idx = TASK_COLORS.findIndex(c => c.hex.toLowerCase() === hex.toLowerCase());
  const sws = box.querySelectorAll('.color-sw');
  if (idx >= 0 && sws[idx]) sws[idx].classList.add('sel');
}

function tddSave() {
  const task = tasks.find(t => t.id === tddTaskId);
  if (!task) return;
  task.title    = document.getElementById('tdd-title').value.trim() || task.title;
  task.priority = document.getElementById('tdd-pri').value;
  task.category = document.getElementById('tdd-cat').value.trim();
  const colorBox = document.getElementById('tdd-color');
  task.color = colorBox && colorBox.dataset.color ? colorBox.dataset.color : null;
  // remember this color as the category's color too (so siblings inherit)
  if (task.color && task.category) setCategoryColor(task.category, task.color);
  task.dueDate  = document.getElementById('tdd-due').value || null;
  const estVal  = parseInt(document.getElementById('tdd-est').value);
  task.estimate = isNaN(estVal) ? null : estVal;
  task.recurring = document.getElementById('tdd-recurring').value || null;
  task.notes    = document.getElementById('tdd-notes').value;
  const tagStr  = document.getElementById('tdd-tags').value;
  task.tags     = tagStr ? tagStr.split(',').map(s=>s.trim()).filter(Boolean) : [];
  Store.setTasks(tasks);
  closeTaskDetail();
  renderTasks();
  renderTagFilterPills();
  toast('Task saved');
}

function tddToggleSubtask(stId) {
  const task = tasks.find(t => t.id === tddTaskId);
  if (!task) return;
  const st = (task.subtasks||[]).find(s => s.id === stId);
  if (!st) return;
  st.done = !st.done;
  Store.setTasks(tasks);
  const el = document.getElementById('stitem-' + stId);
  if (el) {
    const chk = el.querySelector('.subtask-check');
    const lbl = el.querySelector('.subtask-text');
    if (chk) { chk.classList.toggle('done', st.done); chk.textContent = st.done ? '✓' : ''; }
    if (lbl) lbl.classList.toggle('done', st.done);
  }
}

function tddDeleteSubtask(stId) {
  const task = tasks.find(t => t.id === tddTaskId);
  if (!task) return;
  task.subtasks = (task.subtasks||[]).filter(s => s.id !== stId);
  Store.setTasks(tasks);
  const el = document.getElementById('stitem-' + stId);
  if (el) el.remove();
}

function tddAddSubtask() {
  const inp = document.getElementById('tdd-new-subtask');
  if (!inp || !inp.value.trim()) return;
  const task = tasks.find(t => t.id === tddTaskId);
  if (!task) return;
  if (!task.subtasks) task.subtasks = [];
  const stId = 'st' + Date.now();
  task.subtasks.push({ id: stId, title: inp.value.trim(), done: false });
  Store.setTasks(tasks);
  const list = document.getElementById('tdd-subtask-list');
  if (list) {
    const div = document.createElement('div');
    div.className = 'subtask-item';
    div.id = 'stitem-' + stId;
    div.innerHTML = `<div class="subtask-check" onclick="tddToggleSubtask('${stId}')"></div><span class="subtask-text">${inp.value.trim()}</span><button class="subtask-del" onclick="tddDeleteSubtask('${stId}')">×</button>`;
    list.appendChild(div);
  }
  inp.value = '';
}

function tddDeleteTask(id) {
  if (!confirm('Delete this task?')) return;
  deleteTask(id);
  closeTaskDetail();
}

/* ══════════════════════════════════════════════════════════════
   TASK TEMPLATES
   ══════════════════════════════════════════════════════════════ */
const BUILTIN_TEMPLATES = [
  {
    id: 'morning-routine', name: 'Morning Routine', desc: 'Start your day right',
    tasks: [
      { title: '朝の体操・ストレッチ', status: 'todo', priority: 'med', category: 'Health', tags: ['health'], estimate: 10 },
      { title: '朝食', status: 'todo', priority: 'med', category: 'Health', tags: ['health'], estimate: 20 },
      { title: '英語学習 (30分)', status: 'todo', priority: 'high', category: 'Learning', tags: ['learning'], estimate: 30 },
      { title: '今日のタスク確認', status: 'todo', priority: 'high', category: 'Admin', tags: ['admin'], estimate: 10 },
    ]
  },
  {
    id: 'deep-work', name: 'Deep Work Session', desc: '4-hour focus block',
    tasks: [
      { title: '環境整備 (通知OFF)', status: 'todo', priority: 'high', category: 'Focus', tags: ['focus'], estimate: 5 },
      { title: 'メインタスク (90分)', status: 'todo', priority: 'high', category: 'Focus', tags: ['focus'], estimate: 90 },
      { title: '短い休憩', status: 'todo', priority: 'low', category: 'Health', tags: ['health'], estimate: 15 },
      { title: 'サブタスク (60分)', status: 'todo', priority: 'med', category: 'Focus', tags: ['focus'], estimate: 60 },
    ]
  },
  {
    id: 'weekly-review', name: 'Weekly Review', desc: 'Reflect and plan',
    tasks: [
      { title: '先週のタスクをレビュー', status: 'todo', priority: 'high', category: 'Admin', tags: ['review'], estimate: 20 },
      { title: 'ジャーナルを読み返す', status: 'todo', priority: 'med', category: 'Admin', tags: ['review'], estimate: 15 },
      { title: '来週の目標を設定', status: 'todo', priority: 'high', category: 'Admin', tags: ['review'], estimate: 20 },
      { title: 'カレンダー整理', status: 'todo', priority: 'med', category: 'Admin', tags: ['admin'], estimate: 10 },
    ]
  },
];

function openTemplatesModal() {
  const list = document.getElementById('templates-list');
  if (!list) return;
  const userTemplates = Store.getTemplates();
  const allTemplates = [...BUILTIN_TEMPLATES, ...userTemplates];
  list.innerHTML = allTemplates.map(t =>
    `<div class="template-item" onclick="applyTemplate('${t.id}')">
      <div class="template-name">${t.name}</div>
      <div class="template-desc">${t.desc || ''}</div>
      <div class="template-count">${t.tasks.length} tasks</div>
    </div>`
  ).join('');
  document.getElementById('templates-modal').classList.add('on');
}

function closeTemplatesModal() {
  document.getElementById('templates-modal').classList.remove('on');
}

function applyTemplate(id) {
  const allTemplates = [...BUILTIN_TEMPLATES, ...Store.getTemplates()];
  const tmpl = allTemplates.find(t => t.id === id);
  if (!tmpl) return;
  tmpl.tasks.forEach(tt => {
    tasks.push({
      id: nextTaskId(),
      title: tt.title, status: tt.status || 'todo',
      priority: tt.priority || 'none', category: tt.category || '',
      tags: tt.tags || [], sessions: [],
      dueDate: null, estimate: tt.estimate || null, notes: '', subtasks: [], recurring: null,
      createdAt: new Date().toISOString()
    });
  });
  Store.setTasks(tasks);
  renderTasks();
  updateKpiCounts();
  closeTemplatesModal();
  toast(`Template "${tmpl.name}" applied (${tmpl.tasks.length} tasks)`);
}

function saveCurrentAsTemplate() {
  const name = prompt('Template name:');
  if (!name) return;
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const userTemplates = Store.getTemplates();
  userTemplates.push({
    id: 'user-' + Date.now(), name, desc: 'Custom template',
    tasks: activeTasks.map(t => ({ title: t.title, status: 'todo', priority: t.priority, category: t.category, tags: t.tags, estimate: t.estimate }))
  });
  Store.setTemplates(userTemplates);
  toast('Template saved: ' + name);
  openTemplatesModal();
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS — FOCUS AUTO
   ══════════════════════════════════════════════════════════════ */
function loadFocusAutoSetting() {
  const tog = document.getElementById('focus-auto-tog');
  if (tog) tog.classList.toggle('on', localStorage.getItem('focus-mode-auto') === 'true');
}
function toggleFocusAutoSetting(el) {
  el.classList.toggle('on');
  localStorage.setItem('focus-mode-auto', el.classList.contains('on') ? 'true' : 'false');
  toast('Focus auto-mode ' + (el.classList.contains('on') ? 'enabled' : 'disabled'));
}

/* ══════════════════════════════════════════════════════════════
   NOTES BOARD
   ══════════════════════════════════════════════════════════════ */
let notesBoard = Store.getNoteBoard();
const NOTE_BOARD_COLS = [
  { key:'inbox',      label:'Inbox',      color:'var(--am)' },
  { key:'processing', label:'Processing', color:'var(--bl)' },
  { key:'archive',    label:'Archive',    color:'var(--tl)' },
];
const NB_COLORS = ['#D4D0BA','#C4CCBA','#CCBCB8','#C0C4CC','#C8C0CC','#BACCC4'];

function seedNotesBoardDemo() {
  if (notesBoard.length > 0) return;
  notesBoard = [
    { id:'nb001', title:'Read "Deep Work"', body:'Read chapters 1-3 and take notes on focus techniques.', color:'#D4D0BA', column:'inbox', createdAt:new Date().toISOString(), tags:['reading'] },
    { id:'nb002', title:'App architecture ideas', body:'Consider moving to a module pattern. Split health.js from tasks.js for maintainability.', color:'#C0C4CC', column:'inbox', createdAt:new Date().toISOString(), tags:['dev'] },
    { id:'nb003', title:'Morning routine optimization', body:'Try 10-min meditation before coffee. Track energy levels for 2 weeks to compare.', color:'#C4CCBA', column:'inbox', createdAt:new Date().toISOString(), tags:['health'] },
    { id:'nb004', title:'Weekly review process', body:'Every Sunday: review goals, plan next week, clear inbox, update journal.', color:'#CCBCB8', column:'processing', createdAt:new Date().toISOString(), tags:['system'] },
    { id:'nb005', title:'Keyboard shortcut cheatsheet', body:'Cmd+K: command palette\nCmd+J: journal\nCmd+T: tasks\nEsc: close panels', color:'#C8C0CC', column:'processing', createdAt:new Date().toISOString(), tags:['dev'] },
    { id:'nb006', title:'English study plan v2', body:'Completed: shadowing method outline. Started Anki deck for N2 vocab.', color:'#BACCC4', column:'archive', createdAt:new Date().toISOString(), tags:['english'] },
  ];
  Store.setNoteBoard(notesBoard);
}

let nebEditId = null;

function renderNotesBoard() {
  seedNotesBoardDemo();
  notesBoard = Store.getNoteBoard();
  const board = document.getElementById('notes-board');
  if (!board) return;
  board.innerHTML = NOTE_BOARD_COLS.map(col => {
    const cards = notesBoard.filter(n => n.column === col.key);
    return `<div class="notes-col" id="ncol-${col.key}"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="this.classList.remove('drag-over');nbDrop(event,'${col.key}')">
      <div class="notes-col-hd" style="border-left:3px solid ${col.color}">
        <span class="notes-col-label">${col.label}</span>
        <span class="notes-col-count">${cards.length}</span>
        <button class="task-btn" style="margin-left:auto;font-size:13px;width:22px;height:22px;border-radius:6px" onclick="nbAddToCol('${col.key}')">+</button>
      </div>
      <div class="notes-col-body" id="nbody-${col.key}">
        ${cards.map(n => renderNoteCard(n)).join('')}
        ${cards.length === 0 ? `<div class="empty-state">${t('— empty —','— 空 —')}</div>` : ''}
      </div>
      <div class="note-quick-form" id="nbquick-${col.key}" style="display:none">
        <textarea class="note-quick-input" id="nbinput-${col.key}" placeholder="Write a note… Enter to save"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();nbQuickSave('${col.key}');}if(event.key==='Escape')nbHideQuick('${col.key}')"></textarea>
      </div>
    </div>`;
  }).join('');
}

function renderNoteCard(note) {
  const borderColor = note.color || '#D4D0BA';
  return `<div class="note-card" draggable="true"
      style="border-left-color:${borderColor}"
      ondragstart="event.dataTransfer.setData('nbid','${note.id}')"
      ondragend="document.querySelectorAll('.notes-col').forEach(c=>c.classList.remove('drag-over'))"
      onclick="openNoteEdit('${note.id}')">
    <div class="note-card-title">${note.title||'Untitled'}</div>
    <div class="note-card-body">${note.body||''}</div>
    <div class="note-card-meta">
      <span class="note-card-date">${(note.createdAt||'').slice(0,10)}</span>
      <div class="note-card-tags">${(note.tags||[]).map(t=>`<span class="note-card-tag">${t}</span>`).join('')}</div>
    </div>
  </div>`;
}

function nbDrop(e, colKey) {
  const id = e.dataTransfer.getData('nbid');
  if (!id) return;
  const note = notesBoard.find(n => n.id === id);
  if (note) { note.column = colKey; Store.setNoteBoard(notesBoard); renderNotesBoard(); }
}

function nbAddToCol(colKey) {
  const form = document.getElementById('nbquick-' + colKey);
  if (form) { form.style.display = ''; const inp = document.getElementById('nbinput-' + colKey); if (inp) inp.focus(); }
}

function nbHideQuick(colKey) {
  const form = document.getElementById('nbquick-' + colKey);
  if (form) { form.style.display = 'none'; const inp = document.getElementById('nbinput-' + colKey); if (inp) inp.value = ''; }
}

function nbQuickSave(colKey) {
  const inp = document.getElementById('nbinput-' + colKey);
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  const note = {
    id: 'nb' + Date.now(), title: text.split('\n')[0].slice(0,50),
    body: text, color: NB_COLORS[notesBoard.length % NB_COLORS.length],
    column: colKey, createdAt: new Date().toISOString(), tags: []
  };
  notesBoard.push(note);
  Store.setNoteBoard(notesBoard);
  nbHideQuick(colKey);
  renderNotesBoard();
  toast('Note saved');
}

function openNoteEdit(id) {
  nebEditId = id;
  const note = id === 'new' ? null : notesBoard.find(n => n.id === id);
  document.getElementById('neb-title').value = note ? note.title || '' : '';
  document.getElementById('neb-body').value = note ? note.body || '' : '';
  document.getElementById('neb-tags').value = note ? (note.tags || []).join(', ') : '';
  document.getElementById('neb-title-lbl').textContent = note ? 'Edit Note' : 'New Note';
  document.getElementById('neb-delete-btn').style.display = note ? '' : 'none';
  const colorsEl = document.getElementById('neb-colors');
  const curColor = note ? note.color : NB_COLORS[0];
  colorsEl.innerHTML = NB_COLORS.map(c =>
    `<div class="neb-color-swatch${c===curColor?' sel':''}" style="background:${c}" onclick="nebSelColor(this,'${c}')"></div>`
  ).join('');
  document.getElementById('note-edit-modal').classList.add('on');
}

function nebSelColor(el, color) {
  document.querySelectorAll('.neb-color-swatch').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel');
}

function closeNoteEdit() {
  document.getElementById('note-edit-modal').classList.remove('on');
  nebEditId = null;
}

function saveNoteEdit() {
  const title = document.getElementById('neb-title').value.trim();
  const body  = document.getElementById('neb-body').value.trim();
  const tagsStr = document.getElementById('neb-tags').value;
  const tags = tagsStr ? tagsStr.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const selSwatch = document.querySelector('.neb-color-swatch.sel');
  const color = selSwatch ? selSwatch.style.background : NB_COLORS[0];
  if (nebEditId && nebEditId !== 'new') {
    const note = notesBoard.find(n => n.id === nebEditId);
    if (note) { note.title = title||body.slice(0,50); note.body = body; note.color = color; note.tags = tags; }
  } else {
    notesBoard.push({ id:'nb'+Date.now(), title:title||body.slice(0,50), body, color, column:'inbox', createdAt:new Date().toISOString(), tags });
  }
  Store.setNoteBoard(notesBoard);
  closeNoteEdit();
  renderNotesBoard();
  toast('Note saved');
}

function deleteNote() {
  if (!nebEditId || nebEditId === 'new') return;
  notesBoard = notesBoard.filter(n => n.id !== nebEditId);
  Store.setNoteBoard(notesBoard);
  closeNoteEdit();
  renderNotesBoard();
  toast('Note deleted');
}

/* ══════════════════════════════════════════════════════════════
   GOALS / OKR
   ══════════════════════════════════════════════════════════════ */
let goals = Store.getGoals();
let goalsFilter = 'all';
let objEditId = null;

function seedGoalsDemo() {
  if (goals.length > 0) return;
  goals = [
    {
      id: 'obj001', title: 'Launch Personal OS v1', period: 'monthly',
      createdAt: new Date().toISOString(),
      keyResults: [
        { id:'kr001', title:'Complete all core screens', current:5, target:7, unit:'screens', linkedTaskIds:[] },
        { id:'kr002', title:'Write 30 journal entries', current:12, target:30, unit:'entries', linkedTaskIds:[] },
        { id:'kr003', title:'Achieve 80%+ task completion rate', current:65, target:80, unit:'%', linkedTaskIds:[] },
      ]
    },
    {
      id: 'obj002', title: 'Improve health score', period: 'weekly',
      createdAt: new Date().toISOString(),
      keyResults: [
        { id:'kr004', title:'Walk 8000 steps daily', current:5, target:7, unit:'days', linkedTaskIds:[] },
        { id:'kr005', title:'Sleep 7h+', current:4, target:7, unit:'days', linkedTaskIds:[] },
      ]
    },
    {
      id: 'obj003', title: 'English proficiency N2 level', period: 'quarterly',
      createdAt: new Date().toISOString(),
      keyResults: [
        { id:'kr006', title:'Anki vocab reviews', current:420, target:600, unit:'cards', linkedTaskIds:[] },
        { id:'kr007', title:'Listening practice', current:18, target:30, unit:'hrs', linkedTaskIds:[] },
        { id:'kr008', title:'Shadow reading sessions', current:22, target:40, unit:'sessions', linkedTaskIds:[] },
      ]
    },
    {
      id: 'obj004', title: 'Deepen coding skills', period: 'monthly',
      createdAt: new Date().toISOString(),
      keyResults: [
        { id:'kr009', title:'LeetCode problems solved', current:28, target:50, unit:'problems', linkedTaskIds:[] },
        { id:'kr010', title:'Side project commits', current:31, target:60, unit:'commits', linkedTaskIds:[] },
      ]
    },
  ];
  Store.setGoals(goals);
}

function setGoalsPeriod(el, period) {
  goalsFilter = period;
  document.querySelectorAll('#goals-period-bar .tf-pill').forEach(p => p.classList.toggle('on', p.textContent.toLowerCase().startsWith(period==='all'?'all':period)));
  renderGoals();
}

function renderGoals() {
  seedGoalsDemo();
  goals = Store.getGoals();
  const grid = document.getElementById('goals-grid');
  if (!grid) return;
  const filtered = goalsFilter === 'all' ? goals : goals.filter(o => o.period === goalsFilter);
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${t('No objectives yet. Click "+ Objective" to add one.','目標なし。"+ 目標追加" から登録できます。')}</div>`;
    return;
  }
  grid.innerHTML = filtered.map(obj => {
    const krHTML = (obj.keyResults||[]).map(kr => {
      const pct = Math.min(100, Math.round((kr.current||0) / (kr.target||1) * 100));
      return `<div class="kr-item">
        <div class="kr-header">
          <span class="kr-title">${kr.title}</span>
          <span class="kr-pct">${pct}%</span>
        </div>
        <div class="kr-bar-track"><div class="kr-bar-fill" style="width:${pct}%;background:${pct>=100?'var(--gr)':pct>=60?'var(--bl)':'var(--am)'}"></div></div>
        <div class="kr-meta">
          <span class="kr-vals">${kr.current} / ${kr.target} ${kr.unit}</span>
          <span class="kr-linked">${(kr.linkedTaskIds||[]).length} ${t('tasks','タスク')}</span>
          <button class="kr-edit-btn" onclick="openKrProgressModal('${obj.id}','${kr.id}');event.stopPropagation()">${t('Update','更新')}</button>
        </div>
      </div>`;
    }).join('');
    const periodCls = 'obj-period-' + (obj.period||'monthly');
    const overallPct = obj.keyResults && obj.keyResults.length
      ? Math.round(obj.keyResults.reduce((a,kr)=>a+Math.min(100,(kr.current||0)/(kr.target||1)*100),0)/obj.keyResults.length)
      : 0;
    return `<div class="objective-card">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
        <div style="flex:1">
          <div class="objective-title">${obj.title}</div>
          <span class="obj-period-badge ${periodCls}">${obj.period}</span>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:var(--t1);font-family:var(--fm);letter-spacing:-1px">${overallPct}%</div>
          <div style="display:flex;gap:4px;justify-content:flex-end;margin-top:4px">
            <button class="kr-edit-btn" onclick="openAddObjectiveModal('${obj.id}')">${t('Edit','編集')}</button>
            <button class="kr-edit-btn" onclick="deleteObjective('${obj.id}')" style="color:var(--rd)">×</button>
          </div>
        </div>
      </div>
      ${krHTML}
    </div>`;
  }).join('');
}

function openAddObjectiveModal(editId) {
  objEditId = editId || null;
  const modal = document.getElementById('goals-form-modal');
  const titleEl = document.getElementById('goals-modal-title');
  const objTitle = document.getElementById('obj-title-input');
  const objPeriod = document.getElementById('obj-period-select');
  const editIdEl = document.getElementById('obj-edit-id');
  const krList = document.getElementById('kr-list-edit');
  editIdEl.value = editId || '';
  if (editId) {
    const obj = goals.find(o => o.id === editId);
    if (obj) {
      titleEl.textContent = 'Edit Objective';
      objTitle.value = obj.title;
      objPeriod.value = obj.period;
      krList.innerHTML = (obj.keyResults||[]).map(kr =>
        `<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:4px;align-items:center">
          <input class="tdd-input kr-title-f" data-krid="${kr.id}" value="${kr.title}" placeholder="Key Result">
          <input class="tdd-input" style="width:60px" data-krid="${kr.id}" data-field="target" value="${kr.target}" type="number" min="0">
          <input class="tdd-input" style="width:50px" data-krid="${kr.id}" data-field="unit" value="${kr.unit}" placeholder="unit">
          <button class="subtask-del" onclick="this.closest('div').remove()">×</button>
        </div>`
      ).join('');
    }
  } else {
    titleEl.textContent = 'Add Objective';
    objTitle.value = '';
    objPeriod.value = 'monthly';
    krList.innerHTML = '';
  }
  modal.classList.add('on');
}

function closeGoalsModal() {
  document.getElementById('goals-form-modal').classList.remove('on');
  objEditId = null;
}

function addKrField() {
  const list = document.getElementById('kr-list-edit');
  if (!list) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:1fr auto auto auto;gap:4px;align-items:center';
  div.innerHTML = `<input class="tdd-input kr-title-f" placeholder="Key Result"><input class="tdd-input" style="width:60px" data-field="target" value="100" type="number" min="0"><input class="tdd-input" style="width:50px" data-field="unit" placeholder="unit"><button class="subtask-del" onclick="this.closest('div').remove()">×</button>`;
  list.appendChild(div);
}

function saveObjective() {
  const title = document.getElementById('obj-title-input').value.trim();
  if (!title) { toast('Enter an objective title'); return; }
  const period = document.getElementById('obj-period-select').value;
  const editId = document.getElementById('obj-edit-id').value;
  // Collect KRs
  const krRows = document.querySelectorAll('#kr-list-edit > div');
  const keyResults = [];
  krRows.forEach(row => {
    const titleF = row.querySelector('.kr-title-f');
    const targetF = row.querySelector('[data-field="target"]');
    const unitF   = row.querySelector('[data-field="unit"]');
    if (!titleF || !titleF.value.trim()) return;
    const existingKr = editId ? (goals.find(o=>o.id===editId)?.keyResults||[]).find(k=>k.id===titleF.dataset.krid) : null;
    keyResults.push({
      id: existingKr ? existingKr.id : 'kr'+Date.now()+Math.random().toString(36).slice(2,6),
      title: titleF.value.trim(),
      current: existingKr ? existingKr.current : 0,
      target: parseInt(targetF?.value||'100')||100,
      unit: unitF?.value?.trim()||'',
      linkedTaskIds: existingKr ? existingKr.linkedTaskIds : []
    });
  });
  if (editId) {
    const obj = goals.find(o => o.id === editId);
    if (obj) { obj.title = title; obj.period = period; obj.keyResults = keyResults; }
  } else {
    goals.push({ id:'obj'+Date.now(), title, period, keyResults, createdAt: new Date().toISOString() });
  }
  Store.setGoals(goals);
  closeGoalsModal();
  renderGoals();
  toast('Objective saved');
}

function deleteObjective(id) {
  goals = goals.filter(o => o.id !== id);
  Store.setGoals(goals);
  renderGoals();
  toast('Objective deleted');
}

function openKrProgressModal(objId, krId) {
  const obj = goals.find(o => o.id === objId);
  const kr  = obj ? (obj.keyResults||[]).find(k => k.id === krId) : null;
  if (!kr) return;
  document.getElementById('kr-progress-title').textContent = kr.title;
  document.getElementById('kr-progress-current').value = kr.current || 0;
  document.getElementById('kr-progress-obj-id').value = objId;
  document.getElementById('kr-progress-kr-id').value = krId;
  document.getElementById('kr-progress-modal').classList.add('on');
}

function closeKrProgressModal() {
  document.getElementById('kr-progress-modal').classList.remove('on');
}

function saveKrProgress() {
  const objId = document.getElementById('kr-progress-obj-id').value;
  const krId  = document.getElementById('kr-progress-kr-id').value;
  const val   = parseFloat(document.getElementById('kr-progress-current').value);
  const obj = goals.find(o => o.id === objId);
  const kr  = obj ? (obj.keyResults||[]).find(k => k.id === krId) : null;
  if (kr) { kr.current = isNaN(val) ? 0 : val; Store.setGoals(goals); }
  closeKrProgressModal();
  renderGoals();
  toast('Progress updated');
}

/* ══════════════════════════════════════════════════════════════
   ROUTINE MANAGER
   ══════════════════════════════════════════════════════════════ */
let routineTab = 'morning';
let routineItems = Store.getRoutineItems();

function seedRoutineDemo() {
  if (routineItems.length > 0) return;
  routineItems = [
    { id:'ri001', title:'起床・水を飲む', type:'morning', duration:5, order:0 },
    { id:'ri002', title:'ストレッチ 10分', type:'morning', duration:10, order:1 },
    { id:'ri003', title:'朝食', type:'morning', duration:20, order:2 },
    { id:'ri004', title:'英語学習 (Anki)', type:'morning', duration:30, order:3 },
    { id:'ri009', title:'Today のタスク確認', type:'morning', duration:10, order:4 },
    { id:'ri010', title:'コーヒー・集中作業開始', type:'morning', duration:5, order:5 },
    { id:'ri005', title:'シャワー', type:'evening', duration:15, order:0 },
    { id:'ri006', title:'日記を書く', type:'evening', duration:10, order:1 },
    { id:'ri007', title:'スマホを置く・読書', type:'evening', duration:20, order:2 },
    { id:'ri008', title:'就寝準備', type:'evening', duration:10, order:3 },
    { id:'ri011', title:'明日の準備', type:'evening', duration:5, order:4 },
  ];
  Store.setRoutineItems(routineItems);
}

function setRoutineTab(el, tab) {
  routineTab = tab;
  document.querySelectorAll('.routine-tab-btn').forEach(b => b.classList.toggle('on', b.textContent.toLowerCase().includes(tab)));
  renderRoutine();
}

function renderRoutine() {
  seedRoutineDemo();
  routineItems = Store.getRoutineItems();
  const body = document.getElementById('routine-body');
  if (!body) return;
  const log = Store.getRoutineLog();
  const today = new Date().toISOString().slice(0,10);
  const items = routineItems.filter(r => r.type === routineTab).sort((a,b)=>a.order-b.order);
  const totalDur = items.reduce((a,r)=>a+(r.duration||0),0);

  body.innerHTML = `
    <div class="routine-header-row">
      <span style="font-size:13px;font-weight:600;color:var(--t1)">${routineTab === 'morning' ? t('Morning','朝') : t('Evening','夜')} ${t('Routine','ルーティン')}</span>
      <span class="routine-duration-lbl">~${totalDur}m <span class="en">total</span><span class="ja">合計</span></span>
    </div>
    ${items.map(item => {
      const doneToday = (log[today] || {})[item.id];
      const streak = calcRoutineStreak(item.id, log);
      const last7 = getLast7RoutineStatus(item.id, log);
      return `<div class="routine-item-row">
        <div class="routine-check${doneToday?' done':''}" onclick="toggleRoutineItem('${item.id}',this)">${doneToday?'✓':''}</div>
        <div class="routine-item-name">${item.title}</div>
        ${item.duration ? `<span class="routine-item-dur">${item.duration}m</span>` : ''}
        ${streak > 0 ? `<span class="routine-streak">${streak}</span>` : ''}
        <div class="routine-heatmap">${last7.map((d,i) => `<div class="routine-heat-day${d?' done':''}${i===6?' today-hm':''}"></div>`).join('')}</div>
        <button class="subtask-del" style="opacity:0.5" onclick="deleteRoutineItem('${item.id}')">×</button>
      </div>`;
    }).join('')}
    <button class="routine-add-btn" onclick="addRoutineItem()"><span class="en">+ Add item</span><span class="ja">+ 追加</span></button>
  `;
}

function toggleRoutineItem(id, el) {
  const log = Store.getRoutineLog();
  const today = new Date().toISOString().slice(0,10);
  if (!log[today]) log[today] = {};
  log[today][id] = !log[today][id];
  Store.setRoutineLog(log);
  el.classList.toggle('done', !!log[today][id]);
  el.textContent = log[today][id] ? '✓' : '';
  renderRoutine();
}

function calcRoutineStreak(id, log) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    if (log[key] && log[key][id]) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getLast7RoutineStatus(id, log) {
  const today = new Date();
  return Array.from({length:7}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6-i));
    const key = d.toISOString().slice(0,10);
    return !!(log[key] && log[key][id]);
  });
}

function addRoutineItem() {
  const title = prompt('Routine item name:');
  if (!title) return;
  const dur = parseInt(prompt('Duration (minutes, or empty to skip):') || '0') || 0;
  routineItems.push({ id:'ri'+Date.now(), title, type:routineTab, duration:dur, order:routineItems.filter(r=>r.type===routineTab).length });
  Store.setRoutineItems(routineItems);
  renderRoutine();
}

function deleteRoutineItem(id) {
  routineItems = routineItems.filter(r => r.id !== id);
  Store.setRoutineItems(routineItems);
  renderRoutine();
}

/* ══════════════════════════════════════════════════════════════
   MANUAL LOG
   ══════════════════════════════════════════════════════════════ */
let manualLogMood = 0;

function initLogDate() {
  const inp = document.getElementById('log-date');
  if (inp && !inp.value) inp.value = new Date().toISOString().slice(0,10);
}

function setLogMood(n) {
  manualLogMood = n;
  document.querySelectorAll('.mood-star').forEach((s,i) => s.classList.toggle('on', i < n));
}

function saveLogEntry() {
  const date   = document.getElementById('log-date').value || new Date().toISOString().slice(0,10);
  const weight = parseFloat(document.getElementById('log-weight').value) || null;
  const water  = parseInt(document.getElementById('log-water').value) || null;
  const sleep  = parseFloat(document.getElementById('log-sleep').value) || null;
  const mood   = manualLogMood || null;
  const note   = document.getElementById('log-note').value.trim() || '';
  const log = Store.getManualLog();
  const existIdx = log.findIndex(e => e.date === date);
  const entry = { date, weight, water, sleep, mood, note };
  if (existIdx >= 0) log[existIdx] = entry; else log.push(entry);
  log.sort((a,b) => b.date.localeCompare(a.date));
  Store.setManualLog(log);
  // Clear form
  document.getElementById('log-weight').value = '';
  document.getElementById('log-water').value  = '';
  document.getElementById('log-sleep').value  = '';
  document.getElementById('log-note').value   = '';
  manualLogMood = 0;
  document.querySelectorAll('.mood-star').forEach(s => s.classList.remove('on'));
  renderLogTable();
  renderLogSparklines();
  toast('Log entry saved');
}

function seedLogDemo() {
  const log = Store.getManualLog();
  if (log.length > 0) return;
  const base = new Date();
  const entries = [
    { weight:68.2, water:2.1, sleep:7.2, mood:4, note:'Good focus day' },
    { weight:68.5, water:1.8, sleep:6.5, mood:3, note:'Tired in afternoon' },
    { weight:68.1, water:2.3, sleep:7.8, mood:5, note:'Great sleep' },
    { weight:68.4, water:2.0, sleep:7.0, mood:4, note:'' },
    { weight:68.3, water:1.5, sleep:6.8, mood:3, note:'Late night' },
    { weight:68.0, water:2.2, sleep:7.5, mood:4, note:'Workout morning' },
    { weight:67.9, water:2.4, sleep:8.0, mood:5, note:'Rest day, felt great' },
  ].map((e, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - (6 - i));
    return { ...e, date: d.toISOString().slice(0, 10) };
  }).reverse();
  Store.setManualLog(entries);
}

function renderLogTable() {
  seedLogDemo();
  const tbody = document.getElementById('log-table-body');
  if (!tbody) return;
  const log = Store.getManualLog();
  const today = new Date().toISOString().slice(0,10);
  const last14 = log.slice(0, 14);
  tbody.innerHTML = last14.map(e =>
    `<tr${e.date===today?' class="today-row"':''}>
      <td style="${e.date===today?'color:var(--am);font-weight:600':''}">${e.date.slice(5)}</td>
      <td>${e.weight!=null?e.weight+'kg':'—'}</td>
      <td>${e.water!=null?e.water+'L':'—'}</td>
      <td>${e.sleep!=null?e.sleep+'h':'—'}</td>
      <td>${e.mood!=null?'★'.repeat(e.mood):'—'}</td>
      <td style="font-size:9.5px;color:var(--t2);max-width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${e.note||'—'}</td>
    </tr>`
  ).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--t3);padding:16px">No entries yet</td></tr>';
}

function renderLogSparklines() {
  const el = document.getElementById('log-sparklines-row');
  if (!el) return;
  const log = Store.getManualLog().slice(0, 7).reverse();
  const metrics = [
    { key:'weight', label:t('Weight','体重'), unit:'kg',  color:'var(--am)', extract: e => e.weight },
    { key:'water',  label:t('Water','水分'),  unit:'L',   color:'var(--bl)', extract: e => e.water },
    { key:'sleep',  label:t('Sleep','睡眠'),  unit:'h',   color:'var(--tl)', extract: e => e.sleep },
    { key:'mood',   label:t('Mood','気分'),   unit:'★',  color:'var(--pu)', extract: e => e.mood },
  ];
  el.innerHTML = metrics.map(m => {
    const vals = log.map(m.extract).filter(v => v != null);
    if (!vals.length) return `<div class="c" style="padding:10px 12px"><div class="ct" style="margin-bottom:4px">${m.label}</div><div style="font-size:11px;color:var(--t3)">${t('No data','データなし')}</div></div>`;
    const max = Math.max(...vals, 1);
    const last = vals[vals.length-1];
    const sparkHTML = `<div class="log-sparkline">${vals.map(v => `<div class="log-spark-bar" style="height:${Math.round(v/max*100)}%;background:${m.color}"></div>`).join('')}</div>`;
    return `<div class="c" style="padding:10px 12px">
      <div class="ct" style="margin-bottom:4px">${m.label}</div>
      <div style="font-size:18px;font-weight:600;color:var(--t1);font-family:var(--fm);letter-spacing:-0.5px">${last}${m.unit}</div>
      ${sparkHTML}
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   LIBRARY
   ══════════════════════════════════════════════════════════════ */
let libraryTab = 'bookmarks';
let libEditId = null;

function seedLibraryDemo() {
  const lib = Store.getLibrary();
  if (lib.bookmarks.length > 0) return;
  lib.bookmarks = [
    { id:'bm001', url:'https://www.ouraring.com', title:'Oura Ring', note:'Sleep tracker dashboard', tags:['health'], createdAt:new Date().toISOString() },
    { id:'bm002', url:'https://obsidian.md', title:'Obsidian', note:'Knowledge base tool', tags:['productivity'], createdAt:new Date().toISOString() },
    { id:'bm003', url:'https://leetcode.com', title:'LeetCode', note:'Algorithm practice', tags:['dev'], createdAt:new Date().toISOString() },
    { id:'bm004', url:'https://anki-manual.readthedocs.io', title:'Anki Docs', note:'Spaced repetition reference', tags:['english','study'], createdAt:new Date().toISOString() },
    { id:'bm005', url:'https://cal.newport.com', title:'Cal Newport Blog', note:'Deep work strategies', tags:['productivity'], createdAt:new Date().toISOString() },
  ];
  lib.reading = [
    { id:'rd001', title:'Atomic Habits', author:'James Clear', status:'reading', progress:60, total:100, note:'Great for habit formation', createdAt:new Date().toISOString() },
    { id:'rd002', title:'Deep Work', author:'Cal Newport', status:'want', progress:0, total:100, note:'On the to-read list', createdAt:new Date().toISOString() },
    { id:'rd003', title:'The Pragmatic Programmer', author:'Hunt & Thomas', status:'done', progress:100, total:100, note:'Essential dev book', createdAt:new Date().toISOString() },
    { id:'rd004', title:'Show Your Work', author:'Austin Kleon', status:'reading', progress:35, total:100, note:'Short but impactful', createdAt:new Date().toISOString() },
  ];
  lib.watching = [
    { id:'wt001', title:'Inception', type:'movie', status:'done', progress:100, total:100, note:'Mind-bending', createdAt:new Date().toISOString() },
    { id:'wt002', title:'3 Body Problem', type:'series', status:'watching', progress:4, total:8, note:'S1 good so far', createdAt:new Date().toISOString() },
    { id:'wt003', title:'How to Train Your Dragon', type:'movie', status:'want', progress:0, total:100, note:'', createdAt:new Date().toISOString() },
  ];
  Store.setLibrary(lib);
}

function setLibraryTab(el, tab) {
  libraryTab = tab;
  document.querySelectorAll('.library-tab').forEach(t => t.classList.toggle('on', t.textContent.toLowerCase().includes(tab.slice(0,4))));
  renderLibrary();
}

function renderLibrary() {
  seedLibraryDemo();
  const lib = Store.getLibrary();
  const body = document.getElementById('library-body');
  if (!body) return;
  if (libraryTab === 'bookmarks') renderBookmarks(lib.bookmarks, body);
  else if (libraryTab === 'reading') renderReadingList(lib.reading, body);
  else renderWatchingList(lib.watching, body);
}

function renderBookmarks(items, body) {
  if (!items.length) { body.innerHTML = `<div class="empty-state">${t('No bookmarks yet. Click "+ Add" to add one.','ブックマークなし。"+ 追加" から登録できます。')}</div>`; return; }
  body.innerHTML = items.map(bm => {
    const domain = (() => { try { return new URL(bm.url).hostname; } catch(e) { return bm.url; } })();
    return `<div class="bookmark-item">
      <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${domain}" onerror="this.style.display='none'" alt="">
      <div class="bookmark-content">
        <div class="bookmark-title"><a href="${bm.url}" target="_blank" style="color:var(--t1);text-decoration:none" onclick="event.stopPropagation()">${bm.title||domain}</a></div>
        <div class="bookmark-domain">${domain}</div>
        ${bm.note ? `<div class="bookmark-note">${bm.note}</div>` : ''}
        <div class="bookmark-tags">${(bm.tags||[]).map(t=>`<span class="bookmark-tag">${t}</span>`).join('')}</div>
      </div>
      <button class="subtask-del" style="opacity:0.5" onclick="deleteLibItem('bookmarks','${bm.id}')">×</button>
    </div>`;
  }).join('');
}

function renderReadingList(items, body) {
  if (!items.length) { body.innerHTML = `<div class="empty-state">${t('No reading items yet.','読書リストが空です。')}</div>`; return; }
  body.innerHTML = items.map(item => {
    const pct = item.total ? Math.round((item.progress||0)/item.total*100) : (item.progress||0);
    return `<div class="reading-item">
      <div class="reading-header">
        <div>
          <div class="reading-title">${item.title}</div>
          <div class="reading-author">${item.author||''}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="reading-status-badge status-${item.status}">${item.status}</span>
          <button class="subtask-del" style="opacity:0.5" onclick="deleteLibItem('reading','${item.id}')">×</button>
        </div>
      </div>
      <div class="reading-progress-row">
        <div class="reading-progress-track"><div class="reading-progress-fill" style="width:${pct}%"></div></div>
        <span class="reading-pct">${pct}%</span>
      </div>
      ${item.note ? `<div style="font-size:9.5px;color:var(--t3);margin-top:4px">${item.note}</div>` : ''}
    </div>`;
  }).join('');
}

function renderWatchingList(items, body) {
  if (!items.length) { body.innerHTML = `<div class="empty-state">${t('No watching items yet.','視聴リストが空です。')}</div>`; return; }
  body.innerHTML = items.map(item => {
    const pct = item.total ? Math.round((item.progress||0)/item.total*100) : (item.progress||0);
    const typeIcon = item.type === 'movie' ? t('Movie','映画') : item.type === 'series' ? t('Series','シリーズ') : t('Video','動画');
    return `<div class="reading-item">
      <div class="reading-header">
        <div>
          <div class="reading-title">${typeIcon}: ${item.title}</div>
          <span class="reading-status-badge status-${item.status}">${item.status}</span>
        </div>
        <button class="subtask-del" style="opacity:0.5" onclick="deleteLibItem('watching','${item.id}')">×</button>
      </div>
      <div class="reading-progress-row">
        <div class="reading-progress-track"><div class="reading-progress-fill" style="width:${pct}%;background:var(--pu)"></div></div>
        <span class="reading-pct">${pct}%</span>
      </div>
      ${item.note ? `<div style="font-size:9.5px;color:var(--t3);margin-top:4px">${item.note}</div>` : ''}
    </div>`;
  }).join('');
}

function openAddLibraryItem() {
  libEditId = null;
  const tab = libraryTab;
  document.getElementById('lib-modal-title').textContent = 'Add ' + (tab==='bookmarks'?'Bookmark':tab==='reading'?'Book':'Watch Item');
  document.getElementById('lib-tab-type').value = tab;
  document.getElementById('lib-edit-id').value = '';
  const fields = document.getElementById('lib-form-fields');
  if (tab === 'bookmarks') {
    fields.innerHTML = `
      <div><div class="tdd-label">URL</div><input class="tdd-input" id="lib-url" placeholder="https://…"></div>
      <div><div class="tdd-label">Title</div><input class="tdd-input" id="lib-btitle" placeholder="Optional"></div>
      <div><div class="tdd-label">Note</div><input class="tdd-input" id="lib-note" placeholder="Optional"></div>
      <div><div class="tdd-label">Tags (comma-separated)</div><input class="tdd-input" id="lib-tags" placeholder="tag1, tag2"></div>`;
  } else {
    fields.innerHTML = `
      <div><div class="tdd-label">Title</div><input class="tdd-input" id="lib-rtitle" placeholder="Title"></div>
      ${tab==='reading'?'<div><div class="tdd-label">Author</div><input class="tdd-input" id="lib-author" placeholder="Author"></div>':''}
      ${tab==='watching'?'<div><div class="tdd-label">Type</div><select class="tdd-select" id="lib-wtype"><option value="movie">Movie</option><option value="series">Series</option><option value="video">Video</option></select></div>':''}
      <div><div class="tdd-label">Status</div><select class="tdd-select" id="lib-status"><option value="want">Want</option><option value="${tab==='watching'?'watching':'reading'}">${tab==='watching'?'Watching':'Reading'}</option><option value="done">Done</option></select></div>
      <div><div class="tdd-label">Progress (0-100)</div><input class="tdd-input" id="lib-progress" type="number" min="0" max="100" value="0"></div>
      <div><div class="tdd-label">Note</div><input class="tdd-input" id="lib-rnote" placeholder="Optional"></div>`;
  }
  document.getElementById('library-add-modal').classList.add('on');
}

function closeLibraryModal() {
  document.getElementById('library-add-modal').classList.remove('on');
}

function saveLibraryItem() {
  const tab = document.getElementById('lib-tab-type').value;
  const lib = Store.getLibrary();
  if (tab === 'bookmarks') {
    const url = (document.getElementById('lib-url')?.value||'').trim();
    if (!url) { toast('Enter a URL'); return; }
    const titleInp = document.getElementById('lib-btitle')?.value.trim();
    const domain = (() => { try { return new URL(url).hostname; } catch(e) { return url; } })();
    const tagsStr = document.getElementById('lib-tags')?.value||'';
    lib.bookmarks.unshift({ id:'bm'+Date.now(), url, title:titleInp||domain, note:document.getElementById('lib-note')?.value.trim()||'', tags:tagsStr?tagsStr.split(',').map(s=>s.trim()).filter(Boolean):[], createdAt:new Date().toISOString() });
  } else {
    const title = (document.getElementById('lib-rtitle')?.value||'').trim();
    if (!title) { toast('Enter a title'); return; }
    const entry = {
      id: (tab==='reading'?'rd':'wt')+Date.now(), title,
      status: document.getElementById('lib-status')?.value||'want',
      progress: parseInt(document.getElementById('lib-progress')?.value||'0')||0,
      total: 100, note: document.getElementById('lib-rnote')?.value.trim()||'',
      createdAt: new Date().toISOString()
    };
    if (tab==='reading') entry.author = document.getElementById('lib-author')?.value.trim()||'';
    if (tab==='watching') entry.type = document.getElementById('lib-wtype')?.value||'movie';
    lib[tab].unshift(entry);
  }
  Store.setLibrary(lib);
  closeLibraryModal();
  renderLibrary();
  toast('Item saved');
}

function deleteLibItem(tab, id) {
  const lib = Store.getLibrary();
  lib[tab] = (lib[tab]||[]).filter(i => i.id !== id);
  Store.setLibrary(lib);
  renderLibrary();
  toast('Item deleted');
}

/* ══════════════════════════════════════════════════════════════
   TODAY'S SCHEDULE WIDGET
   ══════════════════════════════════════════════════════════════ */
function renderScheduleWidget() {
  const el = document.getElementById('w-schedule');
  if (!el) return;
  const today = new Date().toDateString();
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  // Gather events
  const events = [];
  tasks.forEach(t => {
    if (t.dueDate && new Date(t.dueDate+'T00:00:00').toDateString() === today) {
      events.push({ hour: 9, title: t.title, duration: t.estimate || 30, type: t.status === 'inprogress' ? 'running' : 'task', id: t.id });
    }
    (t.sessions || []).forEach(s => {
      if (!s.start) return;
      const d = new Date(s.start);
      if (d.toDateString() !== today) return;
      events.push({ hour: d.getHours() + d.getMinutes()/60, title: t.title, duration: s.end ? Math.round((new Date(s.end)-d)/60000) : null, type: t.status==='inprogress'?'running':'task', id: t.id });
    });
    if (t.recurring && t.status !== 'done') {
      events.push({ hour: 10, title: t.title + ' ↺', duration: t.estimate||30, type:'recurring', id:t.id });
    }
  });
  events.sort((a,b) => a.hour - b.hour);
  const body = el.querySelector('.schedule-widget') || el;
  const hours = [...new Set([...Array.from({length:14},(_,i)=>i+8), ...events.map(e=>Math.floor(e.hour))])].sort((a,b)=>a-b);
  let html = '<div class="sched-timeline">';
  const currentHourInt = Math.floor(nowHour);
  const showCurrentLine = nowHour >= 8 && nowHour <= 22;
  hours.forEach(h => {
    const evs = events.filter(e => Math.floor(e.hour) === h);
    const isNowHour = h === currentHourInt;
    html += `<div class="sched-block">
      <div class="sched-time">${h}:00</div>
      <div class="sched-line-wrap">
        <div class="sched-dot${isNowHour?' active':''}"></div>
        <div class="sched-vline"></div>
      </div>
      <div class="sched-event-wrap">
        ${evs.map(ev => `<div class="sched-event ${ev.type==='running'?'running':ev.type==='recurring'?'recurring':''}">
          ${ev.type==='running'?'▶ ':''}${ev.title}${ev.duration?' · '+ev.duration+'m':''}
        </div>`).join('')}
      </div>
    </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   ANALYTICS: Enhanced Weekly Review + Mood Graph
   ══════════════════════════════════════════════════════════════ */
function generateWeeklyReview() {
  const out = document.getElementById('ai-review-output');
  if (!out) return;
  out.innerHTML = '<div style="font-size:9px;font-weight:700;color:var(--am);margin-bottom:6px;font-family:var(--fm)">• Generating...</div>';
  setTimeout(() => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const weekTasks = tasks.filter(t => {
      if (!t.createdAt) return false;
      return new Date(t.createdAt) >= weekStart;
    });
    const done = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const focusMins = tasks.reduce((acc, t) => {
      return acc + (t.sessions||[]).reduce((a2, s) => {
        if (!s.start || !s.end) return a2;
        return a2 + Math.round((new Date(s.end)-new Date(s.start))/60000);
      }, 0);
    }, 0);
    const habits = JSON.parse(Store.get('habits','{}'));
    const habitsDone = Object.values(habits).filter(Boolean).length;
    const feedback = getFeedbackHistory ? getFeedbackHistory() : [];
    const weekFeedback = feedback.filter(f => new Date(f.date) >= weekStart);
    const avgEnergy = weekFeedback.length
      ? weekFeedback.reduce((a,f) => a + (f.energy==='great'?3:f.energy==='ok'?2:1), 0) / weekFeedback.length
      : null;
    const focusHours = Math.round(focusMins / 60 * 10) / 10;
    out.innerHTML = `
      <div style="font-size:9px;font-weight:700;color:var(--am);margin-bottom:10px;font-family:var(--fm)">• Weekly Review — ${new Date().toLocaleDateString('ja-JP',{month:'short',day:'numeric'})}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="background:rgba(58,125,90,0.06);border-radius:6px;padding:8px 10px;border-left:2px solid var(--gr)">
          <div style="font-size:8.5px;font-weight:700;color:var(--gr);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Tasks</div>
          <div style="font-size:10px;color:var(--t2);line-height:1.7">
            Completion: <strong style="color:var(--t1)">${total>0?Math.round(done/total*100):0}%</strong> (${done}/${total})
            · Focus time: <strong style="color:var(--t1)">${focusHours}h</strong>
            · New tasks this week: <strong>${weekTasks.length}</strong>
          </div>
        </div>
        <div style="background:rgba(78,126,200,0.06);border-radius:6px;padding:8px 10px;border-left:2px solid var(--bl)">
          <div style="font-size:8.5px;font-weight:700;color:var(--bl);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Habits & Journal</div>
          <div style="font-size:10px;color:var(--t2);line-height:1.7">
            Habits done today: <strong style="color:var(--t1)">${habitsDone}</strong>
            · Journal entries: <strong style="color:var(--t1)">${journal.length}</strong>
          </div>
        </div>
        ${avgEnergy ? `<div style="background:rgba(212,98,42,0.06);border-radius:6px;padding:8px 10px;border-left:2px solid var(--am)">
          <div style="font-size:8.5px;font-weight:700;color:var(--am);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Energy Check-In</div>
          <div style="font-size:10px;color:var(--t2);line-height:1.7">
            Avg energy: <strong style="color:var(--t1)">${avgEnergy>=2.5?'High ▲':avgEnergy>=1.8?'OK —':'Low ▼'}</strong>
            · Check-ins this week: <strong>${weekFeedback.length}</strong>
          </div>
        </div>` : ''}
      </div>`;
  }, 1200);
}

function renderMoodGraph() {
  const el = document.getElementById('mood-graph-svg');
  if (!el) return;
  const feedback = typeof getFeedbackHistory === 'function' ? getFeedbackHistory() : [];
  const last30 = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    const entry = feedback.find(f => f.date === key);
    last30.push({ date:key, val: entry ? (entry.energy==='great'?3:entry.energy==='ok'?2:1) : null });
  }
  const W = 400, H = 80;
  const pts = last30.map((d,i) => d.val != null ? {x: i/29*W, y: H - (d.val-1)/2*(H-10) - 5} : null);
  const validPts = pts.filter(Boolean);
  if (!validPts.length) { el.innerHTML = '<text x="200" y="40" text-anchor="middle" font-size="10" fill="rgba(26,28,34,0.3)">No mood data yet</text>'; return; }
  // Color bands
  let svg = `<rect x="0" y="0" width="${W}" height="${(H-10-5)/2}" fill="rgba(58,125,90,0.05)" rx="2"/>
    <rect x="0" y="${(H-10-5)/2}" width="${W}" height="${(H-10-5)/2}" fill="rgba(212,98,42,0.04)" rx="2"/>
    <rect x="0" y="${H-10-5}" width="${W}" height="15" fill="rgba(196,64,64,0.05)" rx="2"/>`;
  // Line
  const pathD = validPts.map((p,i) => `${i===0?'M':'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  svg += `<path d="${pathD}" fill="none" stroke="var(--am)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Dots
  validPts.forEach(p => { svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="var(--am)"/>`; });
  // Labels
  svg += `<text x="2" y="10" font-size="7" fill="rgba(58,125,90,0.7)" font-family="DM Mono">HIGH</text>`;
  svg += `<text x="2" y="${H/2+3}" font-size="7" fill="rgba(212,98,42,0.7)" font-family="DM Mono">OK</text>`;
  svg += `<text x="2" y="${H-3}" font-size="7" fill="rgba(196,64,64,0.7)" font-family="DM Mono">LOW</text>`;
  el.innerHTML = svg;
}

/* ======================================
   Health Dashboard JS (from health.html)
   ====================================== */
/* ── LANGUAGE TOGGLE ── */
function t(en, ja) {
  return `<span class="en">${en}</span><span class="ja">${ja}</span>`;
}
function isJaLang() {
  return document.body.classList.contains('lang-ja');
}
function updatePlaceholders() {
  const ja = isJaLang();
  const m = {
    'tf-search':  [ja, 'タスクを検索…',       'Search tasks…'],
    'log-note':   [ja, '任意のメモ…',          'Optional note…'],
  };
  Object.entries(m).forEach(([id,[flag,j,e]]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = flag ? j : e;
  });
  document.querySelectorAll('.note-quick-input').forEach(el => {
    el.placeholder = ja ? 'メモを入力… Enter で保存' : 'Write a note… Enter to save';
  });
}
function toggleLang() {
  const isJa = document.body.classList.toggle('lang-ja');
  document.getElementById('lang-btn').textContent = isJa ? 'EN' : 'JP';
  localStorage.setItem('health-lang', isJa ? 'ja' : 'en');
  toast(isJa ? '日本語モードに切り替えました' : 'Switched to English');
  updatePlaceholders();
  if (typeof renderRoutine === 'function') renderRoutine();
}
(function() {
  if (localStorage.getItem('health-lang') === 'ja') {
    document.body.classList.add('lang-ja');
    const btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = 'EN';
  }
})();

/* ── FLOATING PANEL ── */
function toggleFloat() {
  const panel = document.getElementById('float-panel');
  const btn   = document.getElementById('float-btn');
  const isOpen = panel.classList.toggle('open');
  btn.style.opacity = isOpen ? '0.6' : '1';
}
function closeFloat() {
  document.getElementById('float-panel').classList.remove('open');
  document.getElementById('float-btn').style.opacity = '1';
}

/* ── FEEDBACK SYSTEM ── */
const fbState = { energy: null, acc: null, tags: [] };

function selectFeedback(type, val) {
  fbState[type] = val;
  const prefix = type === 'energy' ? 'fb-e-' : 'fb-a-';
  const cls    = type === 'energy' ? 'fb-btn-energy' : 'fb-btn-acc';
  document.querySelectorAll('.' + cls).forEach(b => {
    b.classList.remove('selected');
    b.className = b.className.replace(/\bsel-\S+/g, '').trim();
  });
  const btn = document.getElementById(prefix + val);
  if (btn) { btn.classList.add('selected', 'sel-' + val); }
}

function toggleTag(el, tag) {
  const idx = fbState.tags.indexOf(tag);
  if (idx === -1) { fbState.tags.push(tag); el.classList.add('active'); }
  else            { fbState.tags.splice(idx, 1); el.classList.remove('active'); }
}

function saveFeedback() {
  if (!fbState.energy) { toast('エネルギーレベルを選んでください'); return; }
  const note = document.getElementById('fb-note').value.trim();
  const entry = {
    date:     new Date().toISOString().slice(0,10),
    oura:     { readiness: 82, sleep: 84, hrv: 38, activity: 71 },
    energy:   fbState.energy,
    acc:      fbState.acc,
    tags:     [...fbState.tags],
    note:     note
  };
  const history = getFeedbackHistory();
  const existIdx = history.findIndex(e => e.date === entry.date);
  if (existIdx >= 0) history[existIdx] = entry; else history.push(entry);
  localStorage.setItem('health-feedback', JSON.stringify(history));

  const lbl = document.getElementById('fb-saved-lbl');
  lbl.textContent = '✓ Saved';
  lbl.style.opacity = '1';
  setTimeout(() => { lbl.style.opacity = '0'; closeFloat(); updateCheckinBtn(); }, 1400);

  updateCalibrationUI();
}

function updateCheckinBtn() {
  const btn = document.getElementById('float-btn');
  if (!btn) return;
  const today = new Date().toISOString().slice(0,10);
  const history = getFeedbackHistory();
  const logged = history.some(e => e.date === today);
  if (logged) {
    btn.innerHTML = '<span class="en">✓ Today logged · Edit</span><span class="ja">✓ 記録済 · 編集</span>';
    btn.style.background = 'rgba(58,125,90,0.92)';
  } else {
    btn.innerHTML = '<span class="en">● Check In</span><span class="ja">● 記録する</span>';
    btn.style.background = '';
  }
}

function getFeedbackHistory() {
  try { return JSON.parse(localStorage.getItem('health-feedback') || '[]'); }
  catch(e) { return []; }
}

function seedMockData() {
  if (localStorage.getItem('health-feedback-seeded')) return;
  const mock = [
    { date:'2026-05-10', oura:{ readiness:80,sleep:82,hrv:42,activity:75 }, energy:'great',  acc:'match',   tags:['exercise'],      note:'' },
    { date:'2026-05-11', oura:{ readiness:74,sleep:78,hrv:36,activity:68 }, energy:'ok',     acc:'match',   tags:['busy'],          note:'' },
    { date:'2026-05-12', oura:{ readiness:68,sleep:72,hrv:31,activity:55 }, energy:'rough',  acc:'match',   tags:['stressed','late-night'], note:'深夜まで作業' },
    { date:'2026-05-13', oura:{ readiness:77,sleep:80,hrv:39,activity:70 }, energy:'ok',     acc:'partial', tags:[],                note:'' },
    { date:'2026-05-14', oura:{ readiness:85,sleep:88,hrv:45,activity:82 }, energy:'great',  acc:'match',   tags:['exercise'],      note:'' },
    { date:'2026-05-15', oura:{ readiness:79,sleep:83,hrv:40,activity:73 }, energy:'ok',     acc:'match',   tags:[],                note:'' },
    { date:'2026-05-16', oura:{ readiness:72,sleep:76,hrv:34,activity:61 }, energy:'ok',     acc:'partial', tags:['alcohol'],       note:'' },
    { date:'2026-05-17', oura:{ readiness:65,sleep:70,hrv:29,activity:50 }, energy:'rough',  acc:'miss',    tags:['stressed'],      note:'Ouraは睡眠OKと言ったが疲れていた' },
    { date:'2026-05-18', oura:{ readiness:78,sleep:81,hrv:41,activity:72 }, energy:'great',  acc:'match',   tags:['exercise'],      note:'' },
    { date:'2026-05-19', oura:{ readiness:83,sleep:86,hrv:44,activity:79 }, energy:'great',  acc:'match',   tags:[],                note:'' },
  ];
  localStorage.setItem('health-feedback', JSON.stringify(mock));
  localStorage.setItem('health-feedback-seeded', '1');
}

function computeTagInfluence(history) {
  const allTags = ['stressed','busy','exercise','alcohol','late-night','travel'];
  const result = {};
  allTags.forEach(tag => {
    const entries = history.filter(e => e.tags && e.tags.includes(tag));
    if (entries.length < 2) return;
    const counts = { great: 0, ok: 0, rough: 0 };
    entries.forEach(e => { if (counts[e.energy] !== undefined) counts[e.energy]++; });
    result[tag] = { counts, total: entries.length };
  });
  return result;
}

function detectDrift(history) {
  const recent = [...history].reverse().slice(0, 7);
  const misses = recent.filter(e => e.acc === 'miss').length;
  const partials = recent.filter(e => e.acc === 'partial').length;
  if (misses >= 3) return { detected: true, misses, partials, days: recent.length };
  if (misses >= 2 && partials >= 2) return { detected: true, misses, partials, days: recent.length };
  return { detected: false };
}

function computeCorrelation(history, metric) {
  if (history.length < 5) return null;
  let match = 0;
  history.forEach(e => {
    const score = e.oura[metric];
    const good  = score >= 75;
    const felt  = e.energy === 'great' || e.energy === 'ok';
    if (good === felt) match++;
  });
  const pct = match / history.length;
  if (pct >= 0.72) return { level:'Strong',   pct, cls:'cal-bar-strong',   color:'var(--gr)' };
  if (pct >= 0.55) return { level:'Moderate', pct, cls:'cal-bar-moderate', color:'var(--bl)' };
  return               { level:'Weak',     pct, cls:'cal-bar-weak',     color:'var(--rd)' };
}

function updateCalibrationUI() {
  const history = getFeedbackHistory();
  const n = history.length;

  const confidenceLbl = document.getElementById('cal-confidence-lbl');
  if (confidenceLbl) {
    if (n < 5) { confidenceLbl.textContent = n + ' / 5 days to unlock'; }
    else {
      const pct = Math.min(100, Math.round(50 + n * 4));
      confidenceLbl.textContent = 'Confidence ' + pct + '%  (' + n + ' days)';
    }
  }

  ['sleep','hrv','activity'].forEach(metric => {
    const bar = document.getElementById('cal-bar-' + metric);
    const lbl = document.getElementById('cal-lbl-' + metric);
    if (!bar || !lbl) return;
    const r = computeCorrelation(history, metric === 'hrv' ? 'hrv' : metric === 'sleep' ? 'sleep' : 'activity');
    if (!r) { bar.style.width = '0%'; lbl.textContent = '—'; lbl.style.color = 'var(--ink3)'; return; }
    bar.className = 'cal-bar-fill ' + r.cls;
    bar.style.width = Math.round(r.pct * 100) + '%';
    lbl.textContent = r.level;
    lbl.style.color = r.color;
  });

  const insightEl = document.getElementById('cal-insight-text');
  if (insightEl && n >= 5) {
    const sleepR = computeCorrelation(history, 'sleep');
    const hrvR   = computeCorrelation(history, 'hrv');
    if (sleepR && hrvR) {
      const stronger = sleepR.pct >= hrvR.pct ? 'Sleep score' : 'HRV';
      insightEl.innerHTML =
        '<span class="en">' + stronger + ' is your strongest predictor. '
        + (sleepR.level === 'Weak' && hrvR.level === 'Weak' ? 'Your subjective state often diverges from Oura — consider external factors.' : 'Oura predictions are aligning well with how you actually feel.')
        + '</span>'
        + '<span class="ja">' + (stronger === 'Sleep score' ? '睡眠スコア' : 'HRV') + 'が最も信頼できる指標です。'
        + (sleepR.level === 'Weak' && hrvR.level === 'Weak' ? 'Oura予測と実感のズレが多め。外的要因を意識してみましょう。' : 'Ouraの予測が実感とよく一致しています。')
        + '</span>';
    }
  }

  /* ── TAG INFLUENCE ── */
  const tagEl = document.getElementById('cal-tag-influence');
  if (tagEl) {
    const influence = computeTagInfluence(history);
    const tagKeys = Object.keys(influence);
    const tagLabels = { stressed:'Stressed', busy:'Busy', exercise:'Exercised', alcohol:'Alcohol', 'late-night':'Late Night', travel:'Travel' };
    const tagLabelsJa = { stressed:'ストレス', busy:'多忙', exercise:'運動', alcohol:'飲酒', 'late-night':'夜更かし', travel:'移動' };
    if (tagKeys.length === 0) {
      tagEl.innerHTML = '<div style="font-size:10px;color:var(--ink3);padding:12px 0;text-align:center"><span class="en">Log 3+ entries with tags to see influence</span><span class="ja">3件以上タグ付きで記録するとここに表示されます</span></div>';
    } else {
      tagEl.innerHTML = tagKeys.map(tag => {
        const { counts, total } = influence[tag];
        const pctGreat = Math.round(counts.great / total * 100);
        const pctOk    = Math.round(counts.ok    / total * 100);
        const pctRough = Math.round(counts.rough  / total * 100);
        const dominant = counts.rough > counts.great ? 'neg' : counts.great > counts.rough ? 'pos' : 'neu';
        const dotColor = dominant === 'pos' ? 'var(--gr)' : dominant === 'neg' ? 'var(--rd)' : 'var(--bl)';
        return '<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid var(--ink4)">'
          + '<span style="font-size:9px;font-family:var(--fm);width:70px;flex-shrink:0"><span class="en">' + (tagLabels[tag]||tag) + '</span><span class="ja">' + (tagLabelsJa[tag]||tag) + '</span></span>'
          + '<div style="flex:1;height:6px;border-radius:3px;overflow:hidden;display:flex;gap:1px">'
          + (pctGreat ? '<div style="width:' + pctGreat + '%;background:var(--gr);border-radius:2px"></div>' : '')
          + (pctOk    ? '<div style="width:' + pctOk    + '%;background:var(--bl);border-radius:2px"></div>' : '')
          + (pctRough ? '<div style="width:' + pctRough + '%;background:var(--rd);border-radius:2px"></div>' : '')
          + '</div>'
          + '<span style="font-size:9px;font-family:var(--fm);color:var(--ink3);width:28px;text-align:right">' + total + 'x</span>'
          + '</div>';
      }).join('') + '<div style="display:flex;gap:12px;margin-top:8px">'
        + '<span style="font-size:9px;color:var(--ink3);display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--gr)"></span><span class="en">High</span><span class="ja">高</span></span>'
        + '<span style="font-size:9px;color:var(--ink3);display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--bl)"></span><span class="en">OK</span><span class="ja">普通</span></span>'
        + '<span style="font-size:9px;color:var(--ink3);display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--rd)"></span><span class="en">Low</span><span class="ja">低</span></span>'
        + '</div>';
    }
  }

  /* ── DRIFT DETECTION ── */
  const driftAlert = document.getElementById('cal-drift-alert');
  const driftReason = document.getElementById('cal-drift-reason');
  if (driftAlert && driftReason) {
    const drift = detectDrift(history);
    if (drift.detected) {
      driftAlert.style.display = 'block';
      driftReason.innerHTML =
        '<span class="en">AI predictions missed ' + drift.misses + '× in the last ' + drift.days + ' days. '
        + 'Subjective fatigue may be diverging from biometrics — possible lifestyle change.</span>'
        + '<span class="ja">直近' + drift.days + '日間でAI予測が' + drift.misses + '回外れています。バイオメトリクスと実感のズレが拡大中の可能性があります。</span>';
    } else {
      driftAlert.style.display = 'none';
    }
  }

  const logList = document.getElementById('cal-log-list');
  if (!logList) return;
  if (n === 0) { logList.innerHTML = '<div style="font-size:10px;color:var(--ink3);padding:12px 0;text-align:center"><span class="en">No entries yet</span><span class="ja">まだ記録がありません</span></div>'; return; }
  const energyIcon = { great:'▲', ok:'—', rough:'▼' };
  const accIcon    = { match:'✓', partial:'△', miss:'✕' };
  const recent = [...history].reverse().slice(0, 7);
  logList.innerHTML = recent.map(e => {
    const date = e.date.slice(5);
    const gap  = e.acc === 'match' ? 0 : e.acc === 'partial' ? 1 : 2;
    const gapCls = gap === 0 ? 'cal-gap-zero' : gap === 1 ? 'cal-gap-neg' : 'cal-gap-neg';
    const gapTxt = gap === 0 ? '—' : gap === 1 ? '△' : '✕';
    const tagStr = e.tags.length ? e.tags.slice(0,2).join(', ') : '';
    return '<div class="cal-log-row">'
      + '<span class="cal-log-date">' + date + '</span>'
      + '<span style="font-size:13px">' + (energyIcon[e.energy] || '—') + '</span>'
      + '<span style="font-size:10px;color:var(--ink2);flex:1">' + (tagStr || '<span style="color:var(--ink3)">—</span>') + '</span>'
      + '<span class="cal-log-gap ' + gapCls + '">' + (accIcon[e.acc] || gapTxt) + '</span>'
      + '</div>';
  }).join('');
}

/* ── INIT ── */
(function() {
  seedMockData();
  const today = new Date().toISOString().slice(0,10);
  const history = getFeedbackHistory();
  const todayEntry = history.find(e => e.date === today);
  if (todayEntry) {
    if (todayEntry.energy) selectFeedback('energy', todayEntry.energy);
    if (todayEntry.acc)    selectFeedback('acc',    todayEntry.acc);
    todayEntry.tags.forEach(tag => {
      const tagEl = document.querySelector('#fb-tags .fb-tag[onclick*="' + tag + '"]');
      if (tagEl) { tagEl.classList.add('active'); fbState.tags.push(tag); }
    });
    if (todayEntry.note) document.getElementById('fb-note').value = todayEntry.note;
  }
})();

/* ═══════════════════════════════════════════════
   SLEEP UNIT TOGGLE  +  TWEAKS controller
   ═══════════════════════════════════════════════ */

function setSleepUnit(unit) {
  const card = document.getElementById('card-sleep');
  if (!card) return;
  card.querySelectorAll('.seg-tiny[data-seg="sleep-unit"] button').forEach(b => {
    b.classList.toggle('on', b.dataset.unit === unit);
  });
  card.querySelectorAll('.sleep-leg-val').forEach(v => {
    v.textContent = unit === 'pct' ? v.dataset.pct : v.dataset.min;
  });
  localStorage.setItem('health-sleep-unit', unit);
}

const TWEAKS = /*EDITMODE-BEGIN*/{
  "dashboard": true,
  "fit": true,
  "avg-sleep": true,
  "sleep-toggle": true,
  "kpi-spark": true,
  "date-chips": true,
  "sleep-pct": false,
  "workouts": true,
  "stress": true,
  "chronotype": true,
  "resilience": true,
  "sri": true,
  "vo2max": true,
  "mood": "calm"
}/*EDITMODE-END*/;

const TW_ALL = Object.keys(TWEAKS);

function applyTweak(key, on) {
  if (key === 'dashboard') {
    document.body.classList.toggle('dashboard', on);
    return;
  }
  if (key === 'fit') {
    document.body.classList.toggle('fit', on);
    return;
  }
  if (key === 'avg-sleep') {
    document.querySelectorAll('.avg-sleep-strip').forEach(el => el.style.display = on ? '' : 'none');
    document.querySelectorAll('.month-kpi-time').forEach(el => {
      el.closest('.month-kpi').style.display = on ? '' : 'none';
    });
    return;
  }
  if (key === 'sleep-toggle') {
    const seg = document.querySelector('.seg-tiny[data-seg="sleep-unit"]');
    if (seg) seg.style.display = on ? '' : 'none';
    return;
  }
  if (key === 'kpi-spark')   { document.body.classList.toggle('tw-kpi-spark', on); return; }
  if (key === 'date-chips')  { document.body.classList.toggle('tw-date-chips', on); return; }
  if (key === 'sleep-pct')   { setSleepUnit(on ? 'pct' : 'min'); return; }
  if (key === 'workouts')    { document.body.classList.toggle('tw-workouts', on); return; }
  if (key === 'stress')      { document.body.classList.toggle('tw-stress', on); return; }
  if (key === 'chronotype')  { document.body.classList.toggle('tw-chronotype', on); return; }
  if (key === 'resilience')  { document.body.classList.toggle('tw-resilience', on); return; }
  if (key === 'sri')         { document.body.classList.toggle('tw-sri', on); return; }
  if (key === 'vo2max')      { document.body.classList.toggle('tw-vo2max', on); return; }
}

function setMood(name) {
  ['calm','focus','restore','energy','dusk'].forEach(m => document.body.classList.toggle('mood-' + m, m === name));
  document.querySelectorAll('.mood-swatch').forEach(s => s.classList.toggle('on', s.dataset.mood === name));
  TWEAKS.mood = name;
  localStorage.setItem('health-tweaks', JSON.stringify(TWEAKS));
  toast({calm:'ムード：静か',focus:'ムード：集中',restore:'ムード：休息',energy:'ムード：元気',dusk:'ムード：夕暮'}[name] || name);
}

function setFix(input) {
  const key = input.dataset.fix;
  TWEAKS[key] = input.checked;
  applyTweak(key, input.checked);
  localStorage.setItem('health-tweaks', JSON.stringify(TWEAKS));
}

function openTweaks() {
  document.getElementById('tw-panel').classList.add('open');
  document.getElementById('tw-launch').style.display = 'none';
}
function closeTweaks() {
  document.getElementById('tw-panel').classList.remove('open');
  document.getElementById('tw-launch').style.display = 'inline-flex';
}

(function loadTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem('health-tweaks') || 'null');
    if (saved) Object.assign(TWEAKS, saved);
  } catch(e) {}
  TW_ALL.forEach(k => {
    if (k === 'mood') return;
    applyTweak(k, TWEAKS[k]);
    const cb = document.querySelector('input[data-fix="' + k + '"]');
    if (cb) cb.checked = TWEAKS[k];
  });
  setMood(TWEAKS.mood || 'calm');
  // restore sleep unit independent of tweak (segmented user choice)
  const u = localStorage.getItem('health-sleep-unit');
  if (u && !TWEAKS['sleep-pct']) setSleepUnit(u);
})();

/* ══════════════════════════════════════════════════════════
   OURA API INTEGRATION (health dashboard layer)
   ══════════════════════════════════════════════════════════ */

// OURA_BASE / ouraToken declared above in the personal-os integration block
async function ouraGet(endpoint, params = {}) {
  const tok = ouraToken();
  if (!tok) throw Object.assign(new Error('NO_TOKEN'), {code:'NO_TOKEN'});
  const url = new URL(`${OURA_BASE}/${endpoint}`);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${tok}` } });
  if (r.status === 401) throw Object.assign(new Error('INVALID_TOKEN'), {code:'INVALID_TOKEN'});
  if (!r.ok) throw new Error(`HTTP_${r.status}`);
  return r.json();
}

async function initHealth() {
  if (!ouraToken()) { lgShowStep('oura'); return; }
  hideSetup();
  const today        = new Date().toISOString().slice(0,10);
  const prev         = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  const sevenDaysAgo = new Date(Date.now() - 86400000*6).toISOString().slice(0,10);

  try {
    const [rd, ds, sl, ac, ds7, stress, rd7, ac7, workout] = await Promise.all([
      ouraGet('daily_readiness', {start_date:today,        end_date:today}),
      ouraGet('daily_sleep',     {start_date:today,        end_date:today}),
      ouraGet('sleep',           {start_date:sevenDaysAgo, end_date:today}),
      ouraGet('daily_activity',  {start_date:prev,         end_date:today}),
      ouraGet('daily_sleep',     {start_date:sevenDaysAgo, end_date:today}),
      ouraGet('daily_stress',    {start_date:sevenDaysAgo, end_date:today}).catch(()=>({data:[]})),
      ouraGet('daily_readiness', {start_date:sevenDaysAgo, end_date:today}),
      ouraGet('daily_activity',  {start_date:sevenDaysAgo, end_date:today}),
      ouraGet('workout',         {start_date:prev,         end_date:today}).catch(()=>({data:[]})),
    ]);

    const sleepAll   = sl.data || [];
    const sleepToday = sleepAll.filter(s => s.day === today);
    const longSleep  = sleepToday.find(s => s.type === 'long_sleep')
      || sleepToday.sort((a,b)=>(b.total_sleep_duration||0)-(a.total_sleep_duration||0))[0]
      || sleepAll.find(s => s.type === 'long_sleep')
      || sleepAll.sort((a,b)=>(b.total_sleep_duration||0)-(a.total_sleep_duration||0))[0]
      || null;

    const acData = ac.data?.find(a => a.day === today) || ac.data?.find(a => a.day === prev) || null;

    updateReadiness(rd.data?.[0]);
    updateSleep(ds.data?.[0], longSleep);
    updateSleepSessions(sleepAll, today);
    updateSleepStages(sleepAll.filter(s => s.day === today));
    updateActivity(acData);
    updateHRV(longSleep, rd.data?.[0]);
    updateSleepDebt(ds7.data || [], today);
    updateStress(stress.data || [], today);
    updateWeeklyView(rd7.data || [], ds7.data || [], ac7.data || [], sleepAll, today);
    updateWorkout(workout.data || [], today);
    updateChronoBedtime(sleepAll, rd.data?.[0]?.score);

    // AI Review — build payload from today's data and generate
    const rdToday    = rd.data?.[0];
    const dsToday    = ds.data?.[0];
    const acToday    = acData;
    const stToday    = stress.data?.find(s => s.day === today);
    const aiPayload  = {
      readiness:    rdToday?.score,
      sleepScore:   dsToday?.score,
      totalSleep:   longSleep ? fmt(longSleep.total_sleep_duration) : null,
      hrv:          longSleep?.average_hrv ? Math.round(longSleep.average_hrv) : null,
      rhr:          longSleep?.average_heart_rate ? Math.round(longSleep.average_heart_rate) : null,
      activityScore: acToday?.score,
      steps:        acToday?.steps,
      stressState:  stToday?.day_summary,
      sleepDebt:    dsToday?.contributors?.sleep_balance != null
                      ? (dsToday.contributors.sleep_balance < 50 ? 'High' : dsToday.contributors.sleep_balance < 70 ? 'Moderate' : 'Low')
                      : null,
      breathingRate: longSleep?.average_breath ? longSleep.average_breath.toFixed(1) : null,
      spo2:         longSleep?.average_spo2_percentage ? longSleep.average_spo2_percentage.toFixed(1) : null,
      lang:         document.body.classList.contains('lang-ja') ? 'ja' : 'en',
    };
    generateAIReview(aiPayload, today);
  } catch(e) {
    if (e.code === 'NO_TOKEN') {
      // PAT not saved in D1 at all → force Oura setup
      localStorage.removeItem('pos-fully-setup');
      lgShowStep('oura');
    } else if (e.code === 'INVALID_TOKEN') {
      // PAT saved but rejected by Oura (expired/revoked) → show inline error, don't clear setup
      const msgEl = document.getElementById('h-error-msg');
      if (msgEl) msgEl.textContent = 'Ouraトークンが無効です。Settingsから再設定してください。';
      hShowState('error');
    } else console.error('Oura fetch error:', e);
  }
}

async function generateAIReview(payload, today) {
  const CACHE_KEY = `ai-review-cache-${payload.lang ?? 'ja'}`;
  const cached = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; } })();
  if (cached && cached.date === today) {
    updateAIReview(cached.data, today);
    return;
  }

  const WORKER = 'https://muddy-boat-633b.nxoxo-l-l-leo.workers.dev/ai-review';
  try {
    const res = await fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`AI review HTTP ${res.status}`);
    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, data }));
    updateAIReview(data, today);
  } catch(e) {
    console.error('AI review error:', e);
  }
}

function updateAIReview(data, today) {
  // State name
  const nameEl = document.getElementById('ai-state-name');
  if (nameEl && data.stateName) nameEl.innerHTML = `<span class="ja">${data.stateName}</span>`;

  // Date label
  const dateEl = document.getElementById('ai-date');
  if (dateEl && today) {
    const d = new Date(today + 'T12:00:00');
    dateEl.textContent = d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  }

  // Chips
  const chipsEl = document.getElementById('ai-chips');
  if (chipsEl && Array.isArray(data.chips)) {
    chipsEl.innerHTML = data.chips.map(c =>
      `<span class="stress-state ${c.type}">${c.label}</span>`
    ).join('');
  }

  // Recommended
  const recEl = document.getElementById('ai-recommended');
  if (recEl && Array.isArray(data.recommended)) {
    recEl.innerHTML = data.recommended.map(t =>
      `<div class="action-row ok"><div class="action-icon">✓</div><span>${t}</span></div>`
    ).join('');
  }

  // Avoid
  const avoidEl = document.getElementById('ai-avoid');
  if (avoidEl && Array.isArray(data.avoid)) {
    avoidEl.innerHTML = data.avoid.map(t =>
      `<div class="action-row ng"><div class="action-icon">✕</div><span>${t}</span></div>`
    ).join('');
  }

  // Why
  const whyEl = document.getElementById('ai-why');
  if (whyEl && data.why) whyEl.textContent = data.why;
}

async function syncHealth() {
  toast('Oura データを同期中...');
  // Clear AI cache so a fresh review is generated on sync
  localStorage.removeItem('ai-review-cache-ja');
  localStorage.removeItem('ai-review-cache-en');
  await initHealth();
  toast('同期完了');
}
function showSetup() { const el = document.getElementById('setup-overlay'); if(el) el.style.display='flex'; }
function hideSetup() { const el = document.getElementById('setup-overlay'); if(el) el.style.display='none'; }
function showError(msg) { const el = document.getElementById('setup-error'); if(el){el.textContent=msg;el.style.display='block';} }

async function setupConnect() {
  const input = document.getElementById('setup-token-input');
  const tok   = input?.value.trim().replace(/[^\x00-\xFF]/g,'');
  if (!tok) { showError('トークンを入力してください'); return; }
  const session = posSession();
  if (session) {
    try {
      const res  = await fetch(`${WORKER_BASE}/api/integrations/oura`, {
        method:  'POST',
        headers: { ...posAuthHeader(), 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: tok })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        // Fallback: save locally and warn
        localStorage.setItem('oura-pat', tok);
        showError(`サーバー保存失敗(${res.status})—ローカルに保存しました`);
        // Still continue to load health
        hideSetup();
        initHealth();
        return;
      }
    } catch (e) {
      localStorage.setItem('oura-pat', tok);
      showError('ネットワークエラー—ローカルに保存しました');
      hideSetup();
      initHealth();
      return;
    }
  } else {
    localStorage.setItem('oura-pat', tok);
  }
  hideSetup();
  initHealth();
}

function fmt(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
}

function updateReadiness(rd) {
  if (!rd) return;
  // score
  document.querySelectorAll('[data-api="rd-score"]').forEach(el => el.textContent = rd.score ?? '—');
  // ring
  const ring = document.getElementById('api-rd-ring');
  if (ring) ring.setAttribute('stroke-dashoffset', (138.2*(1-(rd.score||0)/100)).toFixed(1));
  // contributors
  const c = rd.contributors || {};
  const bars = [
    ['api-rd-act-bar','api-rd-act-val', c.activity_balance,    'var(--gr)'],
    ['api-rd-hrv-bar','api-rd-hrv-val', c.hrv_balance,         'var(--bl)'],
    ['api-rd-rhr-bar','api-rd-rhr-val', c.resting_heart_rate,  'var(--am)'],
  ];
  bars.forEach(([barId,valId,val,color]) => {
    const bar = document.getElementById(barId);
    const lbl = document.getElementById(valId);
    if (bar) { bar.style.width=`${val||0}%`; bar.style.background=color; }
    if (lbl) lbl.textContent = val ?? '—';
  });
}

function updateSleep(ds, sl) {
  if (ds) {
    const el = document.getElementById('api-sl-score');
    if (el) el.textContent = ds.score ?? '—';
  }
  if (sl) {
    const total = document.getElementById('api-sl-total');
    if (total) total.textContent = fmt(sl.total_sleep_duration);
    const bed  = document.getElementById('api-sl-bed');
    const wake = document.getElementById('api-sl-wake');
    const eff  = document.getElementById('api-sl-eff');
    if (bed)  bed.textContent  = fmtTime(sl.bedtime_start);
    if (wake) wake.textContent = fmtTime(sl.bedtime_end);
    if (eff)  eff.textContent  = sl.efficiency ? `${sl.efficiency}%` : '—';
  }
}

function updateSleepStages(todaySessions) {
  if (!todaySessions.length) return;
  // 全セッション合算
  const sum = (key) => todaySessions.reduce((acc, s) => acc + (s[key] || 0), 0);
  const deep  = sum('deep_sleep_duration');
  const rem   = sum('rem_sleep_duration');
  const light = sum('light_sleep_duration');
  const awk   = sum('awake_time');
  const total = sum('total_sleep_duration') || 1;

  const totalEl = document.getElementById('api-sl-total');
  if (totalEl) totalEl.textContent = fmt(total);

  [['api-sl-deep', deep],['api-sl-rem', rem],['api-sl-lt', light],['api-sl-awk', awk]]
    .forEach(([id, sec]) => {
      const el = document.getElementById(id);
      if (el) el.style.flex = String(sec);
    });

  const deepEl = document.getElementById('api-leg-deep');
  const remEl  = document.getElementById('api-leg-rem');
  const ltEl   = document.getElementById('api-leg-lt');
  const awkEl  = document.getElementById('api-leg-awk');
  if (deepEl) deepEl.textContent = fmt(deep);
  if (remEl)  remEl.textContent  = fmt(rem);
  if (ltEl)   ltEl.textContent   = fmt(light);
  if (awkEl)  awkEl.textContent  = fmt(awk);
}

function updateActivity(ac) {
  if (!ac) return;
  const score = document.getElementById('api-ac-score');
  const steps = document.getElementById('api-ac-steps');
  const cal   = document.getElementById('api-ac-cal');
  const sBar  = document.getElementById('api-ac-steps-bar');
  const cBar  = document.getElementById('api-ac-cal-bar');
  if (score) score.textContent = ac.score ?? '—';
  if (steps) steps.textContent = ac.steps ? ac.steps.toLocaleString() : '—';
  if (cal)   cal.textContent   = ac.active_calories ? `${ac.active_calories}` : '—';
  if (sBar)  sBar.style.width  = `${Math.min(100,((ac.steps||0)/10000)*100)}%`;
  if (cBar)  cBar.style.width  = `${Math.min(100,((ac.active_calories||0)/600)*100)}%`;
}

function updateSleepSessions(allSessions, today) {
  const el = document.getElementById('api-sleep-sessions');
  if (!el) return;
  const sessions = allSessions.filter(s => s.day === today)
    .sort((a,b) => new Date(a.bedtime_start) - new Date(b.bedtime_start));
  if (!sessions.length) { el.innerHTML = ''; return; }
  const typeColor = { long_sleep:'var(--bl)', nap:'var(--tl)', rest:'var(--ink4)', sleep:'var(--bl)' };
  el.innerHTML = sessions.map(s => {
    const color = typeColor[s.type] || 'var(--ink3)';
    const dur   = fmt(s.total_sleep_duration);
    const start = fmtTime(s.bedtime_start);
    const end   = fmtTime(s.bedtime_end);
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(0,0,0,0.04)">
      <span style="width:3px;height:24px;border-radius:2px;background:${color};flex-shrink:0"></span>
      <span style="font-family:var(--fm);font-size:9px;color:var(--ink2)">${start} – ${end}</span>
      <span style="font-family:var(--fm);font-size:9px;color:var(--ink3);margin-left:auto">${dur}</span>
    </div>`;
  }).join('');
}

function updateSleepDebt(sevenDaySleep, today) {
  const TARGET = 8 * 3600;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - 86400000 * i);
    days.push(d.toISOString().slice(0,10));
  }
  const dayLabels = ['日','月','火','水','木','金','土'];
  let totalDeficit = 0, shortNights = 0;
  const barsEl   = document.getElementById('api-debt-bars');
  const labelsEl = document.getElementById('api-debt-labels');
  if (!barsEl || !labelsEl) return;

  const maxH = 9 * 3600;
  barsEl.innerHTML = '';
  labelsEl.innerHTML = '';

  days.forEach((dateStr, i) => {
    const entry = sevenDaySleep.find(s => s.day === dateStr);
    const dur   = entry?.total_sleep_duration ?? null;
    const isToday = dateStr === today;
    const met   = dur !== null && dur >= TARGET;
    const pct   = dur !== null ? Math.min(100, (dur / maxH) * 100) : 0;
    // データのない日（未来・未同期）は不足としてカウントしない
    if (dur !== null) {
      const deficit = Math.max(0, TARGET - dur);
      totalDeficit += deficit;
      if (!met) shortNights++;
    }

    const color = dur === 0 ? 'rgba(0,0,0,0.08)'
      : met ? 'rgba(58,125,90,0.55)' : 'rgba(212,98,42,0.55)';
    const border = isToday ? '2px solid var(--am)' : 'none';
    barsEl.innerHTML += `<div style="flex:1;height:${pct}%;background:${color};border-radius:2px 2px 0 0;border:${border};position:relative;min-height:3px" title="${fmtSec(dur)}"></div>`;

    const dow = dayLabels[new Date(dateStr).getDay()];
    const dd  = new Date(dateStr + 'T12:00:00');
    const md  = `${dd.getMonth()+1}/${dd.getDate()}`;
    labelsEl.innerHTML += `<div style="flex:1;text-align:center;font-family:var(--fm);font-size:8px;color:${isToday?'var(--am)':'var(--ink3)'};font-weight:${isToday?'700':'400'};line-height:1.3">${dow}<br><span style="font-size:7px;opacity:0.75">${md}</span></div>`;
  });

  const totalEl  = document.getElementById('api-debt-total');
  const subEl    = document.getElementById('api-debt-sub');
  const targetEl = document.getElementById('api-debt-target');
  const targetSub= document.getElementById('api-debt-target-sub');

  if (totalEl) {
    totalEl.textContent = totalDeficit > 0 ? `−${fmt(totalDeficit)}` : '±0';
    totalEl.style.color = totalDeficit > 0 ? 'var(--am)' : 'var(--gr)';
  }
  if (subEl) subEl.textContent = `目標8時間との不足累計 · 7日中${shortNights}日不足`;

  // tonight's target: 8h + remaining deficit / 7
  const tonightTarget = TARGET + Math.round(totalDeficit / 7);
  if (targetEl) targetEl.textContent = fmt(tonightTarget);
  if (targetSub) targetSub.textContent = totalDeficit > 0
    ? `不足分を少しずつ回収するための目標` : `7日間の目標達成中 ✓`;
}

function fmtSec(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

function updateStress(stressData, today) {
  const todayStress = stressData.find(s => s.day === today);
  const scoreEl  = document.getElementById('api-stress-score');
  const stateEl  = document.getElementById('api-stress-state');
  const subEl    = document.getElementById('api-stress-sub');
  const barSEl   = document.getElementById('api-stress-bar-s');
  const barREl   = document.getElementById('api-stress-bar-r');
  const legSEl   = document.getElementById('api-stress-leg-s');
  const legREl   = document.getElementById('api-stress-leg-r');
  const barsEl   = document.getElementById('api-stress-bars');
  const labelsEl = document.getElementById('api-stress-labels');

  if (todayStress) {
    // day_summary is a string enum from Oura API
    const summary = todayStress.day_summary || '';
    const levelMap = {
      'restored':       {t:'Restored',    tj:'回復',       c:'low'},
      'normal':         {t:'Normal',      tj:'通常',       c:'med'},
      'stressful':      {t:'Stressful',   tj:'高め',       c:'high'},
      'very_stressful': {t:'High Stress', tj:'高ストレス',  c:'high'},
    };
    const level = levelMap[summary] || {t: summary || '—', tj: summary || '—', c:'med'};

    // stress_high / recovery_high are in seconds
    const stressSec   = todayStress.stress_high   || 0;
    const recoverySec = todayStress.recovery_high  || 0;
    const total = stressSec + recoverySec || 1;
    const sPct  = Math.round(stressSec   / total * 100);
    const rPct  = Math.round(recoverySec / total * 100);

    if (scoreEl) scoreEl.textContent = sPct > 0 ? sPct : '—';
    if (stateEl) {
      stateEl.className = `stress-state ${level.c}`;
      stateEl.innerHTML = `<span class="en">${level.t}</span><span class="ja">${level.tj}</span>`;
    }
    if (barSEl) barSEl.style.width = `${sPct}%`;
    if (barREl) barREl.style.width = `${rPct}%`;
    if (legSEl) legSEl.innerHTML = `${fmt(stressSec)} <span style="color:var(--ink3);font-weight:500"><span class="en">stress</span><span class="ja">ストレス</span></span>`;
    if (legREl) legREl.innerHTML = `${fmt(recoverySec)} <span style="color:var(--ink3);font-weight:500"><span class="en">recovery</span><span class="ja">回復</span></span>`;
    if (subEl)  subEl.innerHTML = `<span class="en">Today's stress summary</span><span class="ja">本日のストレスサマリー</span>`;
  } else {
    if (scoreEl) scoreEl.textContent = '—';
    if (stateEl) stateEl.textContent = '—';
    if (subEl)   subEl.innerHTML = '<span style="font-size:9px;color:var(--ink3)">Oura アプリと同期後に表示されます</span>';
  }

  // 7-day stress bar chart
  if (barsEl && labelsEl && stressData.length) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - 86400000 * i);
      days.push(d.toISOString().slice(0,10));
    }
    const dayLabels = ['日','月','火','水','木','金','土'];
    barsEl.innerHTML = '';
    labelsEl.innerHTML = '';
    days.forEach(dateStr => {
      const entry      = stressData.find(s => s.day === dateStr);
      const sSec       = entry?.stress_high   || 0;
      const rSec       = entry?.recovery_high || 0;
      const tot        = sSec + rSec || 1;
      const pct        = entry ? Math.round(sSec / tot * 100) : 0;
      const summary    = entry?.day_summary || '';
      const isToday    = dateStr === today;
      const color = !entry ? 'rgba(0,0,0,0.08)'
        : summary === 'restored' ? 'rgba(58,125,90,0.55)'
        : summary === 'normal'   ? 'rgba(212,98,42,0.45)'
        : 'rgba(196,64,64,0.65)';
      barsEl.innerHTML += `<div style="flex:1;height:${Math.max(pct,3)}%;background:${color};border-radius:2px 2px 0 0;min-height:3px" title="${summary} ${pct}%"></div>`;
      const dow = dayLabels[new Date(dateStr).getDay()];
      const dd2 = new Date(dateStr + 'T12:00:00');
      const md2 = `${dd2.getMonth()+1}/${dd2.getDate()}`;
      labelsEl.innerHTML += `<div style="flex:1;text-align:center;font-family:var(--fm);font-size:8px;color:${isToday?'var(--am)':'var(--ink3)'};font-weight:${isToday?'700':'400'};line-height:1.3">${dow}<br><span style="font-size:7px;opacity:0.75">${md2}</span></div>`;
    });
  }
}

function updateHRV(sl, rd) {
  if (sl) {
    const hrv     = document.getElementById('api-hrv-val');
    const rhr     = document.getElementById('api-hrv-rhr');
    const breathEl= document.getElementById('api-hrv-breath');
    const spo2El  = document.getElementById('api-hrv-spo2');
    const spo2StEl= document.getElementById('api-hrv-spo2-state');
    if (hrv) hrv.textContent = sl.average_hrv ? Math.round(sl.average_hrv) : '—';
    if (rhr) rhr.textContent = sl.lowest_heart_rate || '—';
    if (breathEl) {
      const br = sl.average_breath;
      breathEl.textContent = br ? br.toFixed(1) : '—';
      breathEl.style.color = (br && (br < 12 || br > 20)) ? 'var(--am)' : 'var(--ink)';
    }
    if (spo2El && spo2StEl) {
      const spo2 = sl.average_spo2_percentage;
      spo2El.textContent = spo2 ? spo2.toFixed(1) : '—';
      if (spo2) {
        const ok = spo2 >= 95;
        spo2El.style.color   = ok ? 'var(--ink)' : spo2 >= 90 ? 'var(--am)' : 'var(--rd)';
        spo2StEl.textContent = ok ? 'Normal' : spo2 >= 90 ? 'Low' : 'Very Low';
        spo2StEl.style.color = ok ? 'var(--gr)' : spo2 >= 90 ? 'var(--am)' : 'var(--rd)';
      }
    }
  }
  if (rd) {
    const dev = rd.temperature_deviation;
    const tempEl = document.getElementById('api-hrv-temp');
    if (tempEl) tempEl.textContent = dev != null ? `${dev>0?'+':''}${dev.toFixed(1)}°C` : '—';
  }
}

function updateWorkout(workoutData, today) {
  const el = document.getElementById('api-workout-today');
  if (!el) return;
  const todayWorkouts = workoutData.filter(w => w.day === today);
  if (!todayWorkouts.length) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const intColor = { easy:'var(--bl)', moderate:'var(--tl)', hard:'var(--am)', 'max effort':'var(--rd)' };
  el.innerHTML = todayWorkouts.map(w => {
    const icon  = '';
    const dur   = Math.round((w.duration || 0) / 60);
    const cal   = w.calories ? Math.round(w.calories) + ' kcal' : '—';
    const dist  = w.distance ? (w.distance / 1000).toFixed(1) + ' km' : '';
    const intens = w.intensity || '';
    const ic    = intColor[intens] || 'var(--ink3)';
    const name  = (w.activity || 'workout').replace(/_/g, ' ');
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
      <div style="min-width:0;flex:1">
        <div style="font-size:11px;color:var(--ink);font-family:var(--fm);text-transform:capitalize;letter-spacing:-0.01em">${name}</div>
        <div style="font-size:9px;color:var(--ink3);font-family:var(--fm)">${dur}min · ${cal}${dist?' · '+dist:''}</div>
      </div>
      ${intens?`<span style="font-size:7.5px;font-family:var(--fm);padding:2px 7px;border-radius:8px;background:rgba(0,0,0,0.05);color:${ic};text-transform:uppercase;letter-spacing:0.5px">${intens}</span>`:''}
    </div>`;
  }).join('');
}

function updateChronoBedtime(slSessions, rdScore) {
  const timeEl   = document.getElementById('api-chrono-bedtime-time');
  const reasonEl = document.getElementById('api-chrono-bedtime-reason');
  if (!timeEl || !reasonEl) return;
  const longSl = slSessions.filter(s => s.type === 'long_sleep' && s.bedtime_start);
  if (!longSl.length) return;
  // Average bedtime in minutes since midnight (post-midnight treated as 24h+)
  const toMins = (iso) => {
    const d = new Date(iso);
    const h = d.getHours(), m = d.getMinutes();
    return (h < 12 ? h + 24 : h) * 60 + m;
  };
  const avgMins = Math.round(longSl.map(s => toMins(s.bedtime_start)).reduce((a,b)=>a+b,0) / longSl.length);
  // Adjust based on readiness
  const adj = rdScore == null ? 0 : rdScore < 60 ? -45 : rdScore < 70 ? -30 : rdScore < 78 ? -15 : 0;
  const target = avgMins + adj;
  const h = Math.floor(target / 60) % 24;
  const m = target % 60;
  timeEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  reasonEl.textContent = adj < 0
    ? `回復サポートのため${-adj}分早め（7日平均比）`
    : '7日間のリズムを維持';
}

function updateWeeklyView(rd7, ds7, ac7, sl, today) {
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // today + past 6 days, oldest first
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - 86400000 * i);
    dates.push(d.toISOString().slice(0,10));
  }

  const fmtMD = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  };
  const rangeLabel = `${fmtMD(dates[0])} – ${fmtMD(dates[6])}, ${new Date().getFullYear()}`;

  // Update date-range labels
  const scoreRange = document.getElementById('scorecard-date-range');
  if (scoreRange) scoreRange.textContent = rangeLabel;
  document.querySelectorAll('.date-chip').forEach(el => el.textContent = rangeLabel);
  const hrvDate = document.getElementById('weekly-hrv-date');
  if (hrvDate) hrvDate.textContent = `${fmtMD(dates[0])} – ${fmtMD(dates[6])}`;

  // Build per-day lookup
  const byDay = {};
  dates.forEach(d => { byDay[d] = {}; });
  rd7.forEach(r => { if (byDay[r.day]) byDay[r.day].rd = r.score; });
  ds7.forEach(s => { if (byDay[s.day]) byDay[s.day].sl = s.score; });
  ac7.forEach(a => { if (byDay[a.day]) byDay[a.day].ac = a.score; });

  // Best sleep session per day (for HRV + bedtime)
  const slByDay = {};
  sl.forEach(s => {
    if (!slByDay[s.day] || s.type === 'long_sleep' ||
        (s.total_sleep_duration||0) > (slByDay[s.day].total_sleep_duration||0))
      slByDay[s.day] = s;
  });
  dates.forEach(d => {
    if (slByDay[d]?.average_hrv) byDay[d].hrv = Math.round(slByDay[d].average_hrv);
  });

  const scoreClass = (v, isHrv) => {
    if (v == null) return '';
    if (isHrv) return v >= 55 ? 'sc-hi' : v < 45 ? 'sc-bad' : '';
    return v >= 82 ? 'sc-hi' : v < 70 ? 'sc-bad' : v < 76 ? 'sc-lo' : '';
  };
  const colAvg = (key) => {
    const vals = dates.map(d => byDay[d][key]).filter(v => v != null);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null;
  };

  // ── SCORECARD TABLE ──
  const tableEl = document.getElementById('weekly-scorecard-table');
  if (tableEl) {
    const metrics = [
      { label:'<span class="en">Readiness</span><span class="ja">回復力</span>', key:'rd' },
      { label:'<span class="en">Sleep</span><span class="ja">睡眠</span>',       key:'sl' },
      { label:'<span class="en">Activity</span><span class="ja">活動</span>',    key:'ac' },
      { label:'<span class="en">HRV (ms)</span><span class="ja">HRV (ms)</span>', key:'hrv', isHrv:true },
    ];
    const thCols = dates.map((d,i) => {
      const dd = new Date(d + 'T12:00:00');
      const isT = i === 6;
      return `<th${isT?' class="today-col"':''}><div style="font-size:9px;opacity:0.6;margin-bottom:1px">${DOW[dd.getDay()]}</div>${dd.getMonth()+1}/${dd.getDate()}</th>`;
    }).join('');
    let html = `<thead><tr><th style="text-align:left"><span class="en">Metric</span><span class="ja">指標</span></th>${thCols}<th style="border-left:1px solid rgba(0,0,0,0.07)"><span class="en">Avg</span><span class="ja">平均</span></th></tr></thead><tbody>`;
    metrics.forEach(m => {
      const tdCols = dates.map((d,i) => {
        const v = byDay[d][m.key];
        const cls = [i===6?'today-col':'', scoreClass(v, m.isHrv)].filter(Boolean).join(' ');
        return `<td${cls?' class="'+cls+'"':''}>${v ?? '—'}</td>`;
      }).join('');
      const a = colAvg(m.key);
      const ac = scoreClass(a, m.isHrv);
      html += `<tr><td class="metric-name">${m.label}</td>${tdCols}<td><strong${ac?' class="'+ac+'"':''}>${a ?? '—'}</strong></td></tr>`;
    });
    html += '</tbody>';
    tableEl.innerHTML = html;
  }

  // ── HRV CHIPS ──
  const chipsEl = document.getElementById('weekly-hrv-chips');
  if (chipsEl) {
    const hrvVals = dates.map(d => byDay[d].hrv).filter(v => v != null);
    const maxHrv = hrvVals.length ? Math.max(...hrvVals) : 70;
    const minHrv = hrvVals.length ? Math.min(...hrvVals) : 50;
    const range  = maxHrv - minHrv || 1;
    chipsEl.innerHTML = dates.map((d,i) => {
      const isT = i === 6;
      const hrv = byDay[d].hrv ?? null;
      const pct = hrv != null ? Math.round((hrv - minHrv) / range * 70 + 15) : 10;
      const dow = DOW[new Date(d + 'T12:00:00').getDay()];
      const dd2 = new Date(d + 'T12:00:00');
      const md2 = `${dd2.getMonth()+1}/${dd2.getDate()}`;
      const cls = isT ? 'hrv-chip hrv-today' : hrv == null ? 'hrv-chip' :
        hrv >= maxHrv ? 'hrv-chip hrv-good' : hrv <= minHrv ? 'hrv-chip hrv-bad' : 'hrv-chip';
      return `<div class="${cls}" style="--hrv-pct:${pct}%"><div class="hrv-day">${dow}<div style="font-size:6.5px;opacity:0.7;margin-top:1px;letter-spacing:0">${md2}</div></div><div class="hrv-bar"><div style="height:${pct}%"></div></div><div class="hrv-val">${hrv ?? '—'}</div></div>`;
    }).join('');
    const statsEl = document.getElementById('weekly-hrv-stats');
    if (statsEl && hrvVals.length) {
      const avgH = Math.round(hrvVals.reduce((a,b)=>a+b,0)/hrvVals.length);
      statsEl.innerHTML = `<span><span class="en">Avg</span><span class="ja">平均</span> <strong style="color:var(--ink)">${avgH}ms</strong></span><span><span class="en">Peak</span><span class="ja">最大</span> <strong style="color:var(--gr)">${maxHrv}ms</strong></span><span><span class="en">Range</span><span class="ja">範囲</span> <strong style="color:var(--ink)">${minHrv}–${maxHrv}</strong></span>`;
    }
  }

  // ── SLEEP CONSISTENCY BARS ──
  const barsEl = document.getElementById('weekly-sleep-bars');
  if (barsEl) {
    barsEl.innerHTML = dates.map((d,i) => {
      const isT  = i === 6;
      const sc   = byDay[d].sl ?? null;
      const dd   = new Date(d + 'T12:00:00');
      const dow  = DOW[dd.getDay()];
      const m    = dd.getMonth()+1, day = dd.getDate();
      const color = sc == null ? 'rgba(0,0,0,0.12)' : sc >= 82 ? 'var(--gr)' : sc < 72 ? 'var(--am)' : 'var(--bl)';
      const tc    = sc == null ? 'var(--ink4)' : sc >= 82 ? 'var(--gr)' : sc < 72 ? 'var(--am)' : 'var(--ink3)';
      const pct   = sc != null ? Math.min(100, sc) : 0;
      const fw    = (isT || (sc != null && sc >= 82)) ? '600' : '400';
      return `<div style="display:flex;align-items:center;gap:8px;font-family:var(--fm);font-size:9px;color:${tc}">
        <span style="width:36px;font-weight:${fw}"><span style="display:block;font-size:9px;opacity:${isT?0.8:0.65}">${dow}</span>${m}/${day}</span>
        <div style="flex:1;background:rgba(0,0,0,0.06);border-radius:2px;height:8px">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:2px;opacity:0.8"></div>
        </div>
        <span style="width:18px;text-align:right;font-weight:${fw}">${sc ?? '—'}</span>
      </div>`;
    }).join('');
    const avgFooter = document.getElementById('weekly-sleep-avg-footer');
    if (avgFooter) {
      const a = colAvg('sl');
      avgFooter.innerHTML = a != null
        ? `<span class="en">7-day avg</span><span class="ja">7日平均</span> <strong style="color:var(--ink)">${a}</strong>`
        : '';
    }
  }

  // ── SLEEP WINDOW CHART ──
  const windowEl = document.getElementById('weekly-window-rows');
  if (windowEl) {
    // chart: 10 PM → 9 AM = 660 min; midnight ref = 120/660 = 18.18%
    const toMin = (iso) => {
      if (!iso) return null;
      const dt = new Date(iso);
      const h = dt.getHours(), mn = dt.getMinutes();
      const m = h >= 22 ? (h-22)*60+mn : (h+2)*60+mn;
      return Math.max(0, Math.min(660, m));
    };
    const durations = [];
    windowEl.innerHTML = dates.map((d,i) => {
      const isT = i === 6;
      const s   = slByDay[d];
      const dd  = new Date(d + 'T12:00:00');
      const dow = DOW[dd.getDay()];
      const m   = dd.getMonth()+1, day = dd.getDate();
      if (!s) {
        return `<div style="display:flex;align-items:center;gap:8px">
          <span style="width:36px;font-family:var(--fm);font-size:9px;color:var(--ink4)"><span style="display:block;font-size:9px;opacity:0.6">${dow}</span>${m}/${day}</span>
          <div style="flex:1;position:relative;height:14px"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.05);border-radius:3px"></div><div style="position:absolute;left:18.18%;top:0;bottom:0;width:1px;background:rgba(0,0,0,0.15)"></div></div>
          <span style="font-family:var(--fm);font-size:7.5px;color:var(--ink4);width:62px;flex-shrink:0;text-align:right">—</span>
        </div>`;
      }
      const bedMin  = toMin(s.bedtime_start);
      const wakeMin = toMin(s.bedtime_end);
      const leftPct  = bedMin  != null ? (bedMin  / 660 * 100).toFixed(1) : '0';
      const wPct     = (bedMin != null && wakeMin != null) ? ((wakeMin - bedMin) / 660 * 100).toFixed(1) : '0';
      const bedH = bedMin != null ? Math.floor(bedMin/60) + 22 : 25;
      const barColor = isT ? 'rgba(78,126,200,0.4)' :
        bedH < 23 ? 'rgba(58,125,90,0.38)' : bedH < 24 ? 'rgba(212,98,42,0.38)' : 'rgba(196,64,64,0.4)';
      const edgeColor = isT ? 'var(--bl)' : bedH < 23 ? 'var(--gr)' : bedH < 24 ? 'var(--am)' : 'var(--rd)';
      const tc = isT ? 'var(--bl)' : edgeColor;
      const fw = isT ? '600' : '400';
      if (s.total_sleep_duration) durations.push(s.total_sleep_duration);
      return `<div style="display:flex;align-items:center;gap:8px">
        <span style="width:36px;font-family:var(--fm);font-size:9px;color:${tc};font-weight:${fw}"><span style="display:block;font-size:9px;opacity:${isT?0.7:0.65}">${dow}</span>${m}/${day}</span>
        <div style="flex:1;position:relative;height:14px">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.05);border-radius:3px"></div>
          <div style="position:absolute;left:18.18%;top:0;bottom:0;width:1px;background:rgba(0,0,0,0.15)"></div>
          <div style="position:absolute;left:${leftPct}%;width:${wPct}%;height:100%;background:${barColor};border-radius:3px;border-left:2px solid ${edgeColor}"></div>
        </div>
        <span style="font-family:var(--fm);font-size:7.5px;color:${tc};font-weight:${fw};width:62px;flex-shrink:0;text-align:right">${fmtTime(s.bedtime_start)}→${fmtTime(s.bedtime_end)}</span>
      </div>`;
    }).join('');

    const statsEl = document.getElementById('weekly-window-stats');
    if (statsEl && durations.length) {
      const avgDur = Math.round(durations.reduce((a,b)=>a+b,0)/durations.length);
      statsEl.innerHTML = `<span><span class="en">Avg</span><span class="ja">平均</span> <strong style="color:var(--ink)">${fmt(avgDur)}</strong></span>`;
    }

    // Update avg-sleep-num strip
    const numEl   = document.getElementById('weekly-avg-sleep-num');
    const rangeEl = document.getElementById('weekly-avg-sleep-range');
    if (numEl && durations.length) numEl.textContent = fmt(Math.round(durations.reduce((a,b)=>a+b,0)/durations.length));
    if (rangeEl) rangeEl.textContent = `${fmtMD(dates[0]).toUpperCase()} – ${fmtMD(dates[6]).toUpperCase()} · ${durations.length} NIGHTS`;
  }
}

/* INIT */
['w-clock','w-weather','w-spotify','w-sleep','w-readiness','w-hrv','w-study','w-pomo','w-progress','w-tasks','w-steps','w-schedule'].forEach(id => {
  if (Store.get('widget-hidden-' + id, '0') === '1') { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
});
loadHwLayout();
updateHwGridMetrics();
initHwInteract();
calRender();
startCalendarPolling();

// Close gcal create popover on outside click
document.addEventListener('click', e => {
  const pop = document.getElementById('gcal-create-pop');
  if (pop && pop.style.display !== 'none' && !pop.contains(e.target)) gcalPopClose();
});

// Close gcal detail popover on outside click (ignore clicks on events/the popover itself)
document.addEventListener('click', e => {
  const pop = document.getElementById('gcal-detail-pop');
  if (!pop || pop.style.display === 'none') return;
  if (pop.contains(e.target)) return;
  if (e.target.closest('.gcal-ev-google')) return; // the click that opened it
  gcalDetailClose();
});

// Escape closes detail/create popovers
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  gcalDetailClose();
  gcalPopClose();
});
renderJournal();
renderNotes();
renderTasksMini();
syncHomeWithTasks();
updateKpiCounts();
checkHabitReset();
loadHabits();
migrateWishlistTasks();
renderWishlist();
loadFocusAutoSetting();
setInterval(checkHabitReset, 60000);
// Render schedule widget
renderScheduleWidget();
setInterval(renderScheduleWidget, 60000);

// Auto-navigate to section from URL hash (e.g. #health from health.html Full View)
if (location.hash) {
  const target = location.hash.slice(1);
  const btn = [...document.querySelectorAll('.sb-i')].find(b => b.getAttribute('onclick')?.includes(`'${target}'`));
  if (btn) go(btn, target);
}
seedMockData();
updateCheckinBtn();
if ('Notification' in window) Notification.requestPermission();

// Auth gate: check session on startup
(async () => {
  const session = posSession();
  if (!session) { lgShowStep('google'); return; }

  if (localStorage.getItem('pos-fully-setup') === '1') {
    // Already set up — go straight to app, no network check
    lgHide();
    sRefreshAccountStatus();
    return;
  }

  // Session exists but Oura not confirmed yet — verify and complete setup
  const user = await posCheckAuth();
  if (user) { await afterLogin(false); return; }
  lgShowStep('google');
})();
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeTaskDetail();
    closeNoteEdit();
    closeGoalsModal();
    closeKrProgressModal();
    closeTemplatesModal();
    closeLibraryModal();
    closeFocusMode();
  }
});
document.getElementById('modal').addEventListener('click', e => { if (e.target === document.getElementById('modal')) closeModal(); });

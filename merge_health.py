import re

with open('personal-os.html', 'r', encoding='utf-8') as f:
    pos = f.read()
with open('health.html', 'r', encoding='utf-8') as f:
    health = f.read()

# 1. Extract & rename health CSS
health_css_match = re.search(r'(/\* ── CONTENT VIEWS ── \*/.*?)(?=</style>)', health, re.DOTALL)
health_css = health_css_match.group(1).strip()
for old, new in [
    ('body.fit #view-D','body.fit #h-daily'),('body.fit #view-W','body.fit #h-weekly'),
    ('body.fit #view-M','body.fit #h-monthly'),('body.fit #view-X','body.fit #h-detail'),
    ('body.fit #view-C','body.fit #h-calibration'),
    ('body.dashboard #view-D','body.dashboard #h-daily'),('body.dashboard #view-W','body.dashboard #h-weekly'),
    ('body.dashboard #view-M','body.dashboard #h-monthly'),('body.dashboard #view-X','body.dashboard #h-detail'),
    ('body.dashboard #view-C','body.dashboard #h-calibration'),
    ('#view-D','#h-daily'),('#view-W','#h-weekly'),('#view-M','#h-monthly'),
    ('#view-X','#h-detail'),('#view-C','#h-calibration'),
]:
    health_css = health_css.replace(old, new)

# 2. Extract & rename health HTML block
html_match = re.search(
    r'(<div class="content active" id="view-D">.*?</div><!-- /layout -->.*?</div>)\s*\n\s*\n\s*<div id="toast">',
    health, re.DOTALL
)
health_html_block = html_match.group(1)
for old, new in [
    ('id="view-D"','id="h-daily"'),('id="view-W"','id="h-weekly"'),
    ('id="view-M"','id="h-monthly"'),('id="view-X"','id="h-detail"'),
    ('id="view-C"','id="h-calibration"'),
]:
    health_html_block = health_html_block.replace(old, new)

# 3. Extract health JS
js_start = health.find('/* ── FLOATING PANEL ── */')
js_end = health.find('// Start Oura API fetch')
health_js = health[js_start:js_end].strip()

# 4. Build merged HTML
merged = pos

# 4a. Append health CSS before </style>
merged = merged.replace(
    '\n</style>\n</head>',
    '\n\n/* ======================================\n   Health Dashboard CSS (from health.html)\n   ====================================== */\n' + health_css + '\n</style>\n</head>'
)

# 4b. Replace scr-health content
old_health_scr_pattern = r'    <!-- .{3} HEALTH .{3} -->\s*\n\s*<div class="scr" id="scr-health">.*?</div><!-- /scr-health -->'
new_health_scr = '    <!-- ══════ HEALTH ══════ -->\n    <div class="scr" id="scr-health">\n\n' + health_html_block + '\n\n    </div><!-- /scr-health -->'
merged2 = re.sub(old_health_scr_pattern, new_health_scr, merged, flags=re.DOTALL)
if len(merged2) > len(merged) + 10000:
    merged = merged2
    print('scr-health replaced successfully')
else:
    # Try simpler string replacement
    start_tag = '    <!-- ══════ HEALTH ══════ -->\n    <div class="scr" id="scr-health">'
    end_tag = '    </div><!-- /scr-health -->'
    si = merged.find(start_tag)
    ei = merged.find(end_tag)
    if si >= 0 and ei >= 0:
        merged = merged[:si] + '    <!-- ══════ HEALTH ══════ -->\n    <div class="scr" id="scr-health">\n\n' + health_html_block + '\n\n    </div><!-- /scr-health -->' + merged[ei + len(end_tag):]
        print('scr-health replaced via string search, new length:', len(merged))
    else:
        print('ERROR: could not replace scr-health')

# 4c. Add setup-overlay before crosshair
setup_overlay = '''<div id="setup-overlay" style="position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;background:var(--bg);backdrop-filter:blur(10px)">
  <div style="background:var(--s1);border:1px solid var(--b1);border-radius:16px;padding:32px;width:360px;text-align:center">
    <div style="font-size:14px;font-weight:600;color:var(--t1);margin-bottom:8px">Oura Ring 連携</div>
    <div style="font-size:11px;color:var(--t3);margin-bottom:20px">Personal Access Token を入力してください<br>cloud.ouraring.com → Personal Access Tokens</div>
    <input id="setup-token-input" type="password" placeholder="oura_pt_..." style="width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,0.12);border-radius:10px;font-size:12px;background:rgba(255,255,255,0.8);outline:none;margin-bottom:12px;font-family:monospace">
    <button onclick="setupConnect()" style="width:100%;height:38px;border-radius:10px;background:var(--t1);color:#fff;border:none;font-size:12px;font-weight:500;cursor:pointer">Connect</button>
    <div id="setup-error" style="font-size:10px;color:var(--rd);margin-top:8px;display:none"></div>
  </div>
</div>

'''
merged = merged.replace('<div class="crosshair"></div>', setup_overlay + '<div class="crosshair"></div>')

# 4d. Add float-fb and tweaks panel before </div><!-- /main -->
floattweaks_start = health.find('<div class="float-fb">')
floattweaks_end = health.find('\n\n<script>')
float_tweaks = health[floattweaks_start:floattweaks_end].strip()
# remove health's own toast (we keep personal-os's toast)
float_tweaks = re.sub(r'\n<div id="toast"></div>\n', '\n', float_tweaks)

merged = merged.replace(
    '\n</div><!-- /main -->\n',
    '\n</div><!-- /main -->\n\n' + float_tweaks + '\n\n'
)
print('float-fb/tweaks inserted, total length:', len(merged))

# 4e. Update setHealthPeriod function
old_sp = 'async function setHealthPeriod(mode, el) {\n  document.querySelectorAll(\'.hpb\').forEach(b => b.classList.remove(\'on\'));\n  el.classList.add(\'on\');\n  const dEl = document.getElementById(\'h-daily\');\n  const wEl = document.getElementById(\'h-weekly\');\n  const mEl = document.getElementById(\'h-monthly\');\n  if (dEl) dEl.style.display = mode === \'D\' ? \'flex\' : \'none\';\n  if (wEl) wEl.style.display = mode === \'W\' ? \'flex\' : \'none\';\n  if (mEl) mEl.style.display = mode === \'M\' ? \'flex\' : \'none\';\n  const today = new Date().toISOString().slice(0,10);\n  try {\n    if (mode === \'W\') { const d = await ouraLoadWeek(today); hRenderWeek(d); }\n    if (mode === \'M\') { const d = await ouraLoadMonth(today); hRenderMonth(d); }\n  } catch(e) { console.warn(\'Health period load:\', e); }\n}'
new_sp = "function setHealthPeriod(mode, el) {\n  document.querySelectorAll('.hpb').forEach(b => b.classList.remove('on'));\n  el.classList.add('on');\n  document.querySelectorAll('#scr-health .content').forEach(v => v.classList.remove('active'));\n  const idMap = {D:'h-daily', W:'h-weekly', M:'h-monthly', X:'h-detail', C:'h-calibration'};\n  const target = document.getElementById(idMap[mode]);\n  if (target) target.classList.add('active');\n}"

if old_sp in merged:
    merged = merged.replace(old_sp, new_sp)
    print('setHealthPeriod replaced')
else:
    # Try to find & replace by searching for key part
    sp_idx = merged.find('async function setHealthPeriod(mode, el) {')
    if sp_idx >= 0:
        sp_end = merged.find('\n}', sp_idx) + 2
        merged = merged[:sp_idx] + new_sp + merged[sp_end:]
        print('setHealthPeriod replaced (fallback)')
    else:
        print('WARNING: setHealthPeriod not found')

# 4f. Update go() - initHealthView -> initHealth
merged = merged.replace("if (name === 'health') { initHealthView(); }", "if (name === 'health') { initHealth(); }")
print('go() initHealth updated')

# 4g. Update go() to show/hide float-fb and tw-launch
old_go_end = "  if (hBar) hBar.style.display = name === 'health' ? 'flex' : 'none';\n}"
new_go_end = "  if (hBar) hBar.style.display = name === 'health' ? 'flex' : 'none';\n  const fb = document.querySelector('.float-fb');\n  const twLaunch = document.getElementById('tw-launch');\n  if (fb) fb.style.display = name === 'health' ? '' : 'none';\n  if (twLaunch) twLaunch.style.display = name === 'health' ? 'inline-flex' : 'none';\n}"
if old_go_end in merged:
    merged = merged.replace(old_go_end, new_go_end)
    print('go() float-fb/twLaunch updated')
else:
    print('WARNING: go() float-fb pattern not found')

# 4h. Update syncOura to call initHealth
old_sync = "  await initHealthView();\n}"
new_sync = "  await initHealth();\n}"
merged = merged.replace(old_sync, new_sync, 1)
print('syncOura updated')

# 4i. Add health JS before INIT block
old_init = '/* INIT */\n['
if old_init in merged:
    merged = merged.replace(
        old_init,
        '/* ======================================\n   Health Dashboard JS (from health.html)\n   ====================================== */\n' + health_js + '\n\n/* INIT */\n['
    )
    print('health JS inserted before INIT block')
else:
    print('WARNING: INIT block not found')

# 4j. Append seedMockData/updateCheckinBtn to init calls
old_notif = "if ('Notification' in window) Notification.requestPermission();"
new_notif = "seedMockData();\nupdateCheckinBtn();\nif ('Notification' in window) Notification.requestPermission();"
if old_notif in merged:
    merged = merged.replace(old_notif, new_notif, 1)
    print('seedMockData/updateCheckinBtn added to init')
else:
    print('WARNING: Notification pattern not found')

print('Final merged length:', len(merged))

# Write output
with open('health.html', 'w', encoding='utf-8') as f:
    f.write(merged)
print('Written to health.html successfully')

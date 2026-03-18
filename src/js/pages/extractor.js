/**
 * GS Report Extractor Page Module
 *
 * Data entry point: parses Excel files, displays extracted records,
 * and saves them to the SQLite database via Tauri commands.
 *
 * Record shape from Excel parsing:
 *   { date, sourceFile, store, dept, lastName, firstName, custNum, spQty, spSales, spPct }
 *
 * Tauri command: import_metrics(storeId, filename, records[])
 *   where each record = { employee_name, employee_initials, date, sp_pct, sp_n, sp_d, cust }
 */
window.ExtractorPage = (function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  var allRecords  = [];
  var loadedFiles = [];
  var editing     = false;
  var lockTimer   = null;
  var roster      = [];
  var rosterLocked = true;
  var rosterTimer  = null;
  var trashTimer   = null;
  var settingsOpen = false;
  var settingsTimer = null;
  var addAllTimer  = null;

  // ── Helpers ────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function onRoster(lastName, firstName) {
    if (roster.length === 0) return false;
    var l = lastName.trim().toLowerCase();
    var f = firstName.trim().toLowerCase();
    return roster.some(function(e) {
      return e.lastName.toLowerCase() === l && e.firstName.toLowerCase() === f;
    });
  }

  // ── Roster ─────────────────────────────────────────────────
  function renderRoster() {
    var mount = document.getElementById('roster-mount');
    if (!mount) return;
    var countEl = document.getElementById('roster-count');
    if (countEl) countEl.textContent = roster.length ? '(' + roster.length + '/30)' : '';

    if (roster.length === 0) {
      mount.innerHTML = '<div class="roster-scroll"><div class="roster-empty">No employees added — all names will be included</div></div>'
        + (!rosterLocked ? '<div class="roster-add" onclick="ExtractorPage.addRosterRow()">+ Add employee</div>' : '');
      return;
    }

    var rows = '<div class="roster-scroll">';
    roster.forEach(function(e, i) {
      var dis = rosterLocked ? 'disabled' : '';
      rows += '<div class="roster-row">'
        + '<span class="ri">' + (i+1) + '</span>'
        + '<input class="roster-inp roster-fn" placeholder="First name" value="' + esc(e.firstName) + '" ' + dis
        + ' data-idx="' + i + '" data-field="firstName" oninput="ExtractorPage.handleRosterInput(this)"/>'
        + '<input class="roster-inp" placeholder="Last name" value="' + esc(e.lastName) + '" ' + dis
        + ' data-idx="' + i + '" data-field="lastName" oninput="ExtractorPage.handleRosterInput(this)"/>'
        + '<button class="roster-del" ' + (rosterLocked ? 'disabled' : '')
        + ' onclick="ExtractorPage.removeRosterRow(' + i + ')">&#10005;</button>'
        + '</div>';
    });
    rows += '</div>';
    if (!rosterLocked && roster.length < 30) {
      rows += '<div class="roster-add" onclick="ExtractorPage.addRosterRow()">+ Add employee</div>';
    }
    mount.innerHTML = rows;
  }

  function renderTableStrikes() {
    document.querySelectorAll('#ext-tbl-mount tbody tr').forEach(function(tr) {
      var cells = tr.querySelectorAll('td');
      if (cells.length < 3) return;
      var nameEl = cells[1].querySelector('.name-text');
      var ln = nameEl ? nameEl.textContent : cells[1].textContent.trim().split('\n')[0].trim();
      var fn = cells[2].textContent.trim();
      var ok = onRoster(ln, fn);
      tr.classList.toggle('not-on-roster', !ok);
    });
  }

  // ── Render Table ───────────────────────────────────────────
  function renderTable() {
    var card = document.getElementById('ext-results-card');
    if (!allRecords.length) { if (card) card.style.display = 'none'; return; }
    card.style.display = 'block';

    var badge = document.getElementById('ext-results-badge');
    if (badge) badge.textContent = allRecords.length + ' row' + (allRecords.length !== 1 ? 's' : '');

    var dates = loadedFiles.map(function(f) { return f.date; }).filter(Boolean).sort(function(a,b) { return a-b; });
    var dateBadge = document.getElementById('ext-date-badge');
    if (dates.length && dateBadge) {
      var fmt = function(d) { return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear(); };
      dateBadge.style.display = '';
      dateBadge.textContent = dates.length === 1 ? fmt(dates[0]) : fmt(dates[0]) + ' - ' + fmt(dates[dates.length-1]);
    }

    var html = '<div class="tbl-wrap"><table><thead><tr>'
      + '<th>#</th><th>Last Name</th><th>First Name</th><th>Date</th>'
      + '<th class="r">Cust #</th><th class="r">SP Qty</th><th class="r">SP $</th><th class="r">SP %</th>'
      + '</tr></thead><tbody>';

    allRecords.forEach(function(r, i) {
      var dateStr = r.date ? (r.date.getMonth()+1) + '/' + r.date.getDate() + '/' + r.date.getFullYear() : '—';
      var pct = r.spPct < 1 ? (r.spPct * 100).toFixed(2) + '%' : r.spPct.toFixed(2) + '%';
      var inRoster = onRoster(r.lastName, r.firstName);
      html += '<tr' + (inRoster ? '' : ' class="not-on-roster"') + '>'
        + '<td style="color:var(--sl-lt);font-size:10px;">' + (i+1) + '</td>'
        + '<td class="name"><span class="name-text">' + esc(r.lastName) + '</span>' + (inRoster ? '' : ' <span style="font-size:9px;color:var(--red);font-weight:700;">not on roster</span>') + '</td>'
        + '<td>' + esc(r.firstName) + '</td>'
        + '<td style="font-size:11px;color:var(--sl);">' + dateStr + '</td>'
        + '<td class="num">' + r.custNum.toLocaleString() + '</td>'
        + '<td class="num">' + r.spQty.toLocaleString() + '</td>'
        + '<td class="num money">$' + r.spSales.toFixed(2) + '</td>'
        + '<td class="num pct">' + pct + '</td>'
        + '</tr>';
    });

    html += '</tbody></table></div>';
    document.getElementById('ext-tbl-mount').innerHTML = html;
  }

  // ── File Processing ────────────────────────────────────────
  async function handleFiles(files) {
    if (!files.length) return;

    var store = document.getElementById('ext-inp-store').value.trim();
    var dept  = document.getElementById('ext-inp-dept').value.trim();
    var logBox   = document.getElementById('ext-log-box');
    var progWrap = document.getElementById('ext-prog-wrap');
    var progFill = document.getElementById('ext-prog-fill');

    logBox.style.display   = 'block';
    progWrap.style.display = 'block';
    logBox.innerHTML = '';
    allRecords  = [];
    loadedFiles = [];

    document.getElementById('ext-results-card').style.display = 'none';
    var btnDb = document.getElementById('ext-btn-db');
    if (btnDb) { btnDb.disabled = false; btnDb.textContent = 'Save to Database'; btnDb.classList.remove('done'); }

    function log(msg, type) {
      var d = document.createElement('div');
      d.className = 'log-' + (type || 'info');
      d.textContent = msg;
      logBox.appendChild(d);
      logBox.scrollTop = logBox.scrollHeight;
    }

    log('[START] ' + files.length + ' file(s) — Store:"' + store + '" Dept:"' + dept + '"', 'info');
    var errors = 0;

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      progFill.style.width = Math.round(((i + 0.5) / files.length) * 90 + 5) + '%';
      progFill.className = 'prog-fill prog-blue';

      var m = file.name.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
      var fileDate = m
        ? new Date((m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + m[1].padStart(2,'0') + '-' + m[2].padStart(2,'0') + 'T12:00:00')
        : null;
      if (!fileDate) log('[WARN] ' + file.name + ' — date not found in filename', 'warn');

      try {
        var buf = await file.arrayBuffer();
        var wb  = XLSX.read(buf, { type: 'array' });
        var ws  = wb.Sheets['Daily'];
        if (!ws) { log('[WARN] ' + file.name + ' — no "Daily" sheet', 'warn'); errors++; continue; }

        var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        var headerIdx = -1;
        for (var r = 0; r < rows.length; r++) {
          if (String(rows[r][0]).trim().toLowerCase() === 'store') { headerIdx = r; break; }
        }
        if (headerIdx === -1) { log('[WARN] ' + file.name + ' — header row not found', 'warn'); errors++; continue; }

        var found = 0;
        rows.slice(headerIdx + 1).forEach(function(row) {
          var colA = String(row[0] || '').trim();
          var colB = String(row[1] || '').trim();
          if (colA !== store) return;
          if (colB.toUpperCase() !== dept.toUpperCase()) return;
          var lastName  = String(row[2] || '').trim();
          var firstName = String(row[3] || '').trim();
          if (!lastName || !firstName || lastName.toLowerCase() === 'total') return;

          allRecords.push({
            date: fileDate, sourceFile: file.name, store: colA, dept: colB,
            lastName: lastName, firstName: firstName,
            custNum: parseFloat(row[5]) || 0,
            spQty:   parseFloat(row[6]) || 0,
            spSales: parseFloat(row[7]) || 0,
            spPct:   parseFloat(row[8]) || 0,
          });
          found++;
        });

        if (found === 0) {
          log('[WARN] ' + file.name + ' — 0 matching rows', 'warn'); errors++;
        } else {
          log('[OK] ' + file.name + ' — ' + found + ' rows', 'ok');
          loadedFiles.push({ name: file.name, date: fileDate });
        }
      } catch (e) {
        log('[ERR] ' + file.name + ' — ' + (e.message || 'read error'), 'err'); errors++;
      }
    }

    progFill.style.width = '100%';
    progFill.className = 'prog-fill ' + (errors > 0 && allRecords.length === 0 ? 'prog-red' : 'prog-green');
    log('[DONE] ' + allRecords.length + ' rows' + (errors ? ' · ' + errors + ' warning(s)' : ''), errors && allRecords.length === 0 ? 'err' : 'ok');
    renderTable();
    updateDropCard();
  }

  // ── Drop Card State ────────────────────────────────────────
  function updateDropCard() {
    var dz = document.getElementById('ext-drop-zone');
    if (!dz) return;

    if (allRecords.length > 0) {
      dz.innerHTML = '<div style="font-size:44px;margin-bottom:10px;">&#128465;</div>'
        + '<div style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:6px;">' + allRecords.length + ' rows loaded</div>'
        + '<div style="font-size:11px;color:var(--sl-lt);">Hold 3 seconds to clear all data and load new files</div>';
      dz.style.cssText = 'border:2px solid var(--red-dim);border-radius:var(--r8);padding:32px;text-align:center;cursor:pointer;background:var(--red-bg);transition:opacity .2s;';
      dz.onmousedown  = function(e) { e.preventDefault(); startTrashHold(); };
      dz.onmouseup    = cancelTrashHold;
      dz.onmouseleave = cancelTrashHold;
      dz.onclick      = null;
      dz.ondragover   = function(e) { e.preventDefault(); };
      dz.ondrop       = function(e) { e.preventDefault(); };
    } else {
      dz.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">&#128194;</div>'
        + '<div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px;">Drop Store Daily Sales .xlsx files here</div>'
        + '<div style="font-size:11px;color:var(--sl-lt);">or click to browse &middot; multiple files &middot; Store Daily Sales MM-DD-YY</div>';
      dz.style.cssText = 'border:2px dashed var(--sl-dim);border-radius:var(--r8);padding:32px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;';
      dz.onmousedown = null; dz.onmouseup = null; dz.onmouseleave = null;
      dz.onclick = function() { document.getElementById('ext-file-input').click(); };
      dz.ondragover = function(e) { e.preventDefault(); dz.style.borderColor='var(--blue)'; dz.style.background='var(--blue-lt)'; };
      dz.ondragleave = function() { dz.style.borderColor=''; dz.style.background=''; };
      dz.ondrop = function(e) {
        e.preventDefault(); dz.style.borderColor=''; dz.style.background='';
        handleFiles([].slice.call(e.dataTransfer.files).filter(function(f) { return /\.xlsx?$/i.test(f.name); }));
      };
    }
  }

  function startTrashHold() {
    var dz = document.getElementById('ext-drop-zone');
    if (dz) dz.style.opacity = '0.6';
    trashTimer = setTimeout(function() {
      if (dz) dz.style.opacity = '';
      allRecords = []; loadedFiles = [];
      var el;
      if ((el = document.getElementById('ext-log-box'))) el.style.display = 'none';
      if ((el = document.getElementById('ext-prog-wrap'))) el.style.display = 'none';
      if ((el = document.getElementById('ext-results-card'))) el.style.display = 'none';
      updateDropCard();
    }, 3000);
  }
  function cancelTrashHold() {
    if (trashTimer) { clearTimeout(trashTimer); trashTimer = null; }
    var dz = document.getElementById('ext-drop-zone');
    if (dz) dz.style.opacity = '';
  }

  // ── Export ─────────────────────────────────────────────────
  function buildFilename(ext) {
    var dept  = document.getElementById('ext-inp-dept').value.trim();
    var dates = loadedFiles.map(function(f) { return f.date; }).filter(Boolean).sort(function(a,b) { return a-b; });
    var pad = function(n) { return String(n).padStart(2,'0'); };
    var fmt = function(d) { return pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '-' + d.getFullYear(); };
    if (!dates.length) return 'Daily' + dept + 'Sales.' + ext;
    if (dates.length === 1) return 'Daily' + dept + 'Sales-' + fmt(dates[0]) + '.' + ext;
    return 'Daily' + dept + 'Sales-' + fmt(dates[0]) + '--to--' + fmt(dates[dates.length-1]) + '.' + ext;
  }

  function doExport(type) {
    if (!allRecords.length) return;
    var exportRecords = roster.length === 0 ? allRecords : allRecords.filter(function(r) { return onRoster(r.lastName, r.firstName); });
    var filename = buildFilename(type);
    if (type === 'csv') {
      var header = 'Date,Store,Dept,Last Name,First Name,Cust #,SP Qty,SP $,SP %';
      var lines = exportRecords.map(function(r) {
        var d = r.date ? (r.date.getMonth()+1)+'/'+r.date.getDate()+'/'+r.date.getFullYear() : '';
        var pct = r.spPct < 1 ? (r.spPct*100).toFixed(4) : r.spPct.toFixed(4);
        return [d,r.store,r.dept,r.lastName,r.firstName,r.custNum,r.spQty,r.spSales.toFixed(2),pct].map(function(v) { return '"'+String(v).replace(/"/g,'""')+'"'; }).join(',');
      });
      var blob = new Blob([[header].concat(lines).join('\n')], {type:'text/csv'});
      var url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), {href:url, download:filename}).click();
      URL.revokeObjectURL(url);
    } else if (typeof XLSX !== 'undefined') {
      var hdr = ['Date','Store','Dept','Last Name','First Name','Cust #','SP Qty','SP $','SP %'];
      var wsRows = exportRecords.map(function(r) {
        var d = r.date ? (r.date.getMonth()+1)+'/'+r.date.getDate()+'/'+r.date.getFullYear() : '';
        var pct = r.spPct < 1 ? parseFloat((r.spPct*100).toFixed(4)) : r.spPct;
        return [d,r.store,r.dept,r.lastName,r.firstName,r.custNum,r.spQty,r.spSales,pct];
      });
      var ws = XLSX.utils.aoa_to_sheet([hdr].concat(wsRows));
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, filename);
    }
  }

  // ── Save to Database (Tauri) ───────────────────────────────
  async function saveToDb() {
    if (!allRecords.length) return;
    var exportRecords = roster.length === 0 ? allRecords : allRecords.filter(function(r) { return onRoster(r.lastName, r.firstName); });
    if (exportRecords.length === 0) { alert('No records to save (all filtered out by roster).'); return; }

    var btn = document.getElementById('ext-btn-db');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      // Transform records to the ImportRecord shape expected by Rust
      var pad = function(n) { return String(n).padStart(2,'0'); };
      var records = exportRecords.map(function(r) {
        var dateStr = r.date
          ? r.date.getFullYear() + '-' + pad(r.date.getMonth()+1) + '-' + pad(r.date.getDate())
          : null;
        return {
          employee_name: r.lastName + ', ' + r.firstName,
          employee_initials: (r.firstName[0] || '') + (r.lastName[0] || ''),
          date: dateStr,
          sp_pct: r.spPct < 1 ? r.spPct * 100 : r.spPct,
          sp_n: r.spQty,
          sp_d: r.spSales,
          cust: Math.round(r.custNum)
        };
      });

      var storeId = parseInt(document.getElementById('ext-inp-store').value) || 141;
      var filename = buildFilename('csv');

      if (window.GS && window.GS.isTauri()) {
        var imported = await window.GS.importMetrics(storeId, filename, records);
        btn.textContent = '✓ Saved ' + imported + ' records';
      } else {
        // Fallback for non-Tauri dev
        await new Promise(function(r) { setTimeout(r, 500); });
        btn.textContent = '✓ Saved (demo)';
      }
      btn.classList.add('done');
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Save to Database';
      alert('Error: ' + (e.message || e));
    }
  }

  // ── Hold Handlers ──────────────────────────────────────────
  function startLockHold() {
    if (editing) { setEditing(false); return; }
    var btn = document.getElementById('ext-lock-btn');
    if (btn) btn.classList.add('glowing');
    lockTimer = setTimeout(function() { setEditing(true); }, 3000);
  }
  function cancelLockHold() {
    if (lockTimer) { clearTimeout(lockTimer); lockTimer = null; }
    if (!editing) { var btn = document.getElementById('ext-lock-btn'); if (btn) btn.classList.remove('glowing'); }
  }
  function setEditing(v) {
    editing = v;
    var s = document.getElementById('ext-inp-store');
    var d = document.getElementById('ext-inp-dept');
    if (s) s.disabled = !v;
    if (d) d.disabled = !v;
    var btn = document.getElementById('ext-lock-btn');
    if (btn) { btn.classList.remove('glowing'); btn.classList.toggle('unlocked', v); btn.textContent = v ? 'Click to lock' : 'Hold 3s to edit'; }
  }

  function startRosterHold() {
    if (!rosterLocked) { setRosterLocked(true); return; }
    var btn = document.getElementById('ext-roster-lock-btn');
    if (btn) btn.classList.add('glowing');
    rosterTimer = setTimeout(function() { setRosterLocked(false); }, 1000);
  }
  function cancelRosterHold() {
    if (rosterTimer) { clearTimeout(rosterTimer); rosterTimer = null; }
    if (rosterLocked) { var btn = document.getElementById('ext-roster-lock-btn'); if (btn) btn.classList.remove('glowing'); }
  }
  function setRosterLocked(v) {
    rosterLocked = v;
    var btn = document.getElementById('ext-roster-lock-btn');
    if (btn) { btn.classList.remove('glowing'); btn.classList.toggle('unlocked', !v); btn.textContent = v ? 'Hold 1s to edit' : 'Click to lock'; }
    renderRoster();
  }

  function startSettingsHold() {
    if (settingsOpen) { toggleSettings(false); return; }
    settingsTimer = setTimeout(function() { toggleSettings(true); }, 1000);
  }
  function cancelSettingsHold() {
    if (settingsTimer) { clearTimeout(settingsTimer); settingsTimer = null; }
  }
  function toggleSettings(open) {
    settingsOpen = open;
    var body = document.getElementById('ext-settings-body');
    var hint = document.getElementById('ext-settings-hint');
    var chev = document.getElementById('ext-settings-chevron');
    if (body) body.style.display = open ? 'block' : 'none';
    if (hint) hint.textContent = open ? 'Click header to close' : 'Hold 1s to open';
    if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  }

  // ── Main Render ────────────────────────────────────────────
  function renderApp() {
    var el = document.getElementById('page-content');
    if (!el) return;

    el.innerHTML = [
      '<div class="topbar"><div class="tb-title">GS Report Extractor</div></div>',
      '<div class="content ext-content">',
      // Settings card
      '<div class="card" style="padding:0;overflow:hidden;">',
        '<div id="ext-settings-header" style="display:flex;align-items:center;gap:10px;padding:14px 20px;cursor:pointer;user-select:none;"',
          ' onmousedown="ExtractorPage.startSettingsHold()" onmouseup="ExtractorPage.cancelSettingsHold()" onmouseleave="ExtractorPage.cancelSettingsHold()">',
          '<span style="font-family:\'Syne\',sans-serif;font-size:13px;font-weight:700;color:var(--ink);flex:1;">Filter settings</span>',
          '<span id="ext-settings-hint" style="font-size:10px;color:var(--sl-lt);">Hold 1s to open</span>',
          '<span id="ext-settings-chevron" style="font-size:12px;color:var(--sl-lt);transition:transform .2s;">&#9660;</span>',
        '</div>',
        '<div id="ext-settings-body" style="display:none;padding:0 20px 20px;">',
          '<div class="cfg-row">',
            '<div class="cfg-field"><label>Store # (Col A)</label><input class="cfg-input" id="ext-inp-store" value="141" disabled/></div>',
            '<div class="cfg-field"><label>Dept (Col B)</label><input class="cfg-input" id="ext-inp-dept" value="GS" disabled/></div>',
            '<button class="lock-btn" id="ext-lock-btn" onmousedown="ExtractorPage.startLockHold()" onmouseup="ExtractorPage.cancelLockHold()" onmouseleave="ExtractorPage.cancelLockHold()">Hold 3s to edit</button>',
          '</div>',
          '<div style="font-size:10px;color:var(--sl-lt);margin-top:8px;">Daily sheet only &middot; Col A = Store &middot; Col B = Dept &middot; C = Last Name &middot; D = First Name &middot; F = Cust # &middot; G = SP Qty &middot; H = SP $ &middot; I = SP %</div>',
          '<div class="roster-panel">',
            '<div class="roster-header" style="flex-wrap:wrap;gap:8px;">',
              '<div class="roster-title">Current employees <span id="roster-count" style="font-size:10px;color:var(--sl-lt);font-family:\'DM Mono\',monospace;"></span></div>',
              '<button class="roster-lock" id="ext-roster-lock-btn" onmousedown="ExtractorPage.startRosterHold()" onmouseup="ExtractorPage.cancelRosterHold()" onmouseleave="ExtractorPage.cancelRosterHold()">Hold 1s to edit</button>',
            '</div>',
            '<div id="roster-mount"></div>',
            '<div style="font-size:10px;color:var(--sl-lt);margin-top:6px;">Names <strong>not</strong> on this list will be struck through in results and excluded from exports.</div>',
          '</div>',
        '</div>',
      '</div>',
      // Drop zone
      '<div class="card">',
        '<div class="drop-zone" id="ext-drop-zone"></div>',
        '<input type="file" id="ext-file-input" accept=".xlsx,.xls" multiple style="display:none;">',
        '<div class="prog-wrap" id="ext-prog-wrap" style="display:none;"><div class="prog-fill prog-blue" id="ext-prog-fill" style="width:0%;"></div></div>',
        '<div class="log-box" id="ext-log-box" style="display:none;"></div>',
      '</div>',
      // Results
      '<div class="card" id="ext-results-card" style="display:none;">',
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">',
          '<div class="card-title" style="margin:0;">Results</div>',
          '<span class="badge" id="ext-results-badge">0 rows</span>',
          '<span class="badge badge-green" id="ext-date-badge" style="display:none;"></span>',
          '<div style="margin-left:auto;display:flex;gap:7px;flex-wrap:wrap;">',
            '<button class="btn btn-sl" onclick="ExtractorPage.doExport(\'csv\')">&#8595; CSV</button>',
            '<button class="btn btn-sl" onclick="ExtractorPage.doExport(\'xlsx\')">&#8595; XLSX</button>',
            '<button class="btn btn-green" id="ext-btn-db" onclick="ExtractorPage.saveToDb()">Save to Database</button>',
            '<button class="btn" onclick="ExtractorPage.clearData()" style="background:#FEE2E2;border:1px solid #FCA5A5;color:#B91C1C;">Clear data</button>',
          '</div>',
        '</div>',
        '<div id="ext-tbl-mount"></div>',
      '</div>',
      '</div>'
    ].join('');

    // Wire file input
    var fi = document.getElementById('ext-file-input');
    if (fi) fi.addEventListener('change', function(e) { handleFiles([].slice.call(e.target.files)); fi.value = ''; });

    renderRoster();
    updateDropCard();
    if (allRecords.length > 0) renderTable();
  }

  function clearData() {
    if (!allRecords.length) return;
    allRecords = []; loadedFiles = [];
    var el;
    if ((el = document.getElementById('ext-log-box'))) el.style.display = 'none';
    if ((el = document.getElementById('ext-prog-wrap'))) el.style.display = 'none';
    if ((el = document.getElementById('ext-results-card'))) el.style.display = 'none';
    updateDropCard();
  }

  // ── Public API ─────────────────────────────────────────────
  var api = {
    init: function(params) { renderApp(); },
    renderApp: renderApp,
    // Exposed for onclick handlers
    startSettingsHold: startSettingsHold,
    cancelSettingsHold: cancelSettingsHold,
    startLockHold: startLockHold,
    cancelLockHold: cancelLockHold,
    startRosterHold: startRosterHold,
    cancelRosterHold: cancelRosterHold,
    addRosterRow: function() {
      if (roster.length >= 30) return;
      roster.push({ firstName: '', lastName: '' });
      renderRoster();
    },
    removeRosterRow: function(i) { roster.splice(i, 1); renderRoster(); renderTable(); },
    handleRosterInput: function(el) {
      var idx = parseInt(el.dataset.idx);
      roster[idx][el.dataset.field] = el.value.trim();
      renderTableStrikes();
    },
    doExport: doExport,
    saveToDb: saveToDb,
    clearData: clearData
  };

  return api;
})();

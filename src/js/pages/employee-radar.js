window.EmployeeRadarPage = (function() {
  let DATA = {
  "employee": {
    "id": 43,
    "name": "Smith, John",
    "initials": "SJ",
    "status": "Active",
    "weeksOnRecord": 52
  },
  "period": {
    "label": "2 weeks",
    "from": "Mar 1, 2026",
    "to": "Mar 14, 2026",
    "days": 10
  },
  "metrics": [
    {
      "key": "sp_pct",
      "label": "SP %",
      "empVal": "1.97%",
      "storeAvg": "1.84%", "storeMedian": "1.79%",
      "goal": "2.00%",
      "aboveMean": true,
      "goalMet": false,
      "gap": "-0.03%"
    },
    {
      "key": "cust",
      "label": "Cust #",
      "empVal": "42",
      "storeAvg": "38", "storeMedian": "37",
      "goal": "40",
      "aboveMean": true,
      "goalMet": true,
      "gap": "+2"
    },
    {
      "key": "sp_d",
      "label": "SP $",
      "empVal": "$228",
      "storeAvg": "$199", "storeMedian": "$193",
      "goal": "$250",
      "aboveMean": true,
      "goalMet": false,
      "gap": "-$22"
    },
    {
      "key": "pts_wk",
      "label": "Pts/wk",
      "empVal": "10.4",
      "storeAvg": "8.4", "storeMedian": "8.1",
      "goal": "7",
      "aboveMean": true,
      "goalMet": true,
      "gap": "+3.4"
    }
  ],
  "radar": {
    "axes": [
      {
        "key": "sp_pct",
        "label": "SP %",
        "empNorm": 98.5,
        "avgNorm": 92.0, "medianNorm": 89.5,
        "personalNorm": 85.0
      },
      {
        "key": "sp_n",
        "label": "SP #",
        "empNorm": 90.0,
        "avgNorm": 81.7, "medianNorm": 78.3,
        "personalNorm": 80.0
      },
      {
        "key": "sp_d",
        "label": "SP $",
        "empNorm": 91.2,
        "avgNorm": 79.6, "medianNorm": 77.2,
        "personalNorm": 75.0
      },
      {
        "key": "cust",
        "label": "Cust #",
        "empNorm": 105.0,
        "avgNorm": 95.0, "medianNorm": 92.5,
        "personalNorm": 88.0
      },
      {
        "key": "pts_wk",
        "label": "Pts/wk",
        "empNorm": 148.6,
        "avgNorm": 120.0, "medianNorm": 115.7,
        "personalNorm": 110.0
      }
    ]
  },
  "statsTable": [
    {
      "metric": "SP %",
      "empVal": "1.97%",
      "avgVal": "1.84%", "medianAvgVal": "1.79%",
      "goalVal": "2.00%",
      "status": "miss",
      "gap": "-0.03%"
    },
    {
      "metric": "SP #",
      "empVal": "5.4",
      "avgVal": "4.9", "medianAvgVal": "4.7",
      "goalVal": "6",
      "status": "miss",
      "gap": "-0.6"
    },
    {
      "metric": "SP $",
      "empVal": "$228",
      "avgVal": "$199", "medianAvgVal": "$193",
      "goalVal": "$250",
      "status": "miss",
      "gap": "-$22"
    },
    {
      "metric": "Cust #",
      "empVal": "42",
      "avgVal": "38", "medianAvgVal": "37",
      "goalVal": "40",
      "status": "hit",
      "gap": "+2"
    },
    {
      "metric": "Pts/wk",
      "empVal": "10.4",
      "avgVal": "8.4", "medianAvgVal": "8.1",
      "goalVal": "7",
      "status": "hit",
      "gap": "+3.4"
    }
  ],
  "exceptions": [
    {
      "metric": "SP %",
      "defaultGoal": "2.00%",
      "overrideVal": "2.00%",
      "locked": true,
      "reason": "No exception \u2014 using global goal."
    },
    {
      "metric": "SP #",
      "defaultGoal": 6,
      "overrideVal": 6,
      "locked": true,
      "reason": "No exception \u2014 using global goal."
    },
    {
      "metric": "SP $",
      "defaultGoal": 250,
      "overrideVal": 275,
      "locked": false,
      "reason": "Pilot higher-ticket SP program \u2014 tracking elevated target through end of quarter."
    },
    {
      "metric": "Cust #",
      "defaultGoal": 40,
      "overrideVal": 40,
      "locked": true,
      "reason": "No exception \u2014 using global goal."
    },
    {
      "metric": "Pts/wk",
      "defaultGoal": 7,
      "overrideVal": 10,
      "locked": true,
      "reason": "Full-time senior rep \u2014 elevated target approved by district manager Q1 2026."
    }
  ],
  "personalGoals": [
    {
      "metric": "SP %",
      "val": "1.70%",
      "unit": "rate per sale",
      "locked": false,
      "note": "Stepping stone toward 2.00% goal."
    },
    {
      "metric": "SP #",
      "val": "4.8",
      "unit": "per day",
      "locked": false,
      "note": "Working up from current 4.5 avg."
    },
    {
      "metric": "SP $",
      "val": "188",
      "unit": "per day",
      "locked": false,
      "note": ""
    },
    {
      "metric": "Cust #",
      "val": "35",
      "unit": "per day",
      "locked": true,
      "note": "Agreed target for this quarter."
    },
    {
      "metric": "Pts/wk",
      "val": "7.7",
      "unit": "per week",
      "locked": false,
      "note": "Personal stretch beyond quota."
    }
  ]
};
  var EMPLOYEE_DATA = DATA;
  var currentPeriod = '2w';
  var isRecUpload = false;

// ─────────────────────────────────────────────────────────────
// RADAR GEOMETRY
// Pentagon, 5 axes. Center (CX,CY). Max radius R = 100% (goal ring).
// Axis 0 = top, clockwise +72° per axis.
// normVal 100 = goal ring. Values >100 extend outside (capped 115).
// ─────────────────────────────────────────────────────────────
const CX = 195, CY = 188, R = 148;
const N_AXES = 5;

function axisAngle(i) {
  return (i / N_AXES) * 2 * Math.PI - Math.PI / 2;
}

function polarPt(axisIdx, normVal) {
  const r = Math.min(normVal, 115) / 100 * R;
  const a = axisAngle(axisIdx);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function ptStr(pts) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ─────────────────────────────────────────────────────────────
// BUILD RADAR SVG
// Layer order (back to front):
//   1. Ring grid lines
//   2. Axis spokes
//   3. Ring % labels
//   4. Personal goal ring (lime dotted — thinner)
//   5. Goal ring (red dashed)
//   6. Store avg polygon (purple)
//   7. Employee polygon (blue) — on top
//   8. Axis labels (metric name only, no data values)
// ─────────────────────────────────────────────────────────────
function buildRadarSVG() {
  const axes        = EMPLOYEE_DATA.radar.axes;
  const empNorms    = axes.map(a => a.empNorm);
  const avgNorms    = axes.map(a => a.avgNorm);
  const personalNorms = axes.map(a => a.personalNorm);

  // Grid rings at 25 / 50 / 75 / 100%
  const ringLevels = [25, 50, 75, 100];
  const rings = ringLevels.map((lvl, ri) => {
    const pts = ptStr(Array.from({length: N_AXES}, (_, i) => polarPt(i, lvl)));
    const last = ri === ringLevels.length - 1;
    return `<polygon points="${pts}" fill="none"
      stroke="#CBD5E1" stroke-width="${last ? 1.4 : 0.9}" opacity="${last ? 1 : 0.55}"/>`;
  }).join('');

  // Axis spokes from center to 100% ring
  const spokes = Array.from({length: N_AXES}, (_, i) => {
    const outer = polarPt(i, 100);
    return `<line x1="${CX}" y1="${CY}"
      x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}"
      stroke="#CBD5E1" stroke-width="1"/>`;
  }).join('');

  // % labels on top axis (offset right so they don't overlap spoke)
  const ringLabels = [25, 50, 75].map(lvl => {
    const p = polarPt(0, lvl);
    return `<text x="${(p.x + 4).toFixed(1)}" y="${(p.y + 1).toFixed(1)}"
      font-size="8" fill="#94A3B8" font-family="DM Mono,monospace">${lvl}%</text>`;
  }).join('');

  // Personal goal ring — lime dotted, thinner (1.5) than goal/avg lines.
  // Only rendered when showPersonalGoal === true.
  const personalPts = ptStr(personalNorms.map((v, i) => polarPt(i, v)));
  const personalRing = showPersonalGoal ? `<polygon points="${personalPts}"
    fill="rgba(101,163,13,.07)" stroke="#65A30D"
    stroke-width="1.5" stroke-dasharray="5,4"/>` : '';

  // Goal ring — respects showGoalLines toggle.
  const goalPts = ptStr(Array.from({length: N_AXES}, (_, i) => polarPt(i, 100)));
  const goalRing = showGoalLines ? `<polygon points="${goalPts}"
    fill="rgba(185,28,28,.05)" stroke="#B91C1C"
    stroke-width="2.2" stroke-dasharray="7,4"/>` : '';

  // Store avg polygon — PURPLE (not gold — stays purple per spec)
  const avgPts = ptStr(avgNorms.map((v, i) => polarPt(i, v)));
  const avgPoly = `<polygon points="${avgPts}"
    fill="rgba(109,40,217,.12)" stroke="#6D28D9" stroke-width="2"/>`;

  // Employee polygon — blue, on top
  const empPts = ptStr(empNorms.map((v, i) => polarPt(i, v)));
  const empPoly = `<polygon points="${empPts}"
    fill="rgba(22,82,232,.15)" stroke="#1652E8" stroke-width="2.8"/>`;

  // Axis labels — metric name only, NO data values on labels
  const labelR = R + 28;
  const axisLabels = axes.map((axis, i) => {
    const a   = axisAngle(i);
    const lx  = (CX + labelR * Math.cos(a)).toFixed(1);
    const lyF = CY + labelR * Math.sin(a);
    const ly  = (lyF + (Math.sin(a) > 0.4 ? 12 : 0)).toFixed(1);

    // Anchor: right side = start, left side = end, top/bottom = middle
    let anchor = 'middle';
    if (Math.cos(a) >  0.25) anchor = 'start';
    if (Math.cos(a) < -0.25) anchor = 'end';

    return `<text x="${lx}" y="${ly}"
      font-size="13" fill="#0B1220" font-family="DM Sans,sans-serif"
      font-weight="700" text-anchor="${anchor}">${axis.label}</text>`;
  }).join('');

  // SVG dimensions: generous padding for labels
  return `<svg width="100%" viewBox="-45 -5 460 415"
    style="max-width:410px;display:block;margin:0 auto;">
    ${rings}
    ${spokes}
    ${ringLabels}
    ${personalRing}
    ${goalRing}
    ${avgPoly}
    ${empPoly}
    ${axisLabels}
  </svg>`;
}

// ─────────────────────────────────────────────────────────────
// METRIC CARDS
// ─────────────────────────────────────────────────────────────
function buildMetricCards() {
  return '<div class="metric-cards">' + EMPLOYEE_DATA.metrics.map(m => {
    const cls     = m.aboveMean ? 'above' : 'below';
    const indCls  = m.aboveMean ? 'up' : 'dn';
    const indIcon = m.aboveMean ? '&#8593; avg' : '&#8595; avg';
    const goalCls = m.goalMet ? 'hit' : 'miss';
    const goalIco = m.goalMet ? '&#10003;' : '&#10007;';
    const goalTxt = m.goalMet ? 'Goal met' : 'Goal missed';
    return `<div class="mc ${cls}">
      <div class="mc-lbl">${m.label} (${EMPLOYEE_DATA.period.label})</div>
      <div class="mc-vrow">
        <div class="mc-val">${m.empVal}</div>
        <span class="mc-ind ${indCls}">${indIcon}</span>
      </div>
      <div class="mc-avg">Store avg: ${m.storeAvg}</div>
      <div class="mc-goal ${goalCls}">
        <span class="mc-goal-ico">${goalIco}</span>
        <span class="mc-goal-txt">${goalTxt}</span>
        <span class="mc-goal-gap">${m.gap}</span>
      </div>
    </div>`;
  }).join('') + '</div>';
}

// ─────────────────────────────────────────────────────────────
// STATS TABLE
// ─────────────────────────────────────────────────────────────
function buildStatsTable() {
  const firstName = EMPLOYEE_DATA.employee.name.split(',')[1].trim();
  const rows = EMPLOYEE_DATA.statsTable.map(r => {
    const badge = r.status === 'hit'
      ? `<span class="badge-hit">&#10003; ${r.gap}</span>`
      : `<span class="badge-miss">&#10007; ${r.gap}</span>`;
    return `<tr>
      <td>${r.metric}</td>
      <td><strong>${r.empVal}</strong></td>
      <td style="color:#D97706;font-weight:600;">${r.avgVal}</td>
      <td style="color:#B91C1C;font-weight:600;">${r.goalVal}</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
  return `<div class="cp">
    <div class="cp-title">${EMPLOYEE_DATA.period.label} stats vs goal</div>
    <table class="stats-tbl">
      <thead>
        <tr>
          <th>Metric</th>
          <th>${firstName}</th>
          <th style="color:#FCD34D;">Avg</th>
          <th style="color:#FCA5A5;">Goal</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// COLLAPSIBLE ACCORDION — shared builder
// type: 'exc' | 'personal'
// Clicking the header toggles the .open class on the panel.
// ─────────────────────────────────────────────────────────────
function buildAccordion(type) {
  const isExc = type === 'exc';
  const panelId = isExc ? 'acc-exc' : 'acc-personal';
  const items   = isExc ? EMPLOYEE_DATA.exceptions : EMPLOYEE_DATA.personalGoals;

  const title   = isExc
    ? '&#9888;&#xFE0E; Exceptions'
    : '&#127919; Personal goals';
  const subtitle = isExc
    ? 'All goals pull from the Goals view. Add an exception here only for approved deviations. Lock a row to prevent accidental edits.'
    : 'Employee-set personal intermediate targets. These appear as the lime-green dotted ring on the radar.';
  const badge   = items.length;
  const openFn  = `toggleAcc('${panelId}')`;
  const lockFn  = isExc ? 'toggleExcLock' : 'togglePgLock';
  const addFn   = isExc ? 'addException' : 'addPersonalGoal';
  const saveCls = isExc ? 'btn-b' : 'btn-save-lime';
  const inpCls  = isExc ? 'exc-inp' : 'exc-inp lime';

  const rows = items.map((item, i) => {
    const locked   = item.locked;
    const lockCls  = locked ? 'locked' : 'unlocked';
    const lockIcon = locked ? '&#128274;' : '&#128275;';
    const dis      = locked ? 'disabled' : '';
    const defLabel = isExc
      ? `default: ${item.defaultGoal}`
      : `goal: ${item.unit}`;
    return `<div class="exc-row" id="${panelId}-row-${i}">
      <div class="exc-hdr">
        <span class="exc-metric">${item.metric}</span>
        <span class="exc-default">${defLabel}</span>
        <button class="exc-lock ${lockCls}"
          onclick="${lockFn}(${i})"
          title="${locked ? 'Unlock to edit' : 'Lock row'}">${lockIcon}</button>
      </div>
      <div class="exc-val-row">
        <input class="${inpCls}" id="${panelId}-inp-${i}"
          value="${item.val !== undefined ? item.val : item.overrideVal}" ${dis}/>
        <span class="exc-unit">${isExc ? 'override goal' : item.unit}</span>
      </div>
      <textarea class="exc-reason" id="${panelId}-txt-${i}" ${dis}
        placeholder="Reason / note...">${isExc ? item.reason : item.note}</textarea>
    </div>`;
  }).join('');

  // Exceptions: show/hide goal ring toggle (red pill)
  const excVisToggle = isExc ? `
    <button class="exc-vis-toggle ${showGoalLines ? 'on' : 'off'}"
      id="exc-vis-btn"
      onclick="event.stopPropagation(); toggleGoalLines()"
      title="${showGoalLines ? 'Hide goal ring' : 'Show goal ring'}">
      ${showGoalLines ? '\u25cf Show' : '\u25cb Hide'}
    </button>` : '';

    // Personal Goals only: show/hide toggle between badge and chevron
  const visToggle = !isExc ? `
    <button class="pg-vis-toggle ${showPersonalGoal ? 'on' : 'off'}"
      id="pg-vis-btn"
      onclick="event.stopPropagation(); togglePersonalGoalVis()"
      title="${showPersonalGoal ? 'Hide personal goal ring' : 'Show personal goal ring'}">
      ${showPersonalGoal ? '● Show' : '○ Hide'}
    </button>` : '';

  return `<div class="acc-panel acc-${type}" id="${panelId}">
    <div class="acc-header" onclick="${openFn}">
      <span class="acc-title">${title}</span>
      <span class="acc-badge">${badge}</span>
      ${excVisToggle}
      ${visToggle}
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="acc-body">
      <p class="acc-sub" style="margin-top:8px;">${subtitle}</p>
      ${rows}
      <div style="display:flex;gap:7px;margin-top:10px;">
        <button class="btn" style="flex:1;font-size:10px;" onclick="${addFn}()">+ Add</button>
        <button class="${saveCls}" style="flex:1;font-size:10px;"
          onclick="${isExc ? 'saveExceptions()' : 'savePersonalGoals()'}">Save</button>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// MEAN/MEDIAN TOGGLE
// ─────────────────────────────────────────────────────────────
function buildMMToggle() {
  return `<div class="mm-row">
    <span class="mm-lbl">Radar reference</span>
    <div class="mm-toggle">
      <button class="mm-btn on" id="mm-mean"   onclick="setMM('mean')">Mean</button>
      <button class="mm-btn"    id="mm-median" onclick="setMM('median')">Median</button>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// INTERACTIVITY
// All mutation functions follow this pattern:
//   1. Flush current DOM input values back into EMPLOYEE_DATA
//   2. Mutate the data
//   3. Re-render only the affected panel (not the whole app)
//   4. Restore open state if the panel was open
// ─────────────────────────────────────────────────────────────

// Toggle accordion open / closed
// Global: whether personal goal ring shows on radar.
// Toggled by the pill button in the Personal Goals accordion header.
let showPersonalGoal = true;

// Global: goal ring (red dashed) visibility on radar.
// Toggled by the red pill button in the Exceptions accordion header.
let showGoalLines = true;

// Toggle goal ring — re-renders only the radar SVG container.
function toggleGoalLines() {
  showGoalLines = !showGoalLines;
  const container = document.getElementById('radar-svg-container');
  if (container) container.innerHTML = buildRadarSVG();
  const btn = document.getElementById('exc-vis-btn');
  if (btn) {
    btn.className = 'exc-vis-toggle ' + (showGoalLines ? 'on' : 'off');
    btn.textContent = showGoalLines ? '\u25cf Show' : '\u25cb Hide';
    btn.title = showGoalLines ? 'Hide goal ring' : 'Show goal ring';
  }
  const redLeg = document.getElementById('leg-red');
  if (redLeg) redLeg.style.opacity = showGoalLines ? '1' : '0.35';
}

// Toggle personal goal ring — re-renders only the SVG, not the whole panel.
function togglePersonalGoalVis() {
  showPersonalGoal = !showPersonalGoal;
  const container = document.getElementById('radar-svg-container');
  if (container) container.innerHTML = buildRadarSVG();
  const btn = document.getElementById('pg-vis-btn');
  if (btn) {
    btn.className = 'pg-vis-toggle ' + (showPersonalGoal ? 'on' : 'off');
    btn.textContent = showPersonalGoal ? '● Show' : '○ Hide';
    btn.title = showPersonalGoal ? 'Hide personal goal ring' : 'Show personal goal ring';
  }
  const limeLeg = document.getElementById('leg-lime');
  if (limeLeg) limeLeg.style.opacity = showPersonalGoal ? '1' : '0.35';
}

function toggleAcc(panelId) {
  document.getElementById(panelId).classList.toggle('open');
}

// ── Flush helpers — read DOM inputs back into EMPLOYEE_DATA ───
// Always call before any re-render so unsaved edits aren't lost.

function flushExcInputs() {
  EMPLOYEE_DATA.exceptions.forEach((exc, i) => {
    const inp = document.getElementById('acc-exc-inp-' + i);
    const txt = document.getElementById('acc-exc-txt-' + i);
    if (inp) exc.overrideVal = inp.value;
    if (txt) exc.reason      = txt.value;
  });
}

function flushPgInputs() {
  EMPLOYEE_DATA.personalGoals.forEach((pg, i) => {
    const inp = document.getElementById('acc-personal-inp-' + i);
    const txt = document.getElementById('acc-personal-txt-' + i);
    if (inp) pg.val  = inp.value;
    if (txt) pg.note = txt.value;
  });
}

// ── Lock / unlock a row ───────────────────────────────────────
function toggleExcLock(i) {
  flushExcInputs();
  EMPLOYEE_DATA.exceptions[i].locked = !EMPLOYEE_DATA.exceptions[i].locked;
  const wasOpen = document.getElementById('acc-exc').classList.contains('open');
  document.getElementById('acc-exc').outerHTML = buildAccordion('exc');
  if (wasOpen) document.getElementById('acc-exc').classList.add('open');
}

function togglePgLock(i) {
  flushPgInputs();
  EMPLOYEE_DATA.personalGoals[i].locked = !EMPLOYEE_DATA.personalGoals[i].locked;
  const wasOpen = document.getElementById('acc-personal').classList.contains('open');
  document.getElementById('acc-personal').outerHTML = buildAccordion('personal');
  if (wasOpen) document.getElementById('acc-personal').classList.add('open');
}

// ── Add a new blank row ───────────────────────────────────────
function addException() {
  flushExcInputs();
  EMPLOYEE_DATA.exceptions.push({
    metric: '', defaultGoal: '—', overrideVal: '', locked: false, reason: ''
  });
  document.getElementById('acc-exc').outerHTML = buildAccordion('exc');
  document.getElementById('acc-exc').classList.add('open');
}

function addPersonalGoal() {
  flushPgInputs();
  EMPLOYEE_DATA.personalGoals.push({
    metric: '', val: '', unit: '', locked: false, note: ''
  });
  document.getElementById('acc-personal').outerHTML = buildAccordion('personal');
  document.getElementById('acc-personal').classList.add('open');
}

// ── Save — flush inputs then POST to your API ─────────────────
// Uncomment and adapt the fetch() calls for production.
function saveExceptions() {
  flushExcInputs();
  console.log('Saving exceptions:', EMPLOYEE_DATA.exceptions);
  // fetch('/api/employee/' + EMPLOYEE_DATA.employee.id + '/exceptions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ exceptions: EMPLOYEE_DATA.exceptions })
  // });
}

function savePersonalGoals() {
  flushPgInputs();
  console.log('Saving personal goals:', EMPLOYEE_DATA.personalGoals);
  // fetch('/api/employee/' + EMPLOYEE_DATA.employee.id + '/personal-goals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ personalGoals: EMPLOYEE_DATA.personalGoals })
  // });
}

// ── Mean / Median toggle ──────────────────────────────────────
// Switches the store-avg reference on the radar between mean and median.
// In production: re-query API with ?ref=median, update radar.axes normVals,
// then call buildRadarSVG() and swap the <svg> element in the DOM.
function setMM(mode) {
  // Update toggle button states
  ['mm-mean','mm-median','rp-mm-mean','rp-mm-median'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('on', id.includes('median') ? mode === 'median' : mode === 'mean');
  });

  // Swap avgNorm on each radar axis
  EMPLOYEE_DATA.radar.axes.forEach(axis => {
    if (mode === 'median' && axis.medianNorm !== undefined) {
      axis._avgNormBackup = axis._avgNormBackup || axis.avgNorm;
      axis.avgNorm = axis.medianNorm;
    } else if (mode === 'mean' && axis._avgNormBackup !== undefined) {
      axis.avgNorm = axis._avgNormBackup;
    }
  });

  // Swap storeAvg on metric cards
  EMPLOYEE_DATA.metrics.forEach(m => {
    if (mode === 'median' && m.storeMedian !== undefined) {
      m._avgBackup = m._avgBackup || m.storeAvg;
      m.storeAvg = m.storeMedian;
    } else if (mode === 'mean' && m._avgBackup !== undefined) {
      m.storeAvg = m._avgBackup;
    }
  });

  // Swap avgVal on stats table
  EMPLOYEE_DATA.statsTable.forEach(r => {
    if (mode === 'median' && r.medianAvgVal !== undefined) {
      r._avgBackup = r._avgBackup || r.avgVal;
      r.avgVal = r.medianAvgVal;
    } else if (mode === 'mean' && r._avgBackup !== undefined) {
      r.avgVal = r._avgBackup;
    }
  });

  // Re-render radar SVG
  const container = document.getElementById('radar-svg-container');
  if (container) container.innerHTML = buildRadarSVG();

  // Re-render stats table tbody
  document.querySelectorAll('.stats-tbl tbody').forEach(tbody => {
    tbody.innerHTML = EMPLOYEE_DATA.statsTable.map(r => {
      const badge = r.status === 'hit'
        ? `<span class="badge-hit">&#10003; ${r.gap}</span>`
        : `<span class="badge-miss">&#10007; ${r.gap}</span>`;
      return `<tr>
        <td>${r.metric}</td>
        <td><strong>${r.empVal}</strong></td>
        <td style="color:#6D28D9;font-weight:600;">${r.avgVal}</td>
        <td style="color:#B91C1C;font-weight:600;">${r.goalVal}</td>
        <td>${badge}</td>
      </tr>`;
    }).join('');
  });

  // Re-render metric cards
  document.querySelectorAll('.metric-cards').forEach(mc => {
    mc.innerHTML = EMPLOYEE_DATA.metrics.map(m => {
      const cls     = m.aboveMean ? 'above' : 'below';
      const indCls  = m.aboveMean ? 'up' : 'dn';
      const indIcon = m.aboveMean ? '&#8593; avg' : '&#8595; avg';
      const goalCls = m.goalMet ? 'hit' : 'miss';
      const goalIco = m.goalMet ? '&#10003;' : '&#10007;';
      const goalTxt = m.goalMet ? 'Goal met' : 'Goal missed';
      return `<div class="mc ${cls}">
        <div class="mc-lbl">${m.label} (${EMPLOYEE_DATA.period.label})</div>
        <div class="mc-vrow">
          <div class="mc-val">${m.empVal}</div>
          <span class="mc-ind ${indCls}">${indIcon}</span>
        </div>
        <div class="mc-avg">Store ${mode === 'median' ? 'median' : 'avg'}: ${m.storeAvg}</div>
        <div class="mc-goal ${goalCls}">
          <span class="mc-goal-ico">${goalIco}</span>
          <span class="mc-goal-txt">${goalTxt}</span>
          <span class="mc-goal-gap">${m.gap}</span>
        </div>
      </div>`;
    }).join('');
  });

  // Update legend label
  const lbl = document.getElementById('leg-mean-label');
  if (lbl) lbl.textContent = mode === 'median' ? 'Store median' : 'Store avg';
}

// ─────────────────────────────────────────────────────────────
// FULL RENDER
// ─────────────────────────────────────────────────────────────


function setPeriod(p) { if(p==='rec'){isRecUpload=true;currentPeriod='2w';}else{isRecUpload=false;currentPeriod=p;} renderApp(); }

function renderApp() {
  const emp = EMPLOYEE_DATA.employee;
  const per = EMPLOYEE_DATA.period;
  const firstName = emp.name.split(',')[1].trim();

  document.getElementById('page-content').innerHTML = `
    <div class="topbar">
            <div class="tb-title">${emp.name} &mdash; Radar</div>
            <div class="tb-sep"></div>
            <div class="pbar">
              <div class="pnav">&#8249;</div>
              <div class="pnav">&#8250;</div>
              <span class="pdate">${per.from} &ndash; ${per.to} (${per.label})</span>
              <div class="ppills">
                ${window.GS.buildPills(currentPeriod, 'EmployeeRadarPage.setPeriod', isRecUpload)}
              </div>
            </div>
            <div class="tb-r">
              <div class="togs">
                <button class="tog">Bar</button>
                <button class="tog">Line</button>
                <button class="tog on">Radar</button>
              </div>
            </div>
          </div>

          <div class="content">
            ${buildMetricCards()}

            <div class="radar-layout">
              <div class="cp">
                <div class="cp-title">Performance radar &middot; ${per.label}</div>
                <div class="cp-sub">Normalised &middot; outer red ring = goal &middot; blue = ${firstName} &middot; purple = store avg &middot; lime dotted = personal goal</div>
                <div class="radar-legend">
                  <div class="rl-item">
                    <div class="rl-dot" style="background:rgba(22,82,232,.5);border:1.5px solid #1652E8;"></div>
                    <span style="color:#1652E8;">${firstName}</span>
                  </div>
                  <div class="rl-item">
                    <div class="rl-dot" style="background:rgba(109,40,217,.3);border:1.5px solid #6D28D9;"></div>
                    <span id="leg-mean-label" style="color:#6D28D9;">Store avg</span>
                  </div>
                  <div class="rl-item" id="leg-red">
                    <div class="rl-dot" style="background:rgba(185,28,28,.08);border:1.5px dashed #B91C1C;"></div>
                    <span style="color:#B91C1C;">Goal</span>
                  </div>
                  <div class="rl-item" id="leg-lime">
                    <div class="rl-dot" style="background:rgba(101,163,13,.15);border:1.5px dashed #65A30D;"></div>
                    <span style="color:#65A30D;">Personal goal</span>
                  </div>
                </div>
                <div id="radar-svg-container">${buildRadarSVG()}</div>
              </div>

              <div class="right-panel">
                ${buildStatsTable()}
                ${buildAccordion('exc')}
                ${buildAccordion('personal')}
                ${buildMMToggle()}
              </div>
            </div>
          </div>`;
}

renderApp();



  window.togglePersonalGoal = typeof togglePersonalGoal !== 'undefined' ? togglePersonalGoal : function(){};
  window.toggleGoalLines = typeof toggleGoalLines !== 'undefined' ? toggleGoalLines : function(){};
  window.toggleAcc = typeof toggleAcc !== 'undefined' ? toggleAcc : function(){};
  window.setMM = typeof setMM !== 'undefined' ? setMM : function(){};
  window.EmployeeRadarPage.setPeriod = setPeriod;

  return {
    init: function(params) {
      renderApp();
    },
    getData: function() { return DATA; },
    renderApp: renderApp,
    setPeriod: setPeriod
  };
})();

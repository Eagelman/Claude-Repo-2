window.EmployeeBar = (function() {
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
  "days": 14
},
  "metrics": [
    {
      "key": "sp_pct",
      "label": "SP %",
      "empVal": "2.02%",
      "storeAvg": "1.84%", "storeMedian": "1.79%",
      "goal": "2.00%",
      "aboveMean": true,
      "goalMet": true,
      "gap": "+0.02%"
    },
    {
      "key": "cust",
      "label": "Cust #",
      "empVal": "44",
      "storeAvg": "38", "storeMedian": "37",
      "goal": "40",
      "aboveMean": true,
      "goalMet": true,
      "gap": "+4"
    },
    {
      "key": "sp_d",
      "label": "SP $",
      "empVal": "$235",
      "storeAvg": "$199", "storeMedian": "$193",
      "goal": "$250",
      "aboveMean": true,
      "goalMet": false,
      "gap": "-$15"
    },
    {
      "key": "pts_wk",
      "label": "Pts/wk",
      "empVal": "11.2",
      "storeAvg": "8.4", "storeMedian": "8.1",
      "goal": "7",
      "aboveMean": true,
      "goalMet": true,
      "gap": "+4.2"
    }
  ],
  "charts": {
  "sp_pct": {
    "label": "SP %",
    "values": [
      null,
      2.1,
      1.88,
      2.05,
      1.95,
      null,
      2.12,
      1.98,
      2.07,
      null,
      1.91,
      1.85,
      null,
      2.03
    ],
    "yMin": 1.4,
    "yMax": 2.4,
    "goalVal": 2.0,
    "meanVal": 1.84,
        "medianVal": 1.79,
    "personalGoalVal": 1.7,
    "yTicks": [
      "2.40",
      "2.20",
      "2.00",
      "1.80",
      "1.60",
      "1.40"
    ]
  },
  "cust": {
    "label": "Cust #",
    "values": [
      null,
      44,
      38,
      46,
      41,
      null,
      45,
      40,
      47,
      null,
      36,
      39,
      null,
      43
    ],
    "yMin": 28,
    "yMax": 55,
    "goalVal": 40,
    "meanVal": 38,
    "medianVal": 37,
    "personalGoalVal": 35,
    "yTicks": [
      "55",
      "49",
      "43",
      "37",
      "31",
      "28"
    ]
  },
  "sp_d": {
    "label": "SP $",
    "values": [
      null,
      245,
      210,
      238,
      222,
      null,
      251,
      228,
      242,
      null,
      205,
      218,
      null,
      235
    ],
    "yMin": 170,
    "yMax": 280,
    "goalVal": 250,
    "meanVal": 199,
    "medianVal": 193,
    "personalGoalVal": 188,
    "yTicks": [
      "$280",
      "$258",
      "$236",
      "$214",
      "$192",
      "$170"
    ]
  },
  "sp_n": {
    "label": "SP #",
    "values": [
      null,
      6.2,
      5.1,
      5.8,
      5.5,
      null,
      6.0,
      5.3,
      5.9,
      null,
      4.8,
      5.2,
      null,
      5.6
    ],
    "yMin": 3.0,
    "yMax": 7.5,
    "goalVal": 6.0,
    "meanVal": 4.9,
    "medianVal": 4.7,
    "personalGoalVal": 4.8,
    "yTicks": [
      "7.5",
      "6.6",
      "5.7",
      "4.8",
      "3.9",
      "3.0"
    ]
  }
},
  "statsTable": [
    {
      "metric": "SP %",
      "empVal": "2.02%",
      "avgVal": "1.84%", "medianAvgVal": "1.79%",
      "goalVal": "2.00%",
      "status": "hit",
      "gap": "+0.02%"
    },
    {
      "metric": "SP #",
      "empVal": "5.7",
      "avgVal": "4.9", "medianAvgVal": "4.7",
      "goalVal": "6",
      "status": "miss",
      "gap": "-0.3"
    },
    {
      "metric": "SP $",
      "empVal": "$235",
      "avgVal": "$199", "medianAvgVal": "$193",
      "goalVal": "$250",
      "status": "miss",
      "gap": "-$15"
    },
    {
      "metric": "Cust #",
      "empVal": "44",
      "avgVal": "38", "medianAvgVal": "37",
      "goalVal": "40",
      "status": "hit",
      "gap": "+4"
    },
    {
      "metric": "Pts/wk",
      "empVal": "11.2",
      "avgVal": "8.4", "medianAvgVal": "8.1",
      "goalVal": "7",
      "status": "hit",
      "gap": "+4.2"
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

// Days-off indices (0-based, 14-day array) — used by SVG builders for tick styling
const DAYS_OFF = [0, 5, 9, 12];

// ── Global: personal goal line visibility ─────────────────────
// Toggled by the button in the Personal Goals accordion header.
// When false, personalGoalVal lines are hidden across all 4 charts.
let showPersonalGoal = true;
let currentMode = 'mean'; // tracks mean/median for chart subtitles

// Global: goal line (red dotted) visibility across all 4 charts.
// Toggled by the button in the Exceptions accordion header.
let showGoalLines = true;

// Toggle goal lines across all 4 charts — re-renders only #chart-grid.
function toggleGoalLines() {
  showGoalLines = !showGoalLines;
  const keys = Object.keys(EMPLOYEE_DATA.charts);
  document.getElementById('chart-grid').innerHTML =
    keys.map(k => buildChartCard(k, CHART_TYPE + k, CHART_TYPE)).join('');
  const btn = document.getElementById('exc-vis-btn');
  if (btn) {
    btn.className = 'exc-vis-toggle ' + (showGoalLines ? 'on' : 'off');
    btn.textContent = showGoalLines ? '\u25cf Show' : '\u25cb Hide';
    btn.title = showGoalLines ? 'Hide goal lines' : 'Show goal lines';
  }
  const redLeg = document.getElementById('leg-red');
  if (redLeg) redLeg.style.opacity = showGoalLines ? '1' : '0.35';
}

// ── Geometry ──────────────────────────────────────────────────
function toY(val, yMin, yMax) {
  return (1 - (val - yMin) / (yMax - yMin)) * 100;
}
function barXCenters(n) {
  return Array.from({length: n}, (_, i) => (i + 0.5) / n * 100);
}
function lineXPositions(n) {
  return Array.from({length: n}, (_, i) => n === 1 ? 50 : i / (n - 1) * 100);
}

// ── Bar chart SVG ─────────────────────────────────────────────
// Z-order: gridlines → axis → bars → x-rule →
//   goal (red dotted) → mean (gold) → personal goal (lime dotted, optional) → ticks
// ── Bar chart SVG ─────────────────────────────────────────────
// values array: null = day off (blank space), number = working day.
// All 14 slots are evenly spaced. Off-day slots show no bar.
// Reference lines drawn AFTER bars so they sit on top.
function buildBarSVG(chartKey, uid) {
  const c  = EMPLOYEE_DATA.charts[chartKey];
  const n  = c.values.length;   // always 14
  const bw = (100 / n) * 0.75;  // bar width = 75% of column slot

  const goalY = toY(c.goalVal, c.yMin, c.yMax).toFixed(2);
  const meanY = toY(c.meanVal, c.yMin, c.yMax).toFixed(2);

  const grids = [0,20,40,60,80,100].map(v =>
    `<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="#CBD5E1" stroke-width="0.4" opacity="0.4"/>`
  ).join('');
  const clip  = `<clipPath id="c${uid}"><rect x="0" y="0" width="100" height="100"/></clipPath>`;
  const yrule = `<line x1="0" y1="0" x2="0" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
  const xrule = `<line x1="0" y1="100" x2="100" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;

  // Bars — only rendered for non-null values; null slots are blank space
  const bars = c.values.map((val, i) => {
    const xCenter = (i + 0.5) / n * 100;
    const bx = (xCenter - bw / 2).toFixed(2);
    if (val === null || val === undefined) {
      return ''; // Day off — blank space, no bar and no marker
    }
    const by = toY(val, c.yMin, c.yMax).toFixed(2);
    const bh = (100 - parseFloat(by)).toFixed(2);
    return `<rect x="${bx}" y="${by}" width="${bw.toFixed(2)}" height="${bh}"
      fill="#2563EB" opacity="0.85" clip-path="url(#c${uid})"/>`;
  }).join('');

  // Reference lines — always drawn AFTER data
  const goalLine = showGoalLines ? `<line x1="0" y1="${goalY}" x2="100" y2="${goalY}"
    stroke="#B91C1C" stroke-width="1.2" stroke-dasharray="2.5,1.5"
    clip-path="url(#c${uid})"/>` : '';
  const meanLine = `<line x1="0" y1="${meanY}" x2="100" y2="${meanY}"
    stroke="#D97706" stroke-width="1.4" opacity="0.95"
    clip-path="url(#c${uid})"/>`;

  // Personal goal line
  let pgLine = '';
  if (showPersonalGoal && c.personalGoalVal !== undefined) {
    const pgY = toY(c.personalGoalVal, c.yMin, c.yMax).toFixed(2);
    pgLine = `<line x1="0" y1="${pgY}" x2="100" y2="${pgY}"
      stroke="#65A30D" stroke-width="1.0" stroke-dasharray="3,3"
      clip-path="url(#c${uid})"/>`;
  }

  // Uniform ticks at each slot center
  const ticks = c.values.map((_, i) => {
    const x = ((i + 0.5) / n * 100).toFixed(2);
    return `<line x1="${x}" y1="100" x2="${x}" y2="104" stroke="#94A3B8" stroke-width="0.5"/>`;
  }).join('');

  return `<svg width="100%" height="120" viewBox="0 0 100 108"
    preserveAspectRatio="none" style="display:block;">
    <defs>${clip}</defs>
    ${grids}${yrule}${bars}${xrule}${goalLine}${meanLine}${pgLine}${ticks}
  </svg>`;
}

function buildLineSVG(chartKey, uid) {
  const c  = EMPLOYEE_DATA.charts[chartKey];
  const n  = c.values.length;
  const xs = lineXPositions(n);
  const ys = c.values.map(v => toY(v, c.yMin, c.yMax));

  const goalY = toY(c.goalVal, c.yMin, c.yMax).toFixed(2);
  const meanY = toY(c.meanVal, c.yMin, c.yMax).toFixed(2);

  const pts  = xs.map((x, i) => `${x.toFixed(2)},${ys[i].toFixed(2)}`).join(' ');
  const fill = pts + ` 100,100 0,100`;

  const grids = [0,20,40,60,80,100].map(v =>
    `<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="#CBD5E1" stroke-width="0.4" opacity="0.45"/>`
  ).join('');
  const clip  = `<clipPath id="c${uid}"><rect x="0" y="0" width="100" height="100"/></clipPath>`;
  const grad  = `<linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#2563EB" stop-opacity="0.20"/>
    <stop offset="80%"  stop-color="#2563EB" stop-opacity="0.03"/>
    <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
  </linearGradient>`;
  const yrule = `<line x1="0" y1="0" x2="0" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
  const xrule = `<line x1="0" y1="100" x2="100" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;

  const bfill = `<polygon points="${fill}" fill="url(#g${uid})" clip-path="url(#c${uid})"/>`;
  const bline = `<polyline points="${pts}" fill="none" stroke="#2563EB"
    stroke-width="1.0" stroke-linejoin="round" stroke-linecap="round"
    clip-path="url(#c${uid})"/>`;

  const goalLine = `<line x1="0" y1="${goalY}" x2="100" y2="${goalY}"
    stroke="#B91C1C" stroke-width="1.2" stroke-dasharray="2.5,1.5"
    clip-path="url(#c${uid})"/>`;
  const meanLine = `<line x1="0" y1="${meanY}" x2="100" y2="${meanY}"
    stroke="#D97706" stroke-width="1.4" opacity="0.95"
    clip-path="url(#c${uid})"/>`;

  // Personal goal line — lime dotted, thinner (stroke-width 1.0)
  let pgLine = '';
  if (showPersonalGoal && c.personalGoalVal !== undefined) {
    const pgY = toY(c.personalGoalVal, c.yMin, c.yMax).toFixed(2);
    pgLine = `<line x1="0" y1="${pgY}" x2="100" y2="${pgY}"
      stroke="#65A30D" stroke-width="1.0" stroke-dasharray="3,3"
      clip-path="url(#c${uid})"/>`;
  }

  const ticks = xs.map(x =>
    `<line x1="${x.toFixed(2)}" y1="100" x2="${x.toFixed(2)}" y2="104"
      stroke="#94A3B8" stroke-width="0.5"/>`
  ).join('');

  return `<svg width="100%" height="120" viewBox="0 0 100 106"
    preserveAspectRatio="none" style="display:block;">
    <defs>${grad}${clip}</defs>
    ${grids}${yrule}${bfill}${bline}${xrule}${goalLine}${meanLine}${pgLine}${ticks}
  </svg>`;
}

// ── Y-axis label column ───────────────────────────────────────
// HTML spans — never inside SVG (avoids preserveAspectRatio stretching)
function buildYAxis(chartKey) {
  const ticks = EMPLOYEE_DATA.charts[chartKey].yTicks;
  const n = ticks.length;
  return '<div class="y-col">' + ticks.map((label, i) => {
    const topPct = (i / (n - 1)) * 100;
    return `<span style="top:${topPct.toFixed(1)}%">${label}</span>`;
  }).join('') + '</div>';
}

// ── Individual chart card ─────────────────────────────────────
function buildChartCard(chartKey, uid, chartType) {
  const c   = EMPLOYEE_DATA.charts[chartKey];
  const svg = chartType === 'bar' ? buildBarSVG(chartKey, uid) : buildLineSVG(chartKey, uid);
  return `<div class="chart-card">
    <div class="cc-title">${c.label} · ${EMPLOYEE_DATA.period.label}</div>
    <div class="cc-sub">Goal: ${c.goalVal} · ${currentMode === 'median' ? 'Median' : 'Mean'}: ${c.meanVal}${
      c.personalGoalVal !== undefined && showPersonalGoal
        ? ' · Personal: ' + c.personalGoalVal
        : ''
    }</div>
    <div style="display:flex;align-items:flex-start;gap:0;">
      ${buildYAxis(chartKey)}
      <div style="flex:1;min-width:0;">
        ${svg}
        <div class="chart-date">Mar 1 – Mar 14, 2026</div>
      </div>
    </div>
  </div>`;
}

// ── Accordion builder — Exceptions and Personal Goals ─────────
// Personal Goals accordion has an extra toggle button in the header
// that shows/hides the lime line across all 4 charts.
function buildAccordion(type) {
  const isExc   = type === 'exc';
  const panelId = isExc ? 'acc-exc' : 'acc-personal';
  const items   = isExc ? EMPLOYEE_DATA.exceptions : EMPLOYEE_DATA.personalGoals;
  const title   = isExc ? '⚠ Exceptions' : '🎯 Personal goals';
  const subtitle = isExc
    ? 'All goals pull from the Goals view. Add exceptions here for approved deviations only. Lock a row to prevent accidental edits.'
    : 'Employee-set personal intermediate targets shown as the lime dotted line on all charts.';
  const lockFn  = isExc ? 'toggleExcLock' : 'togglePgLock';
  const addFn   = isExc ? 'addException'  : 'addPersonalGoal';
  const saveFn  = isExc ? 'saveExceptions' : 'savePersonalGoals';
  const saveCls = isExc ? 'btn-b' : 'btn-lime';
  const inpCls  = isExc ? 'exc-inp' : 'exc-inp lime';

  const rows = items.map((item, i) => {
    const locked   = item.locked;
    const lockCls  = locked ? 'locked' : 'unlocked';
    const lockIcon = locked ? '🔒' : '🔓';
    const dis      = locked ? 'disabled' : '';
    const defLabel = isExc ? `default: ${item.defaultGoal}` : item.unit;
    const val      = isExc ? item.overrideVal : item.val;
    const note     = isExc ? item.reason : item.note;
    return `<div class="exc-row">
      <div class="exc-hdr">
        <span class="exc-metric">${item.metric}</span>
        <span class="exc-default">${defLabel}</span>
        <button class="exc-lock ${lockCls}" onclick="${lockFn}(${i})"
          title="${locked ? 'Unlock to edit' : 'Lock row'}">${lockIcon}</button>
      </div>
      <div class="exc-val-row">
        <input class="${inpCls}" id="${panelId}-inp-${i}"
          value="${val}" ${dis}/>
        <span class="exc-unit">${isExc ? 'override goal' : item.unit}</span>
      </div>
      <textarea class="exc-reason" id="${panelId}-txt-${i}"
        ${dis} placeholder="Reason / note...">${note}</textarea>
    </div>`;
  }).join('');

  // Personal Goals accordion gets an extra visibility toggle in the header.
    // Exceptions: show/hide goal lines toggle (red pill — same pattern as personal goals toggle)
  const excVisToggle = isExc ? `
    <button class="exc-vis-toggle ${showGoalLines ? 'on' : 'off'}"
      id="exc-vis-btn"
      onclick="event.stopPropagation(); toggleGoalLines()"
      title="${showGoalLines ? 'Hide goal lines' : 'Show goal lines'}">
      ${showGoalLines ? '\u25cf Show' : '\u25cb Hide'}
    </button>` : '';

  // Sits between the badge and the chevron so it's always visible even when collapsed.
  const visToggle = !isExc ? `
    <button class="pg-vis-toggle ${showPersonalGoal ? 'on' : 'off'}"
      id="pg-vis-btn"
      onclick="event.stopPropagation(); togglePersonalGoalVis()"
      title="${showPersonalGoal ? 'Hide personal goal line' : 'Show personal goal line'}">
      ${showPersonalGoal ? '● Show' : '○ Hide'}
    </button>` : '';

  return `<div class="acc-panel acc-${type}" id="${panelId}">
    <div class="acc-header" onclick="toggleAcc('${panelId}')">
      <span class="acc-title">${title}</span>
      <span class="acc-badge">${items.length}</span>
      ${excVisToggle}
      ${visToggle}
      <span class="acc-chevron">▼</span>
    </div>
    <div class="acc-body">
      <p class="acc-sub">${subtitle}</p>
      ${rows}
      <div style="display:flex;gap:7px;margin-top:10px;">
        <button class="btn" style="flex:1;font-size:10px;" onclick="${addFn}()">+ Add</button>
        <button class="${saveCls}" style="flex:1;font-size:10px;" onclick="${saveFn}()">Save</button>
      </div>
    </div>
  </div>`;
}

// ── Mean/Median toggle ────────────────────────────────────────
function buildMMToggle() {
  return `<div class="mm-row">
    <span class="mm-lbl">Reference data</span>
    <div class="mm-toggle">
      <button class="mm-btn on" id="mm-mean"   onclick="setMM('mean')">Mean</button>
      <button class="mm-btn"    id="mm-median" onclick="setMM('median')">Median</button>
    </div>
  </div>`;
}

// ── Interactivity ─────────────────────────────────────────────

// Toggle accordion open/closed
function toggleAcc(panelId) {
  document.getElementById(panelId).classList.toggle('open');
}

// Toggle personal goal line visibility across all 4 charts
// Re-renders only the chart grid (fast) and the accordion header button
function togglePersonalGoalVis() {
  showPersonalGoal = !showPersonalGoal;
  // Re-render all chart cards
  const keys = Object.keys(EMPLOYEE_DATA.charts);
  document.getElementById('chart-grid').innerHTML =
    keys.map(k => buildChartCard(k, CHART_TYPE + k, CHART_TYPE)).join('');
  // Update the toggle button state without re-rendering the whole accordion
  const btn = document.getElementById('pg-vis-btn');
  if (btn) {
    btn.className = 'pg-vis-toggle ' + (showPersonalGoal ? 'on' : 'off');
    btn.textContent = showPersonalGoal ? '● Show' : '○ Hide';
    btn.title = showPersonalGoal ? 'Hide personal goal line' : 'Show personal goal line';
  }
  // Also update legend lime item opacity to reflect state
  const limeLeg = document.getElementById('leg-lime');
  if (limeLeg) limeLeg.style.opacity = showPersonalGoal ? '1' : '0.35';
}

// Flush unsaved DOM inputs back into EMPLOYEE_DATA before any re-render
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

// Lock/unlock — flush first to preserve unsaved edits
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

// Add a new blank row — flush first, re-render open
function addException() {
  flushExcInputs();
  EMPLOYEE_DATA.exceptions.push({ metric:'', defaultGoal:'—', overrideVal:'', locked:false, reason:'' });
  document.getElementById('acc-exc').outerHTML = buildAccordion('exc');
  document.getElementById('acc-exc').classList.add('open');
}
function addPersonalGoal() {
  flushPgInputs();
  EMPLOYEE_DATA.personalGoals.push({ metric:'', val:'', unit:'', locked:false, note:'' });
  document.getElementById('acc-personal').outerHTML = buildAccordion('personal');
  document.getElementById('acc-personal').classList.add('open');
}

// Save — flush inputs then POST to your API (uncomment fetch for production)
function saveExceptions() {
  flushExcInputs();
  console.log('Saving exceptions:', EMPLOYEE_DATA.exceptions);
  // fetch('/api/employee/' + EMPLOYEE_DATA.employee.id + '/exceptions', {
  //   method:'POST', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ exceptions: EMPLOYEE_DATA.exceptions })
  // });
}
function savePersonalGoals() {
  flushPgInputs();
  console.log('Saving personal goals:', EMPLOYEE_DATA.personalGoals);
  // fetch('/api/employee/' + EMPLOYEE_DATA.employee.id + '/personal-goals', {
  //   method:'POST', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ personalGoals: EMPLOYEE_DATA.personalGoals })
  // });
}

// Mean/Median toggle
// Production: re-query API ?ref=median, update charts[*].meanVal, call renderApp()
function setMM(mode) {
  currentMode = mode; // track for chart subtitles
  // Update toggle button states
  ['mm-mean','mm-median','rp-mm-mean','rp-mm-median'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('on', id.includes('median') ? mode === 'median' : mode === 'mean');
  });

  // Swap meanVal on each chart to median/mean so reference line moves
  Object.keys(EMPLOYEE_DATA.charts).forEach(key => {
    const ch = EMPLOYEE_DATA.charts[key];
    if (mode === 'median' && ch.medianVal !== undefined) {
      ch._meanValBackup = ch._meanValBackup || ch.meanVal;
      ch.meanVal = ch.medianVal;
    } else if (mode === 'mean' && ch._meanValBackup !== undefined) {
      ch.meanVal = ch._meanValBackup;
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

  // Swap avgVal on stats table rows
  EMPLOYEE_DATA.statsTable.forEach(r => {
    if (mode === 'median' && r.medianAvgVal !== undefined) {
      r._avgBackup = r._avgBackup || r.avgVal;
      r.avgVal = r.medianAvgVal;
    } else if (mode === 'mean' && r._avgBackup !== undefined) {
      r.avgVal = r._avgBackup;
    }
  });

  // Re-render charts and update stats table
  const keys = Object.keys(EMPLOYEE_DATA.charts);
  document.getElementById('chart-grid').innerHTML =
    keys.map(k => buildChartCard(k, CHART_TYPE + k, CHART_TYPE)).join('');

  // Re-render stats table (it's static HTML — replace innerHTML of its parent)
  const statsMounts = document.querySelectorAll('.stats-tbl tbody');
  statsMounts.forEach(tbody => {
    const firstName = EMPLOYEE_DATA.employee.name.split(',')[1].trim();
    tbody.innerHTML = EMPLOYEE_DATA.statsTable.map(r => {
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
  });

  // Re-render metric summary cards
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
  if (lbl) lbl.textContent = mode === 'median' ? 'Store median' : 'Store mean';
}


// ── Full render ────────────────────────────────────────────
// chartType is fixed per page. Only #chart-grid needs to rebuild on data refresh.
const CHART_TYPE = 'bar';



function renderApp() {
  const emp = EMPLOYEE_DATA.employee;
  const per = EMPLOYEE_DATA.period;
  const firstName = emp.name.split(',')[1]?.trim() || emp.name;
  const keys = Object.keys(EMPLOYEE_DATA.charts);
  const refLabel = currentMode === 'median' ? 'Store median' : 'Store mean';

  document.getElementById('page-content').innerHTML = `
    <div class="topbar">
      <div class="tb-title">${emp.name} &mdash; Bar chart</div>
      <div class="tb-sep"></div>
      <div class="pbar">
        <div class="pnav">&#8249;</div><div class="pnav">&#8250;</div>
        <span class="pdate">${per.from} &ndash; ${per.to} (${per.label})</span>
        <div class="ppills">
          <button class="pp rec">Rec.Upload</button><div class="pdiv"></div>
          <button class="pp">3d</button><button class="pp">5d</button><div class="pdiv"></div>
          <button class="pp">1w</button><button class="pp on">2w</button>
          <button class="pp">4w</button><button class="pp">8w</button>
          <button class="pp">12w</button><button class="pp">18w</button>
          <button class="pp">26w</button>
        </div>
      </div>
      <div class="tb-r">
        <div class="togs">
          <button class="tog on">Bar</button>
          <button class="tog">Line</button>
          <button class="tog">Radar</button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="legend-bar">
        <span class="leg-sec">Chart</span>
        <div class="leg-item"><div style="width:14px;height:12px;background:#2563EB;flex-shrink:0;opacity:0.85;"></div><span class="leg-label blue">Daily values</span></div>
        <div class="leg-sep"></div>
        <span class="leg-sec">References</span>
        <div class="leg-item" id="leg-red">
          <div style="width:20px;border-top:2.5px dotted #B91C1C;flex-shrink:0;"></div>
          <span class="leg-label red">Goal</span>
        </div>
        <div class="leg-item">
          <div style="width:20px;height:2px;background:#D97706;flex-shrink:0;"></div>
          <span class="leg-label gold" id="leg-mean-label">${refLabel}</span>
        </div>
        <div class="leg-item" id="leg-lime">
          <div style="width:20px;border-top:2px dashed #65A30D;flex-shrink:0;"></div>
          <span class="leg-label lime">Personal goal</span>
        </div>
        <span class="leg-note">Toggle personal goal line in the Personal goals panel</span>
      </div>
      ${buildMetricCards()}
      <div class="chart-layout">
        <div class="cp">
          <div class="cp-title">${emp.name} &mdash; ${per.label} (${per.from} &ndash; ${per.to})</div>
          <div class="cp-sub">Blue = daily values &middot; Red dotted = goal &middot; Gold = store mean &middot; Lime dotted = personal goal</div>
          <div class="chart-grid" id="chart-grid">
            ${keys.map(k => buildChartCard(k, CHART_TYPE + k, CHART_TYPE)).join('')}
          </div>
        </div>
        <div class="right-panel">
          <div class="cp">
            <div class="cp-title">${per.label} stats vs goal</div>
            ${buildStatsTable()}
          </div>
          <div id="acc-exc-mount">${buildAccordion('exc')}</div>
          <div id="acc-personal-mount">${buildAccordion('personal')}</div>
          <div class="mm-row">
            <span class="mm-lbl">Reference data</span>
            <div class="mm-toggle">
              <button class="mm-btn ${currentMode==='mean'?'on':''}" id="rp-mm-mean" onclick="setMM('mean')">Mean</button>
              <button class="mm-btn ${currentMode==='median'?'on':''}" id="rp-mm-median" onclick="setMM('median')">Median</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

renderApp();

// Mount accordion panels into placeholder divs





  window.togglePersonalGoal = togglePersonalGoal;
  window.toggleGoalLines = toggleGoalLines;
  window.toggleAcc = toggleAcc;
  window.setMM = setMM;

  return {
    init: function(params) {
      renderApp();
    },
    getData: function() { return DATA; },
    renderApp: renderApp
  };
})();

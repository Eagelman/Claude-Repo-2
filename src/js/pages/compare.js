window.ComparePage = (function() {
  let DATA = {
  "store": {
    "id": 141,
    "name": "Store 141"
  },
  "period": {
    "label": "2 weeks",
    "from": "Mar 1, 2026",
    "to": "Mar 14, 2026",
    "days": 14
  },
  "activeMetric": "sp_pct",
  "goals": {
    "sp_pct": 2.0,
    "sp_n": 6.0,
    "sp_d": 250,
    "cust": 40,
    "pts_wk": 7.0
  },
  "storeMean": {
    "sp_pct": 1.84,
    "sp_n": 4.9,
    "sp_d": 199,
    "cust": 38,
    "pts_wk": 8.4
  },
  "storeMedian": {
    "sp_pct": 1.79,
    "sp_n": 4.7,
    "sp_d": 193,
    "cust": 37,
    "pts_wk": 8.1
  },
  "metricDefs": [
    {
      "key": "sp_pct",
      "label": "SP %",
      "fmt": "pct"
    },
    {
      "key": "sp_n",
      "label": "SP #",
      "fmt": "dec1"
    },
    {
      "key": "sp_d",
      "label": "SP $",
      "fmt": "dollar"
    },
    {
      "key": "cust",
      "label": "Cust #",
      "fmt": "int"
    },
    {
      "key": "pts_wk",
      "label": "Pts/wk",
      "fmt": "dec1"
    }
  ],
  "employees": [
    {
      "id": 1,
      "name": "Smith, John",
      "initials": "SJ",
      "isSelected": true,
      "sp_pct": 1.97,
      "sp_n": 5.4,
      "sp_d": 228,
      "cust": 42,
      "pts_wk": 10.4
    },
    {
      "id": 2,
      "name": "Chen, Amy",
      "initials": "AC",
      "isSelected": false,
      "sp_pct": 2.31,
      "sp_n": 6.8,
      "sp_d": 267,
      "cust": 45,
      "pts_wk": 12.1
    },
    {
      "id": 3,
      "name": "Jones, Lisa",
      "initials": "LJ",
      "isSelected": false,
      "sp_pct": 1.62,
      "sp_n": 4.1,
      "sp_d": 174,
      "cust": 33,
      "pts_wk": 6.8
    },
    {
      "id": 4,
      "name": "Park, David",
      "initials": "DP",
      "isSelected": false,
      "sp_pct": 2.08,
      "sp_n": 5.9,
      "sp_d": 241,
      "cust": 41,
      "pts_wk": 9.2
    },
    {
      "id": 5,
      "name": "Torres, Maria",
      "initials": "MT",
      "isSelected": false,
      "sp_pct": 1.44,
      "sp_n": 3.7,
      "sp_d": 158,
      "cust": 29,
      "pts_wk": 5.3
    },
    {
      "id": 6,
      "name": "Nguyen, Kevin",
      "initials": "KN",
      "isSelected": false,
      "sp_pct": 2.19,
      "sp_n": 6.3,
      "sp_d": 255,
      "cust": 44,
      "pts_wk": 11.0
    },
    {
      "id": 7,
      "name": "Brown, Sarah",
      "initials": "SB",
      "isSelected": false,
      "sp_pct": 1.78,
      "sp_n": 4.6,
      "sp_d": 193,
      "cust": 37,
      "pts_wk": 7.9
    },
    {
      "id": 8,
      "name": "Kim, James",
      "initials": "JK",
      "isSelected": false,
      "sp_pct": 1.91,
      "sp_n": 5.2,
      "sp_d": 215,
      "cust": 40,
      "pts_wk": 8.7
    },
    {
      "id": 9,
      "name": "Patel, Priya",
      "initials": "PP",
      "isSelected": false,
      "sp_pct": 2.44,
      "sp_n": 7.2,
      "sp_d": 288,
      "cust": 48,
      "pts_wk": 13.6
    },
    {
      "id": 10,
      "name": "Wilson, Tom",
      "initials": "WT",
      "isSelected": false,
      "sp_pct": 1.55,
      "sp_n": 3.9,
      "sp_d": 166,
      "cust": 31,
      "pts_wk": 5.9
    },
    {
      "id": 11,
      "name": "Davis, Rachel",
      "initials": "RD",
      "isSelected": false,
      "sp_pct": 2.02,
      "sp_n": 5.7,
      "sp_d": 234,
      "cust": 43,
      "pts_wk": 9.8
    },
    {
      "id": 12,
      "name": "Lee, Michael",
      "initials": "ML",
      "isSelected": false,
      "sp_pct": 1.7,
      "sp_n": 4.4,
      "sp_d": 183,
      "cust": 35,
      "pts_wk": 7.2
    }
  ]
};
  var COMPARE_DATA = DATA;

var currentPeriod = '2w';
var isRecUpload = false;

// ================================================================
// STATE
// All UI state lives here. Changing any of these and calling
// renderApp() (or a partial re-render fn) updates the view.
// ================================================================
let chartMode    = 'diverging'; // 'diverging' | 'ranked'
let sortMode     = 'desc';      // 'desc' | 'asc' | 'name'
let activeMetric = COMPARE_DATA.activeMetric;
let refMode      = 'mean';      // 'mean' | 'median'
let divCenter    = 'mean';      // diverging zero line: 'mean'|'median' → uses getRef()
                                //                      'goal' → uses goal value

// ================================================================
// HELPERS
// ================================================================

// Format a numeric value for display based on metric format type
function fmtVal(val, fmt) {
  if (fmt === 'pct')    return val.toFixed(2) + '%';
  if (fmt === 'dec1')   return val.toFixed(1);
  if (fmt === 'dollar') return '$' + Math.round(val);
  return Math.round(val).toString();
}

// Return the active reference value (mean or median) for a given metric key
function getRef(key) {
  return refMode === 'median'
    ? COMPARE_DATA.storeMedian[key]
    : COMPARE_DATA.storeMean[key];
}

// Return the metric definition object for a given key
function getMetricDef(key) {
  return COMPARE_DATA.metricDefs.find(m => m.key === key);
}

// Return employees sorted by current sortMode
function sortedEmployees() {
  const emps = [...COMPARE_DATA.employees];
  if (sortMode === 'desc') return emps.sort((a,b) => b[activeMetric] - a[activeMetric]);
  if (sortMode === 'asc')  return emps.sort((a,b) => a[activeMetric] - b[activeMetric]);
  return emps.sort((a,b) => a.name.localeCompare(b.name));
}

// ================================================================
// DIVERGING CHART
// Centre line = mean/median OR goal (controlled by divCenter state).
// Secondary marker = whichever one isn't the zero line.
// Bars extend right (above zero) or left (below zero).
// Reference lines are rendered as a single absolute overlay spanning
// all rows — NOT per-row — so they appear as continuous solid lines.
// Goal line uses repeating-linear-gradient to simulate a dashed style
// (div elements cannot use border-style:dashed directly).
// ================================================================
function buildDivergingChart() {
  const mdef   = getMetricDef(activeMetric);
  const ref    = getRef(activeMetric);
  const goal   = COMPARE_DATA.goals[activeMetric];
  const emps   = sortedEmployees();
  const refLbl = refMode === 'median' ? 'Median' : 'Mean';

  // zero  = the value the centre line represents
  // marker = the other reference shown as an offset vertical line
  const zero      = divCenter === 'goal' ? goal : ref;
  const marker    = divCenter === 'goal' ? ref  : goal;
  const markerClr = divCenter === 'goal' ? 'var(--gold)' : 'var(--red)';
  const zeroLbl   = divCenter === 'goal'
    ? 'Goal '  + fmtVal(goal, mdef.fmt)
    : refLbl   + ' ' + fmtVal(ref,  mdef.fmt);
  const markerLbl = divCenter === 'goal'
    ? refLbl   + ' ' + fmtVal(ref,  mdef.fmt)
    : 'Goal '  + fmtVal(goal, mdef.fmt);

  // Scale: max absolute deviation from zero, with 15% headroom
  const maxDev    = Math.max(...emps.map(e => Math.abs(e[activeMetric] - zero))) * 1.15;
  // Marker offset from centre (50%) — can be negative if marker < zero
  const markerPct = maxDev > 0 ? ((marker - zero) / maxDev / 2 * 100) : 0;

  // Goal line background (dashed via gradient — divs can't use border-style:dashed)
  const goalDash = 'repeating-linear-gradient(to bottom,rgba(185,28,28,.85) 0px,rgba(185,28,28,.85) 6px,transparent 6px,transparent 10px)';

  // Build employee rows (bars only — no per-row reference lines)
  const rows = emps.map(e => {
    const val     = e[activeMetric];
    const dev     = val - zero;
    const fillPct = maxDev > 0 ? (Math.abs(dev) / maxDev / 2 * 100) : 0;
    const above   = dev >= 0;
    const isSel   = e.isSelected;
    const fillClr = isSel ? 'var(--blue)' : (above ? 'rgba(5,150,105,.65)' : 'rgba(185,28,28,.55)');
    const left    = above ? 50 : 50 - fillPct;
    const valCls  = isSel ? 'sel' : (above ? 'above' : 'below');
    return `<div class="emp-row">
      <div class="emp-name">
        <div class="emp-init ${isSel?'sel':'oth'}">${e.initials}</div>
        <span class="emp-lbl ${isSel?'sel':''}">${e.name}</span>
      </div>
      <div class="div-bar">
        <div class="div-fill" style="left:${left.toFixed(1)}%;width:${fillPct.toFixed(1)}%;background:${fillClr};${isSel?'box-shadow:0 0 0 1.5px var(--blue-dim);':''}"></div>
      </div>
      <div class="emp-val ${valCls}">${fmtVal(val,mdef.fmt)}</div>
    </div>`;
  }).join('');

  // Single overlay that spans all rows — reference lines are continuous
  // left:152px accounts for 140px name column + 12px gap
  // The zero line colour is gold (mean/median) or red-dashed (goal)
  const zeroLineStyle = divCenter === 'goal'
    ? `background:${goalDash};`
    : `background:var(--gold);opacity:.9;`;
  const markerLineStyle = divCenter === 'goal'
    ? `background:var(--gold);opacity:.9;`
    : `background:${goalDash};`;

  const overlay = `<div style="position:absolute;top:0;bottom:0;left:152px;right:76px;pointer-events:none;z-index:10;overflow:hidden;">
      <div style="position:absolute;top:0;bottom:0;width:2px;left:50%;transform:translateX(-50%);${zeroLineStyle}"></div>
      <div style="position:absolute;top:0;bottom:0;width:2px;transform:translateX(-50%);left:${(50+markerPct).toFixed(1)}%;${markerLineStyle}"></div>
    </div>`;

  const ticks = [-1,-0.5,0,0.5,1].map(t => fmtVal(zero + t*maxDev, mdef.fmt));

  return `
    <div class="chart-header">
      <span class="chart-hdr-lbl">${mdef.label} &mdash; diverging from ${zeroLbl}</span>
      <span class="ch-meta" style="color:${markerClr};">&#9135; ${markerLbl}</span>
    </div>
    <div class="range-axis"><div></div>
      <div class="range-track">${ticks.map(v=>`<span class="range-label">${v}</span>`).join('')}</div>
    <div></div></div>
    <div style="position:relative;">
      ${overlay}
      ${rows}
    </div>`;
}

// ================================================================
// RANKED CHART
// All bars from left, sorted by value.
// Goal (dashed red) and mean/median (solid gold) as continuous
// overlay lines — same single-overlay approach as diverging.
// ================================================================
function buildRankedChart() {
  const mdef   = getMetricDef(activeMetric);
  const ref    = getRef(activeMetric);
  const goal   = COMPARE_DATA.goals[activeMetric];
  const emps   = sortedEmployees();
  const refLbl = refMode === 'median' ? 'Median' : 'Mean';
  // Scale: max value with 8% headroom
  const maxVal = Math.max(...emps.map(e => e[activeMetric])) * 1.08;

  const goalDash = 'repeating-linear-gradient(to bottom,rgba(185,28,28,.85) 0px,rgba(185,28,28,.85) 6px,transparent 6px,transparent 10px)';

  const rows = emps.map(e => {
    const val     = e[activeMetric];
    const fillPct = val / maxVal * 100;
    const above   = val >= ref;
    const isSel   = e.isSelected;
    const fillClr = isSel ? 'var(--blue)' : (above ? 'rgba(5,150,105,.65)' : 'rgba(185,28,28,.55)');
    const valCls  = isSel ? 'sel' : (above ? 'above' : 'below');
    return `<div class="emp-row">
      <div class="emp-name">
        <div class="emp-init ${isSel?'sel':'oth'}">${e.initials}</div>
        <span class="emp-lbl ${isSel?'sel':''}">${e.name}</span>
      </div>
      <div class="rank-bar">
        <div class="rank-fill" style="width:${fillPct.toFixed(1)}%;background:${fillClr};${isSel?'box-shadow:0 0 0 1.5px var(--blue-dim);':''}"></div>
      </div>
      <div class="emp-val ${valCls}">${fmtVal(val,mdef.fmt)}</div>
    </div>`;
  }).join('');

  // Single overlay for both goal and mean/median lines
  const overlay = `<div style="position:absolute;top:0;bottom:0;left:152px;right:76px;pointer-events:none;z-index:10;overflow:hidden;">
      <div style="position:absolute;top:0;bottom:0;width:2px;left:${(goal/maxVal*100).toFixed(1)}%;transform:translateX(-50%);background:${goalDash};"></div>
      <div style="position:absolute;top:0;bottom:0;width:2px;left:${(ref/maxVal*100).toFixed(1)}%;transform:translateX(-50%);background:var(--gold);opacity:.9;"></div>
    </div>`;

  const ticks = [0,0.25,0.5,0.75,1].map(t => fmtVal(t*maxVal, mdef.fmt));

  return `
    <div class="chart-header">
      <span class="chart-hdr-lbl">${mdef.label} &mdash; ranked ${sortMode==='desc'?'&#8595; high':sortMode==='asc'?'&#8593; low':'A&#8211;Z'}</span>
      <span class="ch-meta" style="color:var(--gold);">&#9135; ${refLbl} ${fmtVal(ref,mdef.fmt)}</span>
      <span class="ch-meta" style="color:var(--red);">&#9135; Goal ${fmtVal(goal,mdef.fmt)}</span>
    </div>
    <div class="range-axis"><div></div>
      <div class="range-track">${ticks.map(v=>`<span class="range-label">${v}</span>`).join('')}</div>
    <div></div></div>
    <div style="position:relative;">
      ${overlay}
      ${rows}
    </div>`;
}

// ================================================================
// LEGEND BAR
// Shows: Smith swatch, above/below swatches, goal (dashed) + mean
// lines, live counts, Mean/Median toggle, Zero= toggle (div only).
// ================================================================
function buildLegend() {
  const mdef     = getMetricDef(activeMetric);
  const ref      = getRef(activeMetric);
  const goal     = COMPARE_DATA.goals[activeMetric];
  const total    = COMPARE_DATA.employees.length;
  const aboveRef = COMPARE_DATA.employees.filter(e => e[activeMetric] >= ref).length;
  const metGoal  = COMPARE_DATA.employees.filter(e => e[activeMetric] >= goal).length;
  const refLbl   = refMode === 'median' ? 'Median' : 'Mean';

  // divCenter toggle only appears in diverging mode
  const divToggle = chartMode === 'diverging' ? `
    <div class="rl-sep"></div>
    <span style="font-size:9px;font-weight:700;color:var(--sl);letter-spacing:.06em;text-transform:uppercase;flex-shrink:0;">Zero&nbsp;=</span>
    <div class="chart-togs" style="flex-shrink:0;">
      <button class="ct ${divCenter!=='goal'?'on':''}" onclick="setDivCenter('mean')" style="padding:3px 8px;font-size:9px;">${refLbl}</button>
      <button class="ct ${divCenter==='goal'?'on':''}" onclick="setDivCenter('goal')" style="padding:3px 8px;font-size:9px;">Goal</button>
    </div>` : '';

  return `<div class="ref-legend">
    <div class="rl-item"><div class="rl-box" style="background:var(--blue);"></div><span style="color:var(--blue);">Smith</span></div>
    <div class="rl-item"><div class="rl-box" style="background:rgba(5,150,105,.65);"></div><span style="color:var(--green-dk);">Above ${refLbl}</span></div>
    <div class="rl-item"><div class="rl-box" style="background:rgba(185,28,28,.55);"></div><span style="color:var(--red);">Below ${refLbl}</span></div>
    <div class="rl-sep"></div>
    <div class="rl-item"><div style="width:16px;height:2px;border-top:2px dashed rgba(185,28,28,.85);background:transparent;"></div><span style="color:var(--red);">Goal ${fmtVal(goal,mdef.fmt)}</span></div>
    <div class="rl-item"><div style="width:16px;height:2px;background:var(--gold);opacity:.9;"></div><span style="color:var(--gold);">${refLbl} ${fmtVal(ref,mdef.fmt)}</span></div>
    <div class="rl-sep"></div>
    <span class="rl-note">${aboveRef}/${total} above ${refLbl.toLowerCase()} &middot; ${metGoal}/${total} met goal</span>
    <div class="rl-sep" style="margin-left:auto;"></div>
    <span style="font-size:9px;font-weight:700;color:var(--sl);letter-spacing:.06em;text-transform:uppercase;flex-shrink:0;">Ref&nbsp;</span>
    <div class="chart-togs" style="flex-shrink:0;">
      <button class="ct ${refMode==='mean'?'on':''}" onclick="setRefMode('mean')" style="padding:3px 8px;font-size:9px;">Mean</button>
      <button class="ct ${refMode==='median'?'on':''}" onclick="setRefMode('median')" style="padding:3px 8px;font-size:9px;">Median</button>
    </div>
    ${divToggle}
  </div>`;
}

// ── Metric pills ──────────────────────────────────────────────
function buildMetricPills() {
  return COMPARE_DATA.metricDefs.map(m =>
    `<button class="mpill${m.key===activeMetric?' on':''}" onclick="setMetric('${m.key}')">${m.label}</button>`
  ).join('');
}

// ================================================================
// FULL RENDER
// Rebuilds the entire app DOM from state + COMPARE_DATA.
// Cheap partial re-renders are used for sort cycling (chart-area only).
// ================================================================


function setPeriod(p) {
  if (p === 'rec') { isRecUpload = true; currentPeriod = '2w'; }
  else { isRecUpload = false; currentPeriod = p; }
  renderApp();
}

function renderApp() {
  const per  = COMPARE_DATA.period;
  const mdef = getMetricDef(activeMetric);

  document.getElementById('page-content').innerHTML = `
    <div class="topbar">
      <div class="tb-title">Compare All &mdash; ${mdef.label}</div>
      <div class="tb-sep"></div>
      <div class="pbar">
        <div class="pnav">&#8249;</div><div class="pnav">&#8250;</div>
        <span class="pdate">${per.from} &ndash; ${per.to} (${per.label})</span>
        <div class="ppills">
          ${window.GS.buildPills(currentPeriod, 'ComparePage.setPeriod', isRecUpload)}
        </div>
      </div>
      <div class="tb-r">
        <button class="sort-pill${sortMode==='desc'?' on':''}" onclick="cycleSort()">
          Sort: ${sortMode==='desc'?'&#8595; High':sortMode==='asc'?'&#8593; Low':'A&#8211;Z'}
        </button>
      </div>
    </div>
    <div class="content">
      <div class="controls">
        <div class="metric-pills">${buildMetricPills()}</div>
        <div class="ctrl-sep"></div>
        <div class="chart-togs">
          <button class="ct${chartMode==='diverging'?' on':''}" onclick="setChartMode('diverging')">&#8596; Diverging</button>
          <button class="ct${chartMode==='ranked'?' on':''}" onclick="setChartMode('ranked')">&#9641; Ranked</button>
        </div>
      </div>
      ${buildLegend()}
      <div class="chart-area" id="chart-area">
        ${chartMode==='diverging' ? buildDivergingChart() : buildRankedChart()}
      </div>
    </div>`;
}

// ================================================================
// INTERACTIVITY
// Each setter updates state and either fully re-renders or does a
// targeted partial re-render for performance.
// ================================================================

// Switch active metric — full re-render (all chart + legend change)
function setMetric(key) { activeMetric = key; renderApp(); }

// Switch chart mode — full re-render
function setChartMode(mode) { chartMode = mode; renderApp(); }

// Switch mean/median reference — full re-render
// Also resets divCenter to 'mean' if it wasn't on goal
function setRefMode(mode) {
  refMode = mode;
  if (divCenter !== 'goal') divCenter = 'mean';
  renderApp();
}

// Switch diverging zero line between mean/median and goal
function setDivCenter(center) { divCenter = center; renderApp(); }

// Cycle sort order — partial re-render (chart-area only, fast)
function cycleSort() {
  sortMode = sortMode === 'desc' ? 'asc' : sortMode === 'asc' ? 'name' : 'desc';
  document.getElementById('chart-area').innerHTML =
    chartMode === 'diverging' ? buildDivergingChart() : buildRankedChart();
  const sp = document.querySelector('.sort-pill');
  sp.className = 'sort-pill' + (sortMode === 'desc' ? ' on' : '');
  sp.innerHTML = 'Sort: ' + (sortMode==='desc'?'&#8595; High':sortMode==='asc'?'&#8593; Low':'A&#8211;Z');
}



  window.setMetric = setMetric;
  window.setChartMode = setChartMode;
  window.setRefMode = setRefMode;
  window.setDivCenter = setDivCenter;
  window.cycleSort = cycleSort;

  return {
    init: function(params) {
      renderApp();
    },
    getData: function() { return DATA; },
    renderApp: renderApp,
    setPeriod: setPeriod
  };
})();

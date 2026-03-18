window.Points = (function() {
  let DATA = {
  "store": { "id": 141, "name": "Store 141" },
  "period": { "label": "4 weeks", "from": "Mar 1, 2026", "to": "Mar 28, 2026", "days": 28 },
  "lastFinalized": "Mar 21, 2026",
  "pointSystem": { "sp_pct_pts": 1.0, "cust_pts": 1.0, "sp_d_pts": 1.0, "sp_n_pts": 1.0, "pts_wk_bonus": 1.0 },
  "storeSummary": {
    "avgPtsPerDay": 1.35,
    "goalAvgPtsPerDay": 1.4,
    "weeklyPtsGoal": 7, "weeklyPtsMax": 10, "weeklyPtsEarned": 6.8,
    "associatesOverGoal": 5, "totalAssociates": 12,
    "storeAvgCust": 37.6, "custGoal": 40,
    "bestWeek": "Mar 22-28", "bestWeekPts": 280, "worstWeek": "Mar 15-21", "worstWeekPts": 148
  },
  "employees": [
    { "id":1, "name":"Chen, Amy",     "initials":"AC", "totalPts":98.5, "rank":1,  "weeklyPts":[26.5,25.0,22.0,25.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.93,"cust":0.96,"sp_d":0.82,"sp_n":0.89,"pts_wk":0.86}, "custPts":38, "custGoalPct": 90, "custAvg":44,"custWeeklyPts":[10, 10, 8, 10] },
    { "id":2, "name":"Jones, Lisa",   "initials":"LJ", "totalPts":88.0, "rank":2,  "weeklyPts":[24.0,23.0,19.0,22.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.89,"cust":0.93,"sp_d":0.79,"sp_n":0.86,"pts_wk":0.86}, "custPts":36, "custGoalPct": 85, "custAvg":43,"custWeeklyPts":[10, 9, 7, 10] },
    { "id":3, "name":"Smith, John",   "initials":"JS", "totalPts":82.5, "rank":3,  "weeklyPts":[22.5,22.0,17.0,21.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.86,"cust":0.89,"sp_d":0.75,"sp_n":0.82,"pts_wk":0.86}, "custPts":34, "custGoalPct": 80, "custAvg":42,"custWeeklyPts":[9, 9, 7, 9] },
    { "id":4, "name":"Nguyen, Kevin", "initials":"KN", "totalPts":79.0, "rank":4,  "weeklyPts":[22.0,21.0,16.0,20.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.82,"cust":0.86,"sp_d":0.71,"sp_n":0.79,"pts_wk":0.86}, "custPts":33, "custGoalPct": 75, "custAvg":44,"custWeeklyPts":[9, 9, 7, 8] },
    { "id":5, "name":"Park, David",   "initials":"DP", "totalPts":74.0, "rank":5,  "weeklyPts":[20.5,19.5,15.0,19.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.79,"cust":0.82,"sp_d":0.68,"sp_n":0.75,"pts_wk":0.86}, "custPts":32, "custGoalPct": 70, "custAvg":41,"custWeeklyPts":[9, 8, 6, 9] },
    { "id":6, "name":"Davis, Rachel", "initials":"RD", "totalPts":70.0, "rank":6,  "weeklyPts":[19.5,18.5,14.0,18.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.75,"cust":0.79,"sp_d":0.64,"sp_n":0.71,"pts_wk":0.71}, "custPts":28, "custGoalPct": 62, "custAvg":40,"custWeeklyPts":[8, 7, 6, 7] },
    { "id":7, "name":"Kim, James",    "initials":"JK", "totalPts":65.0, "rank":7,  "weeklyPts":[18.0,17.0,13.0,17.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.71,"cust":0.75,"sp_d":0.61,"sp_n":0.68,"pts_wk":0.71}, "custPts":26, "custGoalPct": 55, "custAvg":39,"custWeeklyPts":[7, 7, 5, 7] },
    { "id":8, "name":"Lee, Michael",  "initials":"ML", "totalPts":60.0, "rank":8,  "weeklyPts":[17.0,16.0,11.5,15.5], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.68,"cust":0.71,"sp_d":0.57,"sp_n":0.64,"pts_wk":0.71}, "custPts":25, "custGoalPct": 48, "custAvg":35,"custWeeklyPts":[7, 6, 5, 7] },
    { "id":9, "name":"Wilson, Tom",   "initials":"WT", "totalPts":54.0, "rank":9,  "weeklyPts":[15.5,14.5,10.0,14.0], "currentWeekPts":null, "metricHitRates":{"sp_pct":0.61,"cust":0.64,"sp_d":0.50,"sp_n":0.57,"pts_wk":0.57}, "custPts":22, "custGoalPct": 40, "custAvg":31,"custWeeklyPts":[6, 6, 4, 6] },
    { "id":10,"name":"Brown, Sarah",  "initials":"SB", "totalPts":49.5, "rank":10, "weeklyPts":[14.0,13.0,9.5,13.0],  "currentWeekPts":null, "metricHitRates":{"sp_pct":0.57,"cust":0.61,"sp_d":0.46,"sp_n":0.54,"pts_wk":0.57}, "custPts":20, "custGoalPct": 35, "custAvg":33,"custWeeklyPts":[5, 5, 4, 6] },
    { "id":11,"name":"Nguyen, Paul",  "initials":"PN", "totalPts":38.0, "rank":11, "weeklyPts":[10.5,9.5,8.5,9.5],   "currentWeekPts":null, "metricHitRates":{"sp_pct":0.43,"cust":0.54,"sp_d":0.36,"sp_n":0.43,"pts_wk":0.43}, "custPts":18, "custGoalPct": 28, "custAvg":34,"custWeeklyPts":[5, 5, 4, 4] },
    { "id":12,"name":"Harris, Dana",  "initials":"DH", "totalPts":31.5, "rank":12, "weeklyPts":[9.0,8.5,7.0,7.0],    "currentWeekPts":null, "metricHitRates":{"sp_pct":0.36,"cust":0.43,"sp_d":0.29,"sp_n":0.36,"pts_wk":0.43}, "custPts":12, "custGoalPct": 10, "custAvg":28,"custWeeklyPts":[3, 3, 2, 4] }
  ]
};
  var POINTS_DATA = DATA;

// ================================================================
// STATE
// ================================================================
let namesVisible = false;
let holdTimer    = null;
let activeView   = 'leaderboard'; // 'leaderboard' | 'cust' | 'table'
let tableSort    = { col: 'rank', dir: 'asc' };
let tableFilter  = '';

// ================================================================
// HELPERS
// ================================================================

// Colour interpolation for weekly bar sparklines
function interpColour(hexA, hexB, t) {
  const parse = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const a = parse(hexA), b = parse(hexB);
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)})`;
}

// Metric display config: key, label, dot colour
const METRIC_CONFIG = [
  { key:'sp_pct', label:'SP %',   colour:'#1652E8' },
  { key:'cust',   label:'Cust #', colour:'#059669' },
  { key:'sp_d',   label:'SP $',   colour:'#7C3AED' },
  { key:'sp_n',   label:'SP #',   colour:'#D97706' },
  { key:'pts_wk', label:'Pts/wk', colour:'#0891B2' },
];

// ================================================================
// BUILD: Point system legend
// Horizontal band showing cust # daily scoring tiers + bonus rule.
//   0 pts = avg cust # < 24  (red)
//   1 pt  = avg cust # 24-29 (amber)
//   2 pts = avg cust # 30+   (green)
// + 1 bonus pt/day if dept weekly pts/wk goal met that window.
// ================================================================
function buildPointLegend() {
  return `<div class="pts-legend">
    <div class="pts-leg-band red">
      <div class="pts-leg-pts">0 pts</div>
      <div class="pts-leg-range">Avg cust # &lt; 24</div>
      <div class="pts-leg-desc">Missed target</div>
    </div>
    <div class="pts-leg-band amber">
      <div class="pts-leg-pts">1 pt</div>
      <div class="pts-leg-range">Avg cust # 24&ndash;29</div>
      <div class="pts-leg-desc">Near goal &mdash; just short</div>
    </div>
    <div class="pts-leg-band green">
      <div class="pts-leg-pts">2 pts</div>
      <div class="pts-leg-range">Avg cust # 30+</div>
      <div class="pts-leg-desc">At / above goal</div>
    </div>

  </div>`;
}

// ================================================================
// BUILD: Summary stat cards (3 across)
//
// Card 1: Store attainment — weekly pts earned vs weekly goal (7/wk)
// Card 2: Avg pts/day vs goal — math: 7/wk÷5 shifts=1.4 goal, 40÷20=2.0 max
//   goalAvgPtsPerDay from storeSummary (DB-driven, auto-updates with weeklyPtsGoal)
//   Colour: green>=goal | amber>=goal-0.2 | red<goal-0.2
// Card 3: Associates over cust # goal (colour thresholds):
//   ≥90% of associates = gold shimmer
//   70–89%             = green
//   60–69%             = amber
//   <60%               = red
//   Bar: count/total width. Background pulses gold at ≥90%.
//
// Attainment (Card 1) thresholds:
//   <80%     = red    | 80–94%  = amber
//   95–115%  = green  | ≥115%   = gold shimmer
//   Bar scale: attPct/130 so values above 100% are still visible.
// ================================================================
function buildStatCards() {
  const s      = POINTS_DATA.storeSummary;
  const attPct = Math.round(s.weeklyPtsEarned / s.weeklyPtsGoal * 100);
  // attClr kept for legacy use — card now computes colour inline using same thresholds
const attClr = attPct >= 95 ? 'var(--green-dk)' : attPct >= 80 ? 'var(--amber)' : 'var(--red)';
  return `<div class="stat-row">
    <!-- Attainment = weeklyPtsEarned / weeklyPtsGoal × 100
         <80%      = red    | 80–94%  = amber
         95–115%   = green  | ≥115%   = gold shimmer         -->
    <div class="stat-card" style="${attPct>=115?'background:linear-gradient(90deg,#F59E0B,#FCD34D,#FBBF24,#FCD34D,#F59E0B);background-size:200% auto;animation:goldShine 2s linear infinite;border-color:var(--amber-dim);':attPct>=95?'background:var(--green-bg);border-color:var(--green-dim);':attPct>=80?'background:var(--amber-bg);border-color:var(--amber-dim);':'background:var(--red-bg);border-color:var(--red-dim);'}">
      <div class="stat-lbl">Store attainment</div>
      <div class="stat-val" style="color:${attPct>=115?'#92400E':attPct>=95?'var(--green-dk)':attPct>=80?'var(--amber)':'var(--red)'};">${attPct}%</div>
      <div style="height:5px;background:rgba(0,0,0,.08);border-radius:3px;overflow:visible;position:relative;margin:5px 0 3px;">
        <div style="height:100%;width:${Math.min(attPct,130)/130*100}%;border-radius:3px;background:rgba(0,0,0,.2);"></div>
        <!-- Goal marker at 100% attainment (goal line) -->
        <div style="position:absolute;top:-3px;bottom:-3px;width:2px;left:${100/130*100}%;background:var(--ink);opacity:.2;border-radius:1px;" title="Goal: 100%"></div>
      </div>
      <div class="stat-sub">${s.weeklyPtsEarned} / ${s.weeklyPtsGoal} pts/wk goal</div>
    </div>
    <!-- Avg pts/day vs goal (1.4 = 7pts/wk ÷ 5 days = goal pacing) -->
    <div class="stat-card ${s.avgPtsPerDay >= s.goalAvgPtsPerDay ? '' : 'miss-card'}">
      <div class="stat-lbl">Avg pts / day</div>
      <div class="stat-val" style="color:${s.avgPtsPerDay >= s.goalAvgPtsPerDay ? 'var(--green-dk)' : s.avgPtsPerDay >= s.goalAvgPtsPerDay - 0.2 ? 'var(--amber)' : 'var(--red)'};">${s.avgPtsPerDay}</div>
      <div style="height:5px;background:var(--sl-bg);border-radius:3px;overflow:visible;position:relative;margin:5px 0 3px;">
        <div style="height:100%;width:${Math.min(s.avgPtsPerDay/2.0*100,100).toFixed(0)}%;border-radius:3px;background:${s.avgPtsPerDay>=s.goalAvgPtsPerDay?'var(--green)':s.avgPtsPerDay>=s.goalAvgPtsPerDay-0.2?'var(--amber)':'var(--red)'};opacity:.7;"></div>
        <div style="position:absolute;top:-3px;bottom:-3px;width:2px;left:${(s.goalAvgPtsPerDay/2.0*100).toFixed(0)}%;background:var(--ink);opacity:.25;border-radius:1px;"></div>
      </div>
      <div class="stat-sub">goal: ${s.goalAvgPtsPerDay} &middot; max: 2.0 &middot; 40 pts/period</div>
    </div>
    <!-- Associates over goal:
         Pct = associatesOverGoal / totalAssociates
         ≥90% = gold shimmer  |  70–89% = green
         60–69% = amber       |  <60%   = red        -->
    <div class="stat-card" style="${(()=>{const p=s.associatesOverGoal/s.totalAssociates;return p>=0.9?'background:linear-gradient(90deg,#F59E0B,#FCD34D,#FBBF24,#FCD34D,#F59E0B);background-size:200% auto;animation:goldShine 2s linear infinite;border-color:var(--amber-dim);':p>=0.7?'background:var(--green-bg);border-color:var(--green-dim);':p>=0.6?'background:var(--amber-bg);border-color:var(--amber-dim);':'background:var(--red-bg);border-color:var(--red-dim);'})()}">
      <div class="stat-lbl">Associates over goal</div>
      <div class="stat-val" style="color:${(()=>{const p=s.associatesOverGoal/s.totalAssociates;return p>=0.9?'#92400E':p>=0.7?'var(--green-dk)':p>=0.6?'var(--amber)':'var(--red)';})()}">${s.associatesOverGoal}/${s.totalAssociates}</div>
      <div style="height:5px;background:rgba(0,0,0,.08);border-radius:3px;margin:5px 0 3px;overflow:hidden;">
        <div style="height:100%;width:${(s.associatesOverGoal/s.totalAssociates*100).toFixed(0)}%;border-radius:3px;background:rgba(0,0,0,.2);"></div>
      </div>
      <div class="stat-sub">${Math.round(s.associatesOverGoal/s.totalAssociates*100)}% hitting cust # goal daily</div>
    </div>
  </div>`;
}

// ================================================================
// BUILD: Main leaderboard
// All 12 employees ranked by totalPts.
// Ranks 1-5: names always visible.
// Ranks 6-12: names + initials blurred — hold censor btn 3s to reveal.
// Gold shimmer animation on rank 1 initials avatar.
// Weekly sparkline bars + 5 metric hit-rate dots per row.
// ================================================================
function buildLeaderboard() {
  const emps  = [...POINTS_DATA.employees].sort((a,b) => a.rank - b.rank);
  const maxWk = Math.max(...emps.flatMap(e => e.weeklyPts || []));

  const rows = emps.map(e => {
    const rankCls  = e.rank <= 3 ? ` r${e.rank}` : '';
    const weekBars = (e.weeklyPts || []).map(w => {
      const h   = Math.round((w / maxWk) * 20);
      const clr = interpColour('#A9C3FB', '#1652E8', w / maxWk);
      return `<div class="er-wk-bar" style="height:${h}px;background:${clr};flex:1;"></div>`;
    }).join('');
    const dots = METRIC_CONFIG.map(m => {
      const rate = e.metricHitRates?.[m.key] ?? 0;
      const op   = rate >= 0.8 ? 1 : rate >= 0.5 ? 0.55 : 0.22;
      return `<div class="er-dot" style="background:${m.colour};opacity:${op};" title="${m.label}: ${Math.round(rate*100)}% of days hit"></div>`;
    }).join('');
    const censor   = !namesVisible && e.rank > 5;
    const nameCls  = censor ? 'style="filter:blur(4px);user-select:none;"' : '';
    const initBlur = censor ? 'style="filter:blur(3px);"' : '';
    return `<div class="emp-row">
      <div class="er-rank${rankCls}">${e.rank}</div>
      <div class="er-init${rankCls}" ${initBlur}>${e.initials}</div>
      <div class="er-name" ${nameCls}>${e.name}</div>
      <div class="er-weeks">${weekBars}</div>
      <div class="er-total${rankCls}">${e.totalPts} pts</div>
      <div class="er-metrics">${dots}</div>
    </div>`;
  }).join('');

  const keyItems = METRIC_CONFIG.map(m =>
    `<div class="mk-item"><div class="mk-dot" style="background:${m.colour};"></div><span>${m.label}</span></div>`
  ).join('');

  return `<div class="lb-panel">
    <div class="lb-hdr">
      <div class="lb-title">&#127942; Employee leaderboard</div>
      <div class="lb-sub">Total pts over period &middot; finalized weekly &middot; dots = metric hit rate</div>
      <button class="censor-btn" id="censor-btn" title="Hold 3s to reveal/hide names"
        onmousedown="startReveal()" onmouseup="cancelReveal()" onmouseleave="cancelReveal()"
        ontouchstart="startReveal()" ontouchend="cancelReveal()">
        ${namesVisible ? '&#128065; Hide names' : '&#128274; Hold 3s'}
      </button>
    </div>
    ${rows}
    <div class="metric-key">${keyItems}</div>
  </div>`;
}

// ================================================================
// BUILD: Right panel (3 stacked cards)
//   1. Weekly cust # pts attainment bar vs weekly goal
//   2. Weekly store pts totals — best (green) / worst (red)
//   3. Store-wide metric hit rates — 5 bars
// ================================================================
function buildRightPanel() {
  const s        = POINTS_DATA.storeSummary;
  const numWeeks = POINTS_DATA.employees[0]?.weeklyPts?.length || 4;
  const weekTotals = Array.from({length: numWeeks}, (_, wi) =>
    POINTS_DATA.employees.reduce((sum, e) => sum + (e.weeklyPts?.[wi] || 0), 0)
  );
  const maxWeekTotal = Math.max(...weekTotals);
  const weekLabels   = ['Week 1','Week 2','Week 3','Week 4'];

  const weekRows = weekTotals.map((total, i) => {
    const isBest  = total === Math.max(...weekTotals);
    const isWorst = total === Math.min(...weekTotals);
    const clr     = isBest ? 'var(--green)' : isWorst ? 'var(--red)' : 'var(--blue)';
    const badge   = isBest
      ? '<span style="font-size:8px;color:var(--green-dk);font-weight:700;"> best</span>'
      : isWorst ? '<span style="font-size:8px;color:var(--red);font-weight:700;"> worst</span>' : '';
    return `<div class="wk-row">
      <div class="wk-lbl">${weekLabels[i]}${badge}</div>
      <div class="wk-bar-wrap"><div class="wk-bar-fill" style="width:${(total/maxWeekTotal*100).toFixed(0)}%;background:${clr};"></div></div>
      <div class="wk-pts">${Math.round(total)}</div>
    </div>`;
  }).join('');

  const metricRows = METRIC_CONFIG.map(m => {
    const avg    = POINTS_DATA.employees.reduce((sum,e) => sum + (e.metricHitRates?.[m.key] || 0), 0) / POINTS_DATA.employees.length;
    const pctVal = Math.round(avg * 100);
    const clr    = pctVal >= 80 ? 'var(--green)' : pctVal >= 60 ? 'var(--amber)' : 'var(--red)';
    return `<div class="mh-row">
      <div class="mh-lbl">${m.label}</div>
      <div class="mh-bar-wrap"><div class="mh-bar-fill" style="width:${pctVal}%;background:${clr};"></div></div>
      <div class="mh-pct" style="color:${clr};">${pctVal}%</div>
    </div>`;
  }).join('');

  return `<div class="right-panel">
    <div class="panel">
      <div class="panel-title">&#128202; Weekly cust # pts attainment</div>
      <div style="font-size:9px;color:var(--sl-lt);margin-bottom:6px;">Avg pts/wk vs weekly goal of ${s.weeklyPtsGoal} pts/employee</div>
      <div class="att-bar-wrap">
        <div class="att-bar-fill" style="width:${Math.min(s.weeklyPtsEarned/s.weeklyPtsGoal*100,100).toFixed(0)}%;background:${s.weeklyPtsEarned>=s.weeklyPtsGoal?'var(--green)':'var(--amber)'};"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--sl-lt);margin-top:4px;">
        <span>${s.weeklyPtsEarned} pts/wk avg</span>
        <span>goal: ${s.weeklyPtsGoal} &middot; max: ${s.weeklyPtsMax||10}/wk &middot; 40 pts/period</span>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title">&#128197; Weekly store pts</div>
      ${weekRows}
    </div>
    <div class="panel">
      <div class="panel-title">&#127919; Store metric hit rates</div>
      <div style="font-size:9px;color:var(--sl-lt);margin-bottom:8px;">% of employee-days each metric was hit</div>
      ${metricRows}
    </div>
  </div>`;
}

// ================================================================
// BUILD: Cust # Leaderboard view
// Ranked by custPts. Point tiers: <24=0pt | 24-29=1pt | 30+=2pt.
// Censor: ranks 1-5 always visible; ranks 6-12 blurred until hold-3s.
// Hit% column removed from this view (visible in Raw Data table only).
//
// Summary cards use slider bars with these thresholds:
//   Attainment: <80% red | 80-94% amber | 95-115% green | ≥115% gold
//   Store avg cust #:
//     ≥ goal          = green
//     goal-2 to goal  = amber  (within 2 customers of goal)
//     < goal-2        = red    (2+ customers below goal)
//   Bar scale: avg/(goal+5) so the goal marker is visible mid-bar.
//   Goal tick: absolute-positioned div at (goal/(goal+5)*100)% of bar.
// ================================================================
function buildCustView() {
  const emps       = [...POINTS_DATA.employees].sort((a,b) => (b.custPts||0) - (a.custPts||0));
  const maxCustPts = emps[0]?.custPts || 1;
  const custGoal   = 40;
  const maxWk      = Math.max(...emps.flatMap(e => e.custWeeklyPts || []));
  const storeAvgPct  = Math.round(emps.reduce((s,e) => s + (e.custGoalPct||0), 0) / emps.length);
  const storeAvgCust = (emps.reduce((s,e) => s + (e.custAvg||0), 0) / emps.length).toFixed(1);
  const totalCustPts = emps.reduce((s,e) => s + (e.custPts||0), 0);

  // Pull storeSummary values for sliders — DB-driven, consistent with stat cards
  const ss        = POINTS_DATA.storeSummary;
  const ssAttPct  = Math.round(ss.weeklyPtsEarned / ss.weeklyPtsGoal * 100);
  const ssAvgCust = ss.storeAvgCust || storeAvgCust;   // prefer DB value
  const ssCustGoal= ss.custGoal    || custGoal;

  // Attainment colour — same thresholds as Card 1 above
  const ssAttClr  = ssAttPct>=115?'#92400E':ssAttPct>=95?'var(--green-dk)':ssAttPct>=80?'var(--amber)':'var(--red)';
  const ssAttBg   = ssAttPct>=115?'linear-gradient(90deg,#F59E0B,#FCD34D,#FBBF24,#FCD34D,#F59E0B)':ssAttPct>=95?'var(--green)':ssAttPct>=80?'var(--amber)':'var(--red)';

  // Store avg cust # colour:
  //   ≥ goal              = green
  //   within 2 below goal = amber  (goal-2 ≤ avg < goal)
  //   2+ below goal       = red    (avg < goal-2)
  const ssAvgClr  = ssAvgCust>=ssCustGoal?'var(--green-dk)':ssAvgCust>=ssCustGoal-2?'var(--amber)':'var(--red)';
  const ssAvgBarClr=ssAvgCust>=ssCustGoal?'var(--green)':ssAvgCust>=ssCustGoal-2?'var(--amber)':'var(--red)';

  const summary = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">
    <div class="stat-card"><div class="stat-lbl">Total customers helped</div><div class="stat-val">${totalCustPts}</div><div class="stat-sub">dept total &middot; ${POINTS_DATA.period.label}</div></div>
    <div class="stat-card" style="${ssAttPct>=115?'background:linear-gradient(90deg,#F59E0B,#FCD34D,#FBBF24,#FCD34D,#F59E0B);background-size:200% auto;animation:goldShine 2s linear infinite;border-color:var(--amber-dim);':ssAttPct>=95?'background:var(--green-bg);border-color:var(--green-dim);':ssAttPct>=80?'background:var(--amber-bg);border-color:var(--amber-dim);':'background:var(--red-bg);border-color:var(--red-dim);'}">
      <div class="stat-lbl">Store attainment</div>
      <div class="stat-val" style="color:${ssAttClr};">${ssAttPct}%</div>
      <div style="height:5px;background:rgba(0,0,0,.08);border-radius:3px;overflow:visible;position:relative;margin:5px 0 3px;">
        <div style="height:100%;width:${Math.min(ssAttPct,130)/130*100}%;border-radius:3px;background:rgba(0,0,0,.2);"></div>
        <div style="position:absolute;top:-3px;bottom:-3px;width:2px;left:${100/130*100}%;background:var(--ink);opacity:.2;border-radius:1px;"></div>
      </div>
      <div class="stat-sub">${ss.weeklyPtsEarned} / ${ss.weeklyPtsGoal} pts/wk</div>
    </div>
    <div class="stat-card" style="${ssAvgCust>=ssCustGoal?'background:var(--green-bg);border-color:var(--green-dim);':ssAvgCust>=ssCustGoal-2?'background:var(--amber-bg);border-color:var(--amber-dim);':'background:var(--red-bg);border-color:var(--red-dim);'}">
      <div class="stat-lbl">Store avg cust #</div>
      <div class="stat-val" style="color:${ssAvgClr};">${ssAvgCust}</div>
      <div style="height:5px;background:rgba(0,0,0,.08);border-radius:3px;overflow:visible;position:relative;margin:5px 0 3px;">
        <div style="height:100%;width:${Math.min(ssAvgCust/(ssCustGoal+5)*100,100).toFixed(0)}%;border-radius:3px;background:${ssAvgBarClr};opacity:.7;"></div>
        <div style="position:absolute;top:-3px;bottom:-3px;width:2px;left:${(ssCustGoal/(ssCustGoal+5)*100).toFixed(0)}%;background:var(--ink);opacity:.2;border-radius:1px;"></div>
      </div>
      <div class="stat-sub">goal: ${ssCustGoal}/day &middot; ${ssAvgCust>=ssCustGoal?'on goal':ssAvgCust>=ssCustGoal-2?'within 2 of goal':'below by '+(ssCustGoal-ssAvgCust).toFixed(1)}</div>
    </div>
  </div>`;

  const colHdr = `<div style="display:grid;grid-template-columns:24px 28px 1fr 80px 60px 50px;gap:10px;padding:7px 16px;background:var(--sl-bg);border-bottom:1px solid var(--sl-dim);">
    <div></div><div></div>
    <div style="font-size:9px;font-weight:700;color:var(--sl);text-transform:uppercase;letter-spacing:.06em;">Employee</div>
    <div style="font-size:9px;font-weight:700;color:var(--sl);text-transform:uppercase;">By week</div>
    <div style="font-size:9px;font-weight:700;color:var(--sl);text-transform:uppercase;">Bar</div>
    <div style="font-size:9px;font-weight:700;color:var(--sl);text-align:right;text-transform:uppercase;">Pts</div>
  </div>`;

  const rows = emps.map((e, i) => {
    const rank     = i + 1;
    const rankCls  = rank <= 3 ? ` r${rank}` : '';
    const barPct   = ((e.custPts||0) / maxCustPts * 100).toFixed(0);
    const hitPct   = e.custGoalPct || 0;
    const hitClr   = hitPct >= 70 ? 'var(--green)' : hitPct >= 65 ? 'var(--amber)' : 'var(--red)';
    const censor   = !namesVisible && e.rank > 5;
    const nameCls  = censor ? 'style="filter:blur(4px);user-select:none;"' : '';
    const initBlur = censor ? 'style="filter:blur(3px);"' : '';
    const wkBars   = (e.custWeeklyPts||[]).map(w => {
      const h = Math.max(3, Math.round((w/maxWk)*20));
      return `<div style="flex:1;height:${h}px;background:var(--green);opacity:.75;border-radius:2px 2px 0 0;"></div>`;
    }).join('');
    return `<div style="display:grid;grid-template-columns:24px 28px 1fr 80px 60px 50px;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--sl-bg);">
      <div class="er-rank${rankCls}">${rank}</div>
      <div class="er-init${rankCls}" ${initBlur}>${e.initials}</div>
      <div class="er-name" ${nameCls}>${e.name}</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:20px;">${wkBars}</div>
      <div style="height:8px;background:var(--sl-bg);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${barPct}%;background:var(--green);border-radius:4px;"></div></div>
      <div style="font-family:'DM Mono',monospace;font-size:11px;font-weight:700;color:var(--green-dk);text-align:right;">${e.custPts||0}</div>
    </div>`;
  }).join('');

  return `<div style="display:flex;flex-direction:column;gap:12px;">
    ${summary}
    <div class="lb-panel">
      <div class="lb-hdr">
        <div class="lb-title">&#128101; Cust # pts &mdash; ranked</div>
        <div class="lb-sub">+1 pt per day cust # goal (${custGoal}/day) is met &middot; finalized weekly</div>
        <button class="censor-btn" id="censor-btn" title="Hold 3s to reveal names"
          onmousedown="startReveal()" onmouseup="cancelReveal()" onmouseleave="cancelReveal()"
          ontouchstart="startReveal()" ontouchend="cancelReveal()">
          ${namesVisible ? '&#128065; Hide' : '&#128274; Hold 3s'}
        </button>
      </div>
      ${colHdr}${rows}
    </div>
  </div>`;
}

// ================================================================
// BUILD: Cust # raw data table
// Sortable by any column, filterable by name, CSV export.
// Sort: click header to sort asc/desc. Partial re-render via #view-mount.
// Export: downloads visible rows as period-named .csv file.
// ================================================================
function buildTableView() {
  const custGoal = 40;
  const filter   = tableFilter.trim().toLowerCase();
  let rows = filter
    ? POINTS_DATA.employees.filter(e => e.name.toLowerCase().includes(filter))
    : [...POINTS_DATA.employees];

  const col = tableSort.col;
  const dir = tableSort.dir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    if (col === 'name')   return a.name.localeCompare(b.name) * dir;
    const vals = { rank: e => e.rank, avg: e => e.custAvg||0, hitpct: e => e.custGoalPct||0,
                   pts: e => e.custPts||0, w1: e => (e.custWeeklyPts||[])[0]||0,
                   w2: e => (e.custWeeklyPts||[])[1]||0, w3: e => (e.custWeeklyPts||[])[2]||0,
                   w4: e => (e.custWeeklyPts||[])[3]||0 };
    return ((vals[col]?.(a) ?? a.rank) - (vals[col]?.(b) ?? b.rank)) * dir;
  });

  const th = (label, key, right='') => {
    const active = tableSort.col === key;
    const arrow  = active ? (tableSort.dir === 'asc' ? ' &#9650;' : ' &#9660;') : ' &#8693;';
    return `<th class="${active?'sorted':''}" onclick="sortTable('${key}')" style="${right?'text-align:right;':''}">
      ${label}<span class="sort-arrow">${arrow}</span></th>`;
  };

  const tableRows = rows.map(e => {
    const hitCls = (e.custGoalPct||0) >= 70 ? 'hit' : (e.custGoalPct||0) >= 65 ? '' : 'miss';
    const wks    = e.custWeeklyPts || ['-','-','-','-'];
    return `<tr>
      <td class="num dim">${e.rank}</td>
      <td style="font-weight:600;">${e.name}</td>
      <td class="num">${e.custAvg||'-'}</td>
      <td class="num dim">${custGoal}</td>
      <td class="num ${hitCls}">${e.custGoalPct||0}%</td>
      <td class="num" style="color:var(--green-dk);">${e.custPts||0}</td>
      <td class="num">${wks[0]??'-'}</td>
      <td class="num">${wks[1]??'-'}</td>
      <td class="num">${wks[2]??'-'}</td>
      <td class="num">${wks[3]??'-'}</td>
    </tr>`;
  }).join('');

  return `<div class="tbl-wrap">
    <div class="tbl-toolbar">
      <div class="tbl-title">&#9783; Cust # raw data &mdash; ${POINTS_DATA.period.from} &ndash; ${POINTS_DATA.period.to}</div>
      <input class="tbl-filter" id="tbl-filter-inp" placeholder="Filter by name&hellip;"
        value="${tableFilter}" oninput="filterTable(this.value)"/>
      <button class="btn-export" onclick="exportCSV()">&#8595; Export CSV</button>
    </div>
    <div class="tbl-scroll">
      <table class="rt"><thead><tr>
        ${th('Rank','rank')}${th('Name','name')}${th('Avg/day','avg','r')}
        ${th('Goal','goal','r')}${th('Hit %','hitpct','r')}${th('Pts','pts','r')}
        ${th('Wk 1','w1','r')}${th('Wk 2','w2','r')}${th('Wk 3','w3','r')}${th('Wk 4','w4','r')}
      </tr></thead><tbody>${tableRows}</tbody></table>
    </div>
    <div class="tbl-footer">
      <span>${rows.length} of ${POINTS_DATA.employees.length} employees${filter?' (filtered)':''}</span>
      <span>Goal: ${custGoal}/day &middot; Last finalized: ${POINTS_DATA.lastFinalized}</span>
    </div>
  </div></div>`;
}

// ================================================================
// HOLD-TO-REVEAL — 3 second hold to toggle name blur on/off
// ================================================================
function startReveal() {
  const btn = document.getElementById('censor-btn');
  if (btn) btn.classList.add('glowing');
  holdTimer = setTimeout(() => { namesVisible = !namesVisible; renderApp(); }, 3000);
}
function cancelReveal() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  const btn = document.getElementById('censor-btn');
  if (btn) btn.classList.remove('glowing');
}

// ================================================================
// INTERACTIVITY
// ================================================================
function setView(view)     { activeView = view; renderApp(); }
function sortTable(col)    {
  tableSort = tableSort.col === col
    ? { col, dir: tableSort.dir === 'asc' ? 'desc' : 'asc' }
    : { col, dir: col === 'rank' ? 'asc' : 'desc' };
  const m = document.getElementById('view-mount');
  if (m) m.innerHTML = buildTableView();
}
function filterTable(val)  {
  tableFilter = val;
  const m = document.getElementById('view-mount');
  if (m) m.innerHTML = buildTableView();
}
function exportCSV() {
  const filter = tableFilter.trim().toLowerCase();
  const rows   = filter
    ? POINTS_DATA.employees.filter(e => e.name.toLowerCase().includes(filter))
    : [...POINTS_DATA.employees];
  const header = ['Rank','Name','Cust Avg/day','Goal','Hit%','Pts','Wk1','Wk2','Wk3','Wk4'];
  const lines  = rows.map(e => {
    const w = e.custWeeklyPts || [];
    return [e.rank,e.name,e.custAvg||0,40,(e.custGoalPct||0)+'%',e.custPts||0,w[0]||0,w[1]||0,w[2]||0,w[3]||0].join(',');
  });
  const blob = new Blob([[header.join(','),...lines].join('\n')], {type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {href:url, download:'cust_pts_'+POINTS_DATA.period.from.replace(/,? /g,'_')+'.csv'});
  a.click(); URL.revokeObjectURL(url);
}

// ================================================================
// FULL RENDER
// ================================================================


function renderApp() {
  const per = POINTS_DATA.period;
  document.getElementById('page-content').innerHTML = `
    <div class="topbar">
            <div class="tb-title">Points &mdash; ${activeView==='cust'?'Cust # Leaderboard':activeView==='table'?'Cust # Table':'Leaderboard'}</div>
            <div class="tb-sep"></div>
            <div class="pbar">
              <div class="pnav">&#8249;</div><div class="pnav">&#8250;</div>
              <span class="pdate">${per.from} &ndash; ${per.to} (${per.label})</span>
              <div class="ppills">
                <button class="pp rec">Rec. Upload</button><div class="pdiv"></div>
                <button class="pp">1w</button><button class="pp">2w</button>
                <button class="pp on">4w</button><button class="pp">8w</button>
                <button class="pp">12w</button><button class="pp">18w</button>
                <button class="pp">26w</button>
              </div>
            </div>
            <div class="tb-r"><span style="font-size:10px;color:var(--sl-lt);">Last finalized: ${POINTS_DATA.lastFinalized}</span></div>
          </div>
          <div class="content">
            <div class="fin-banner">
              <div class="fin-dot"></div>
              <span>Points finalized through <strong>${POINTS_DATA.lastFinalized}</strong> &middot; current week pts/wk bonus pending until window closes</span>
            </div>
            ${buildPointLegend()}
            ${buildStatCards()}
            <div id="view-mount">
              ${activeView==='cust' ? buildCustView() : activeView==='table' ? buildTableView() : '<div class="two-col">'+buildLeaderboard()+buildRightPanel()+'</div>'}
            </div>
          </div>`;
}

renderApp();

  window.setView = typeof setView !== 'undefined' ? setView : function(){};
  window.startHold = typeof startHold !== 'undefined' ? startHold : function(){};
  window.cancelHold = typeof cancelHold !== 'undefined' ? cancelHold : function(){};

  return {
    init: function(params) {
      renderApp();
    },
    getData: function() { return DATA; },
    renderApp: renderApp
  };
})();

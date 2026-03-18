window.GoalsPage = (function() {
  let DATA = {
  "store": {
    "id": 141,
    "name": "Store 141"
  },
  "manager": "Johnson, Mike",
  "period": {
    "label": "4 weeks",
    "from": "Mar 1, 2026",
    "to": "Mar 28, 2026",
    "days": 28
  },
  "lastUpdated": "Mar 1, 2026",
  "goals": [
    {
      "key": "sp_pct",
      "label": "SP %",
      "fmt": "pct",
      "value": 1.8,
      "unit": "rate",
      "locked": false,
      "note": ""
    },
    {
      "key": "cust",
      "label": "Cust #",
      "fmt": "int",
      "value": 40,
      "unit": "per day",
      "locked": false,
      "note": ""
    },
    {
      "key": "sp_d",
      "label": "SP $",
      "fmt": "dollar",
      "value": 250,
      "unit": "per day",
      "locked": true,
      "note": "District-set. Do not modify."
    },
    {
      "key": "sp_n",
      "label": "SP #",
      "fmt": "dec1",
      "value": 6.0,
      "unit": "per day",
      "locked": false,
      "note": ""
    },
    {
      "key": "pts_wk",
      "label": "Pts/wk",
      "fmt": "dec1",
      "value": 7.0,
      "unit": "per wk",
      "locked": false,
      "note": "Dept average counted weekly."
    }
  ],
  "actuals": {
    "sp_pct": 1.84,
    "cust": 42,
    "sp_d": 199,
    "sp_n": 4.9,
    "pts_wk": 8.4
  },
  "priorActuals": {
    "sp_pct": 1.72,
    "cust": 38,
    "sp_d": 185,
    "sp_n": 5.1,
    "pts_wk": 8.8
  },
  "pointSystem": {
    "sp_pct_pts": 1.0,
    "cust_pts": 1.0,
    "sp_d_pts": 1.0,
    "sp_n_pts": 1.0,
    "pts_wk_bonus": 1.0,
    "note": "If pts/wk goal met for the week, each working day earns +1 bonus point. Unearned metrics: 0 to -1 = light red, -1 to -2 = dark red."
  },
  "ptsExceptions": [
    {
      "name": "Harris, Dana",
      "status": "Part-time (3d/wk)",
      "goal": 5.0,
      "locked": false
    },
    {
      "name": "Kim, Sue",
      "status": "Part-time (4d/wk)",
      "goal": 6.0,
      "locked": false
    },
    {
      "name": "Ruiz, Marco",
      "status": "Seasonal (full-time)",
      "goal": 7.0,
      "locked": false
    }
  ],
  "performers": {
    "improvement": [
      {
        "initials": "DH",
        "name": "Harris, Dana",
        "sp_pct": 1.44, "cust": 28, "sp_d": 162, "sp_n": 3.8, "pts_wk": 5.0,
        "totalPts": 31.5,
        "weeklyPts": [9.0, 8.5, 7.0, 7.0],
        "reason": "Low Cust # (28), rarely attaches SP"
      },
      {
        "initials": "PN",
        "name": "Nguyen, Paul",
        "sp_pct": 1.65, "cust": 34, "sp_d": 181, "sp_n": 4.2, "pts_wk": 5.9,
        "totalPts": 38.0,
        "weeklyPts": [10.5, 9.5, 8.5, 9.5],
        "reason": "Strong traffic but small ticket SP amounts"
      },
      {
        "initials": "SK",
        "name": "Kim, Sue",
        "sp_pct": 1.72, "cust": 36, "sp_d": 195, "sp_n": 4.4, "pts_wk": 6.0,
        "totalPts": 41.0,
        "weeklyPts": [12.0, 11.0, 8.0, 10.0],
        "reason": "SP # down 3 weeks in a row"
      }
    ],
    "best": [
      {
        "initials": "AC",
        "name": "Chen, Amy",
        "sp_pct": 2.31, "cust": 45, "sp_d": 267, "sp_n": 6.8, "pts_wk": 12.1,
        "totalPts": 98.5,
        "weeklyPts": [26.5, 25.0, 22.0, 25.0],
        "reason": "Highest in store, consistent all 4 weeks"
      },
      {
        "initials": "LJ",
        "name": "Jones, Lisa",
        "sp_pct": 2.1, "cust": 43, "sp_d": 241, "sp_n": 6.2, "pts_wk": 9.8,
        "totalPts": 88.0,
        "weeklyPts": [24.0, 23.0, 19.0, 22.0],
        "reason": "High-value SP transactions, strong Cust #"
      },
      {
        "initials": "JS",
        "name": "Smith, John",
        "sp_pct": 1.97, "cust": 42, "sp_d": 228, "sp_n": 5.4, "pts_wk": 10.4,
        "totalPts": 82.5,
        "weeklyPts": [22.5, 22.0, 17.0, 21.0],
        "reason": "Just below SP % goal — Cust # pulling up"
      }
    ]
  },
  "notes": {
    "2026-03": [
      {
        "id": 1,
        "title": "Week 3 underperformance",
        "body": "SP$ and SP# both fell significantly week 3 (Mar 15-21). Attributed to reduced floor coverage \u2014 two team members out. Recovery strong in week 4. No corrective action needed unless pattern repeats.",
        "locked": false,
        "author": "Johnson, Mike",
        "date": "Mar 22, 2026",
        "censored": true
      },
      {
        "id": 2,
        "title": "New product launch impact",
        "body": "Week 4 uptick in SP$ likely driven by the new tablet accessories launch Mar 21. Will monitor whether this is sustained or a launch spike. Updating goal trajectory accordingly.",
        "locked": true,
        "author": "Johnson, Mike",
        "date": "Mar 28, 2026",
        "censored": true
      }
    ],
    "2026-02": [
      {
        "id": 3,
        "title": "February wrap-up",
        "body": "Feb period closed above SP% goal for the first time in 3 months. Cust # remains strong. SP$ still lagging \u2014 district remains at $250 target. Coaching sessions scheduled for 3 floor staff.",
        "locked": true,
        "author": "Johnson, Mike",
        "date": "Feb 28, 2026",
        "censored": true
      }
    ]
  },
  "heatmap": [
    {
      "date": "Mar 1",
      "day": "Sun",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 2",
      "day": "Mon",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 3",
      "day": "Tue",
      "sp_pct": false,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 4",
      "day": "Wed",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 5",
      "day": "Thu",
      "sp_pct": true,
      "cust": false,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 6",
      "day": "Fri",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 7",
      "day": "Sat",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 8",
      "day": "Sun",
      "sp_pct": false,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 9",
      "day": "Mon",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 10",
      "day": "Tue",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 11",
      "day": "Wed",
      "sp_pct": false,
      "cust": false,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 12",
      "day": "Thu",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 13",
      "day": "Fri",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 14",
      "day": "Sat",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 15",
      "day": "Sun",
      "sp_pct": false,
      "cust": false,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 16",
      "day": "Mon",
      "sp_pct": false,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 17",
      "day": "Tue",
      "sp_pct": true,
      "cust": false,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 18",
      "day": "Wed",
      "sp_pct": false,
      "cust": false,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 19",
      "day": "Thu",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 20",
      "day": "Fri",
      "sp_pct": false,
      "cust": true,
      "sp_d": false,
      "sp_n": false,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 21",
      "day": "Sat",
      "sp_pct": true,
      "cust": true,
      "sp_d": false,
      "sp_n": true,
      "pts_wk_hit": false
    },
    {
      "date": "Mar 22",
      "day": "Sun",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 23",
      "day": "Mon",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 24",
      "day": "Tue",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 25",
      "day": "Wed",
      "sp_pct": true,
      "cust": false,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 26",
      "day": "Thu",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 27",
      "day": "Fri",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    },
    {
      "date": "Mar 28",
      "day": "Sat",
      "sp_pct": true,
      "cust": true,
      "sp_d": true,
      "sp_n": true,
      "pts_wk_hit": true
    }
  ]
};
  var GOALS_DATA = DATA;

// ================================================================
// STATE
// ================================================================
var currentPeriod = '4w'; var isRecUpload = false;
let namesVisible  = false;   // hold-3s to toggle worst performer names
let notesVisible  = false;   // hold-1s to toggle note body censoring
let currentNoteCategory = "Analysis"; // active subfolder tab
let currentNoteYear  = "2026";          // selected year for notes
let currentNoteMonth = "2026-03";       // active notes month (YYYY-MM)
let holdTimer     = null;

// ================================================================
// HELPERS
// ================================================================
function setPeriod(p) { if(p==='rec'){isRecUpload=true;currentPeriod='4w';}else{isRecUpload=false;currentPeriod=p;} renderApp(); }

function fmtVal(val, fmt) {
  if (fmt === 'pct')    return parseFloat(val).toFixed(2) + '%';
  if (fmt === 'dec1')   return parseFloat(val).toFixed(1);
  if (fmt === 'dollar') return '$' + Math.round(val);
  return Math.round(val).toString();
}

// compositeScore removed — performers now use totalPts (heatmap point system)

// ── Heatmap scoring ───────────────────────────────────────────
function scoreDay(day) {
  const hits   = [day.sp_pct, day.cust, day.sp_d, day.sp_n].filter(Boolean).length;
  const misses = 4 - hits;
  let score    = hits - misses * 0.5;
  if (day.pts_wk_hit) score += 1;
  return score;
}
function scoreToClass(score, allFive) {
  if (allFive)       return 'hm-gold';
  if (score >= 4)    return 'hm-true-grn';
  if (score >= 0.5)  return 'hm-light-grn';
  if (score >= -1)   return 'hm-light-red';
  return 'hm-dark-red';
}

// ================================================================
// BUILD SECTIONS
// ================================================================

function buildSummaryCards() {
  const actuals = GOALS_DATA.actuals;
  const prior   = GOALS_DATA.priorActuals;
  return '<div class="sg5">' + GOALS_DATA.goals.map(g => {
    const val = actuals[g.key], prv = prior[g.key];
    const hit = val >= g.value, trend = val > prv;
    const diff = val - g.value;
    const detTxt = hit
      ? 'goal ' + fmtVal(g.value, g.fmt)
      : (diff < 0 ? '' : '+') + fmtVal(diff, g.fmt) + ' of ' + fmtVal(g.value, g.fmt);
    return `<div class="sc ${trend?'above-mean':'below-mean'}">
      <div class="sc-lbl">${g.label}</div>
      <div class="sc-vrow">
        <div class="sc-val">${fmtVal(val,g.fmt)}</div>
        <span class="mean-ind ${trend?'mi-up':'mi-dn'}">${trend?'&#8593;':'&#8595;'} trend</span>
      </div>
      <div class="sc-mean-note">Prior: ${fmtVal(prv,g.fmt)}</div>
      <div class="goal-box ${hit?'hit':'miss'}">
        <span class="gb-icon">${hit?'&#10003;':'&#10007;'}</span>
        <span class="gb-text">${hit?'Goal met':'Goal missed'}</span>
        <span class="gb-detail">${detTxt}</span>
      </div>
    </div>`;
  }).join('') + '</div>';
}

// ── Progress bars + notes system ─────────────────────────────
function buildProgressBarsAndNotes() {
  const actuals = GOALS_DATA.actuals;
  const rows = GOALS_DATA.goals.map(g => {
    const val = actuals[g.key];
    const pct = Math.min(val / g.value * 100, 100);
    const hit = val >= g.value;
    const pctDisplay = Math.round(val / g.value * 100);
    return `<div class="gp-row">
      <div class="gp-metric">${g.label}</div>
      <div class="gp-bar-wrap"><div class="gp-bar-fill ${hit?'hit':'miss'}" style="width:${pct.toFixed(0)}%;"></div></div>
      <div class="gp-nums ${hit?'hit':'miss'}">${fmtVal(val,g.fmt)} / ${fmtVal(g.value,g.fmt)}</div>
      <div class="gp-goalbox ${hit?'hit':'miss'}">${hit?'&#10003;':'&#10007;'} ${pctDisplay}%</div>
    </div>`;
  }).join('');

  // ── Year selector: current year + next 5 years ──────────────
  const MONTH_NAMES = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const baseYear  = 2026;
  const yearRange = Array.from({length:6}, (_,i) => String(baseYear + i)); // 2026-2031
  const yearOpts  = yearRange.map(y =>
    `<option value="${y}" ${y===currentNoteYear?'selected':''}>'${y.slice(2)}</option>`
  ).join('');

  // ── Month selector for selected year ─────────────────────────
  // Show all 12 months. Months with existing notes get a dot indicator.
  const existingKeys = new Set(Object.keys(GOALS_DATA.notes));
  const monthOpts = MONTH_NAMES.map((name, i) => {
    const mm  = String(i+1).padStart(2,'0');
    const key = `${currentNoteYear}-${mm}`;
    const hasDot = existingKeys.has(key) ? ' ●' : '';
    return `<option value="${key}" ${key===currentNoteMonth?'selected':''}>${name}${hasDot}</option>`;
  }).join('');

  // Categories / subfolder tabs
  const categories = ['Analysis', 'Coaching Ideas', 'Misc'];
  const catTabs = categories.map(cat =>
    `<button onclick="changeCat('${cat}')" style="
      padding:3px 9px;font-size:9px;font-weight:700;border-radius:10px;cursor:pointer;
      font-family:'DM Sans',sans-serif;border:1px solid;
      background:${cat===currentNoteCategory?'var(--blue)':'var(--wh)'};
      color:${cat===currentNoteCategory?'#fff':'var(--sl)'};
      border-color:${cat===currentNoteCategory?'var(--blue)':'var(--sl-dim)'};
    ">${cat}</button>`
  ).join('');

  // Filter notes by month AND category
  const monthNotes = (GOALS_DATA.notes[currentNoteMonth] || []).filter(n => (n.category||'Analysis') === currentNoteCategory);
  const noteCards = monthNotes.map((n, i) => {
    // Get true index in full month array for lock/delete operations
    const trueIdx = (GOALS_DATA.notes[currentNoteMonth]||[]).indexOf(n);
    const bodyCls = (!notesVisible && n.censored) ? 'note-body-censored' : '';
    return `<div class="note-card ${n.locked?'locked':''}">
      <div class="note-card-hdr">
        <input class="note-title-inp" id="note-title-${trueIdx}" value="${n.title}" ${n.locked?'disabled':''} placeholder="Note title"/>
        <div class="note-actions">
          <button class="note-lock-btn ${n.locked?'locked':''}"
            onclick="toggleNoteLock('${currentNoteMonth}',${trueIdx})" title="${n.locked?'Unlock':'Lock'}">${n.locked?'&#128274;':'&#128275;'}</button>
          <button class="note-del-btn" onclick="deleteNote('${currentNoteMonth}',${trueIdx})"
            ${n.locked?'disabled':''} title="Delete note">&#10005;</button>
        </div>
      </div>
      <div class="note-body-wrap">
        <textarea class="note-body-inp ${bodyCls}" id="note-body-${trueIdx}"
          ${n.locked?'disabled':''} rows="3"
          placeholder="Write your note...">${n.body}</textarea>
      </div>
      <div class="note-meta">
        <span>${n.author} &middot; ${n.date}</span>
        ${n.censored && !notesVisible ? '<span style="color:var(--amber);font-weight:600;">&#128274; Censored</span>' : ''}
      </div>
    </div>`;
  }).join('');

  const censorBtnNote = `<button class="note-censor-btn" id="note-censor-btn"
    title="Hold 3s to toggle note visibility"
    onmousedown="startNoteReveal()" onmouseup="cancelReveal()" onmouseleave="cancelReveal()"
    ontouchstart="startNoteReveal()" ontouchend="cancelReveal()">
    ${notesVisible?'&#128065; Hide notes':'&#128274; Hold 1s'}
  </button>`;

  return `<div class="cp" style="display:flex;flex-direction:column;">
    <div class="cp-title">Store vs goal progress</div>
    <div class="cp-sub">Current % of goal achieved &middot; ${GOALS_DATA.period.from} &ndash; ${GOALS_DATA.period.to}</div>
    ${rows}
    <hr class="notes-divider"/>
    <div class="notes-toolbar">
      <div class="notes-title">&#128221; Manager notes</div>
      <select class="notes-month-sel" style="width:52px;" onchange="changeNoteYear(this.value)">${yearOpts}</select>
      <select class="notes-month-sel" style="width:106px;" onchange="changeNoteMonth(this.value)">${monthOpts}</select>
      ${censorBtnNote}
    </div>
    <div style="display:flex;gap:5px;margin-bottom:8px;">${catTabs}</div>
    <div id="note-cards-mount" style="overflow-y:auto;max-height:220px;">
      ${noteCards || '<div style="font-size:10px;color:var(--sl-lt);padding:8px 0;">No notes for this period.</div>'}
    </div>
    <button class="note-add-btn" onclick="addNote()">+ Add ${currentNoteCategory} note for ${MONTH_NAMES[parseInt(currentNoteMonth.split("-")[1])-1]} ${currentNoteYear}</button>
  </div>`;
}

// ── Performers: composite score formula ───────────────────────
// Worst = lowest composite score, Best = highest.
// Metric chips show each individual hit/miss vs goal.
// ONLY worst performer names are censored. Best are always visible.
function buildPerformers() {
  const goals  = GOALS_DATA.goals;
  const gMap   = {};
  goals.forEach(g => { gMap[g.key] = g.value; });
  const metricKeys = ['sp_pct','cust','sp_d','sp_n','pts_wk'];
  const metricLbls = {'sp_pct':'SP%','cust':'Cst','sp_d':'SP$','sp_n':'SP#','pts_wk':'Pts'};

  const censorBtn = `<button class="censor-btn" id="censor-btn"
    title="Hold 3s to reveal/hide worst performer names"
    onmousedown="startReveal()" onmouseup="cancelReveal()" onmouseleave="cancelReveal()"
    ontouchstart="startReveal()" ontouchend="cancelReveal()">
    ${namesVisible?'&#128065; Hide':'&#128274; Hold 3s'}
  </button>`;

  // Max pts for bar scaling: highest totalPts across both lists
  const allPts = [...GOALS_DATA.performers.improvement, ...GOALS_DATA.performers.best]
    .map(p => p.totalPts || 0);
  const maxPts = Math.max(...allPts) || 1;

  const makeRow = (p, type) => {
    const pts    = p.totalPts || 0;
    const barPct = (pts / maxPts * 100).toFixed(0);
    const chips  = metricKeys.map(k => {
      const hit = p[k] >= gMap[k];
      return `<span class="pr-met ${hit?'hit':'miss'}">${metricLbls[k]}</span>`;
    }).join('');
    // Weekly pts breakdown — show as small pills
    const wkPills = (p.weeklyPts||[]).map((w,i) =>
      `<span style="font-size:8px;color:var(--sl-lt);white-space:nowrap;">W${i+1}:${w}</span>`
    ).join('<span style="color:var(--sl-dim);margin:0 2px;">·</span>');
    // Only worst names/initials get censored; best always visible
    const nameCls = (type === 'worst' && !namesVisible) ? 'censored' : '';
    const initCls = (type === 'worst' && !namesVisible) ? 'style="filter:blur(3px);"' : '';
    return `<div class="perf-row" style="flex-wrap:wrap;row-gap:2px;">
      <div class="prav ${type}" ${initCls}>${p.initials}</div>
      <span class="pr-name ${nameCls}">${p.name}</span>
      <div class="pr-metrics">${chips}</div>
      <div class="pr-score ${type}" style="width:auto;min-width:42px;">${pts} pts</div>
      <div class="pr-bar-wrap" style="flex-basis:100%;margin-left:34px;margin-top:-2px;">
        <div class="pr-bar-fill ${type}" style="width:${barPct}%;"></div>
      </div>
      <div style="flex-basis:100%;margin-left:34px;display:flex;gap:4px;flex-wrap:wrap;">${wkPills}</div>
    </div>`;
  };

  const improvRows = GOALS_DATA.performers.improvement.map(p => makeRow(p,'worst')).join('');
  const bestRows   = GOALS_DATA.performers.best.map(p => makeRow(p,'best')).join('');

  return `<div style="display:flex;flex-direction:column;gap:10px;">
    <div class="cp" style="border:1.5px solid var(--red-dim);background:var(--red-lt);flex:1;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div class="cp-title" style="color:var(--red);">&#128200; Room for improvement</div>
          <div class="cp-sub" style="color:var(--red);opacity:.7;margin-bottom:0;">Total pts over period &middot; updated weekly when 7-day window closes</div>
        </div>
        ${censorBtn}
      </div>
      ${improvRows}
    </div>
    <div class="cp" style="border:1.5px solid var(--green-dim);background:var(--green-bg);flex:1;">
      <div style="margin-bottom:8px;">
        <div class="cp-title" style="color:var(--green-dk);">&#11088; Top performers</div>
        <div class="cp-sub" style="color:var(--green-dk);opacity:.7;margin-bottom:0;">Total pts over period &middot; updated weekly when 7-day window closes</div>
      </div>
      ${bestRows}
    </div>
  </div>`;
}

// ── Goal targets accordion (blue theme) ──────────────────────
// Renders 5 editable goal rows with lock/unlock per row.
// Locked rows are disabled (e.g. district-set SP $ goal).
// Save flushes inputs → GOALS_DATA.goals and POSTs to API.
// Reset discards unsaved edits by calling renderApp().
function buildGoalsAccordion() {
  const rows = GOALS_DATA.goals.map((g,i) =>
    `<div class="goal-row">
      <div class="goal-lbl">${g.label}<br><span style="font-size:9px;color:var(--sl-lt);font-weight:400;">${g.unit}</span></div>
      <input class="goal-inp" id="goal-inp-${i}" value="${fmtVal(g.value,g.fmt)}" ${g.locked?'disabled':''}/>
      <div class="goal-note">${g.note||'&nbsp;'}</div>
      <button class="goal-lock ${g.locked?'locked':'unlocked'}" onclick="toggleGoalLock(${i})">${g.locked?'&#128274;':'&#128275;'}</button>
    </div>`
  ).join('');
  return `<div class="acc-panel acc-goals" id="acc-goals">
    <div class="acc-header" onclick="toggleAcc('acc-goals')">
      <span class="acc-title">&#127919; Goal targets</span>
      <span class="acc-badge">${GOALS_DATA.goals.length}</span>
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="acc-body">
      <p class="acc-sub">Store-wide defaults. Lock any goal to prevent edits.</p>
      ${rows}
      <div style="display:flex;gap:7px;margin-top:10px;">
        <button class="btn" style="flex:1;font-size:10px;" onclick="resetGoals()">Reset</button>
        <button class="btn-sm-b" style="flex:1;" onclick="saveGoals()">Save</button>
      </div>
    </div>
  </div>`;
}

// ── Pts/wk exceptions accordion (amber theme) ────────────────
// Per-employee override for the store-default pts/wk goal.
// Used for part-time staff, seasonal hires, etc.
// Each row: name, status label, editable goal input, lock button.
// "+ Add" appends a new unlocked row to GOALS_DATA.ptsExceptions.
function buildPtsExceptionsAccordion() {
  const rows = GOALS_DATA.ptsExceptions.map((exc,i) =>
    `<div class="pte-row">
      <div><div class="pte-name">${exc.name}</div><div class="pte-status">${exc.status}</div></div>
      <input class="pte-inp" id="pte-inp-${i}" value="${exc.goal}" ${exc.locked?'disabled':''}/>
      <span style="font-size:9px;color:var(--sl);">pts/wk</span>
      <button class="pte-lock ${exc.locked?'locked':'unlocked'}" onclick="togglePteLock(${i})">${exc.locked?'&#128274;':'&#128275;'}</button>
    </div>`
  ).join('');
  return `<div class="acc-panel acc-pts" id="acc-pts">
    <div class="acc-header" onclick="toggleAcc('acc-pts')">
      <span class="acc-title">&#9889; Pts/wk exceptions</span>
      <span class="acc-badge">${GOALS_DATA.ptsExceptions.length}</span>
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="acc-body">
      <p class="acc-sub">Override default pts/wk goal per employee (part-time, seasonal, etc.).</p>
      ${rows}
      <div style="display:flex;gap:7px;margin-top:10px;">
        <button class="btn" style="flex:1;font-size:10px;" onclick="addPtsException()">+ Add</button>
        <button class="btn-sm-b" style="flex:1;" onclick="savePtsExceptions()">Save</button>
      </div>
    </div>
  </div>`;
}

// ── Point system rules accordion (slate theme) ───────────────
// Editable point values for each metric hit + weekly bonus.
// pts_wk_bonus: if the dept weekly pts/wk goal is met, every
// working day in that 7-day window earns this extra bonus.
// Changes here affect the heatmap colour thresholds on re-render.
function buildPointSystemAccordion() {
  const ps = GOALS_DATA.pointSystem;
  const fields = [
    {key:'sp_pct_pts',  label:'SP % hit (pts)'},
    {key:'cust_pts',    label:'Cust # hit (pts)'},
    {key:'sp_d_pts',    label:'SP $ hit (pts)'},
    {key:'sp_n_pts',    label:'SP # hit (pts)'},
    {key:'pts_wk_bonus',label:'Pts/wk weekly bonus (pts/day)'},
  ];
  const rows = fields.map(f =>
    `<div class="pts-sys-row">
      <div class="pts-sys-lbl">${f.label}</div>
      <input class="pts-sys-inp" id="pts-sys-${f.key}" value="${ps[f.key]}" type="number" step="0.25" min="0" max="5"/>
    </div>`
  ).join('');
  return `<div class="acc-panel acc-pts-sys" id="acc-pts-sys">
    <div class="acc-header" onclick="toggleAcc('acc-pts-sys')">
      <span class="acc-title">&#9881; Point system rules</span>
      <span class="acc-badge">${fields.length}</span>
      <span class="acc-chevron">&#9660;</span>
    </div>
    <div class="acc-body">
      <p class="acc-sub">${ps.note}</p>
      ${rows}
      <div style="display:flex;gap:7px;margin-top:10px;">
        <button class="btn-sm-b" style="flex:1;" onclick="savePointSystem()">Save</button>
      </div>
    </div>
  </div>`;
}

// ── 28-day heatmap calendar ───────────────────────────────────
// Scores each day: +1 per metric hit (sp_pct, cust, sp_d, sp_n)
//                  -0.5 per miss
//                  +1 pts_wk_bonus if weekly goal met that week
// Colour bands:
//   dark-red  < -1 pts    light-red  -1 to 0
//   light-grn  0 to 1     true-grn   1 to 4
//   gold (shimmer)        all 5 criteria met
// Hover any cell for a per-metric breakdown tooltip.
// IMPORTANT: pts_wk_hit is set retroactively at end of each
// 7-day window — cells for the current week show pts_wk_hit:false
// until that window closes.
function buildHeatmap() {
  const days    = GOALS_DATA.heatmap;
  const dayHdrs = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const startDow = new Date('2026-03-01').getDay();
  const headers = dayHdrs.map(d => `<div class="hm-day-hdr">${d}</div>`).join('');
  const blanks  = Array.from({length:startDow}, () =>
    '<div class="hm-cell" style="background:transparent;"></div>').join('');
  const cells = days.map(day => {
    const score   = scoreDay(day);
    const allFive = day.sp_pct && day.cust && day.sp_d && day.sp_n && day.pts_wk_hit;
    const cls     = scoreToClass(score, allFive);
    const pts     = score.toFixed(1);
    const tip     = `${day.date}: SP%${day.sp_pct?'✓':'✗'} Cust${day.cust?'✓':'✗'} SP$${day.sp_d?'✓':'✗'} SP#${day.sp_n?'✓':'✗'} Wk${day.pts_wk_hit?'✓':'✗'} = ${pts}pts`;
    return `<div class="hm-cell ${cls}" title="${tip}">
      <div class="hm-date">${day.date.split(' ')[1]}</div>
      <div class="hm-pts">${pts}</div>
    </div>`;
  }).join('');
  return `<div class="cp">
    <div class="cp-title">Daily performance heatmap</div>
    <div class="cp-sub">Score = daily metric hits &plusmn; misses + weekly pts/wk bonus &middot; hover for detail</div>
    <div class="hm-grid">${headers}${blanks}${cells}</div>
    <div class="hm-legend">
      <div class="hm-leg-item"><div class="hm-leg-swatch hm-dark-red"></div><span>&lt; -1 pts</span></div>
      <div class="hm-leg-item"><div class="hm-leg-swatch hm-light-red"></div><span>-1 to 0</span></div>
      <div class="hm-leg-item"><div class="hm-leg-swatch hm-light-grn"></div><span>0 to 1</span></div>
      <div class="hm-leg-item"><div class="hm-leg-swatch hm-true-grn"></div><span>&gt;1 pts</span></div>
      <div class="hm-leg-item"><div class="hm-leg-swatch hm-gold" style="width:12px;height:12px;border-radius:2px;"></div><span>All 5 met &#9733;</span></div>
    </div>
  </div>`;
}

// ================================================================
// FULL RENDER
// ================================================================


function renderApp() {
  const per    = GOALS_DATA.period;
  const misses = GOALS_DATA.goals.filter(g => GOALS_DATA.actuals[g.key] < g.value).length;
  document.getElementById('page-content').innerHTML = `
    <div class="topbar">
            <div class="tb-title">Goals &mdash; Manager View</div>
            <div class="tb-sep"></div>
            <div class="pbar">
              <div class="pnav">&#8249;</div><div class="pnav">&#8250;</div>
              <span class="pdate">${per.from} &ndash; ${per.to} (${per.label})</span>
              <div class="ppills">
                ${window.GS.buildPills(currentPeriod, 'GoalsPage.setPeriod', isRecUpload)}
              </div>
            </div>
            <div class="tb-r"><button class="btn-b" onclick="saveGoals()">Save goals</button></div>
          </div>
          <div class="content">
            <div class="ctx" style="background:linear-gradient(90deg,#7A2020,var(--red));">
              <span class="ctx-lbl" style="color:rgba(255,255,255,.5);">Goal status</span>
              <span class="ctx-val" style="color:#FFD0D0;">${misses} of 5 metrics below goal &middot; ${5-misses} met &middot; ${per.from} &ndash; ${per.to}</span>
              <span style="color:rgba(255,255,255,.25);">&middot;</span>
              <span class="ctx-note" style="color:rgba(255,210,210,.5);">Goals shown as red line in bar/line charts &middot; red ring in radar</span>
            </div>
            ${buildSummaryCards()}
            <div class="three-col">
              <div id="progress-notes-mount">${buildProgressBarsAndNotes()}</div>
              ${buildPerformers()}
              <div class="side-panel">
                <div id="acc-goals-mount">${buildGoalsAccordion()}</div>
                <div id="acc-pts-mount">${buildPtsExceptionsAccordion()}</div>
                <div id="acc-pts-sys-mount">${buildPointSystemAccordion()}</div>
              </div>
            </div>
            ${buildHeatmap()}
          </div>`;
}

// ================================================================
// INTERACTIVITY
// ================================================================

function toggleAcc(id) { document.getElementById(id).classList.toggle('open'); }

// ── Goal accordion ────────────────────────────────────────────
function flushGoalInputs() {
  GOALS_DATA.goals.forEach((g,i) => {
    if (g.locked) return;
    const inp = document.getElementById('goal-inp-' + i);
    if (!inp) return;
    const num = parseFloat(inp.value.replace(/[$%]/g,'').trim());
    if (!isNaN(num)) g.value = num;
  });
}
function toggleGoalLock(i) {
  flushGoalInputs();
  GOALS_DATA.goals[i].locked = !GOALS_DATA.goals[i].locked;
  const wasOpen = document.getElementById('acc-goals').classList.contains('open');
  document.getElementById('acc-goals-mount').innerHTML = buildGoalsAccordion();
  if (wasOpen) document.getElementById('acc-goals').classList.add('open');
}
function saveGoals() {
  flushGoalInputs();
  // fetch('/api/goals/141', { method:'POST', body:JSON.stringify({goals:GOALS_DATA.goals}) });
  renderApp();
}
function resetGoals() { renderApp(); }

// ── Pts exceptions accordion ──────────────────────────────────
function togglePteLock(i) {
  GOALS_DATA.ptsExceptions.forEach((exc,j) => {
    const inp = document.getElementById('pte-inp-'+j);
    if (inp && !exc.locked) exc.goal = parseFloat(inp.value) || exc.goal;
  });
  GOALS_DATA.ptsExceptions[i].locked = !GOALS_DATA.ptsExceptions[i].locked;
  const wasOpen = document.getElementById('acc-pts').classList.contains('open');
  document.getElementById('acc-pts-mount').innerHTML = buildPtsExceptionsAccordion();
  if (wasOpen) document.getElementById('acc-pts').classList.add('open');
}
function addPtsException() {
  GOALS_DATA.ptsExceptions.push({name:'New employee',status:'',goal:7.0,locked:false});
  const wasOpen = document.getElementById('acc-pts').classList.contains('open');
  document.getElementById('acc-pts-mount').innerHTML = buildPtsExceptionsAccordion();
  if (wasOpen) document.getElementById('acc-pts').classList.add('open');
}
function savePtsExceptions() {
  GOALS_DATA.ptsExceptions.forEach((exc,i) => {
    const inp = document.getElementById('pte-inp-'+i);
    if (inp && !exc.locked) exc.goal = parseFloat(inp.value) || exc.goal;
  });
  // fetch('/api/pts-exceptions/141', { method:'POST', body:JSON.stringify(GOALS_DATA.ptsExceptions) });
}
function savePointSystem() {
  ['sp_pct_pts','cust_pts','sp_d_pts','sp_n_pts','pts_wk_bonus'].forEach(k => {
    const inp = document.getElementById('pts-sys-'+k);
    if (inp) GOALS_DATA.pointSystem[k] = parseFloat(inp.value) || GOALS_DATA.pointSystem[k];
  });
  // fetch('/api/point-system/141', { method:'POST', body:JSON.stringify(GOALS_DATA.pointSystem) });
}

// ── Notes ─────────────────────────────────────────────────────
// Year select: update year, then default month to Jan of that year
// (or keep current month number if it makes sense)
function changeNoteYear(year) {
  currentNoteYear = year;
  // Keep the same month number but move to new year
  const mm = currentNoteMonth.split('-')[1] || '01';
  currentNoteMonth = `${year}-${mm}`;
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}
function changeNoteMonth(month) {
  currentNoteMonth = month;
  // Keep year in sync
  currentNoteYear = month.split('-')[0];
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}
function changeCat(cat) {
  currentNoteCategory = cat;
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}

function flushNoteInputs() {
  const notes = GOALS_DATA.notes[currentNoteMonth] || [];
  notes.forEach((n, i) => {
    if (n.locked) return;
    const tInp = document.getElementById('note-title-' + i);
    const bInp = document.getElementById('note-body-'  + i);
    if (tInp) n.title = tInp.value;
    if (bInp) n.body  = bInp.value;
  });
}

function toggleNoteLock(month, i) {
  flushNoteInputs();
  GOALS_DATA.notes[month][i].locked = !GOALS_DATA.notes[month][i].locked;
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}

function deleteNote(month, i) {
  flushNoteInputs();
  GOALS_DATA.notes[month].splice(i, 1);
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}

function addNote() {
  flushNoteInputs();
  if (!GOALS_DATA.notes[currentNoteMonth]) GOALS_DATA.notes[currentNoteMonth] = [];
  const newId = Date.now();
  GOALS_DATA.notes[currentNoteMonth].push({
    id: newId, title: 'New note', body: '',
    locked: false, author: GOALS_DATA.manager,
    date: GOALS_DATA.period.to, censored: true, category: currentNoteCategory
  });
  document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
}

// ── Hold-to-reveal ───────────────────────────────────────────
// Two hold buttons share a single holdTimer.
// Performers: hold 3s to blur/unblur worst-performer names + initials.
// Notes:      hold 1s to blur/unblur note body text.
// cancelReveal() clears the timer and removes amber glow from any button.
// Only one hold action can be in flight at a time.

function startReveal() {
  // Visual glow while holding
  const btn = document.getElementById('censor-btn');
  if (btn) btn.classList.add('glowing');
  holdTimer = setTimeout(() => {
    namesVisible = !namesVisible;
    renderApp();
  }, 3000);
}

function startNoteReveal() {
  const btn = document.getElementById('note-censor-btn');
  if (btn) btn.classList.add('glowing');
  holdTimer = setTimeout(() => {
    notesVisible = !notesVisible;
    document.getElementById('progress-notes-mount').innerHTML = buildProgressBarsAndNotes();
  }, 1000);
}

function cancelReveal() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  // Remove glow from any hold button
  ['censor-btn','note-censor-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('glowing');
  });
}

// Boot

// DB refresh pattern documented in data contract block above.

  window.toggleGoalLock = toggleGoalLock;
  window.saveGoals = saveGoals;
  window.resetGoals = resetGoals;
  window.flushGoalInputs = flushGoalInputs;
  window.toggleAcc = toggleAcc;
  window.toggleNoteLock = toggleNoteLock;
  window.deleteNote = deleteNote;
  window.addNote = addNote;
  window.changeNoteYear = changeNoteYear;
  window.changeNoteMonth = changeNoteMonth;
  window.changeCat = changeCat;
  window.startReveal = startReveal;
  window.startNoteReveal = startNoteReveal;
  window.cancelReveal = cancelReveal;
  window.togglePteLock = togglePteLock;
  window.addPtsException = addPtsException;
  window.savePtsExceptions = savePtsExceptions;
  window.savePointSystem = savePointSystem;
  return {
    init: function(params) {
      renderApp();
    },
    getData: function() { return DATA; },
    renderApp: renderApp,
    setPeriod: setPeriod
  };
})();
window.GoalsPage.setPeriod = window.GoalsPage.setPeriod;

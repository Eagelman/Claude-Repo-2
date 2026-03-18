window.Overview = (function() {
  let DATA = {
  "period": {
    "label": "2 weeks",
    "from": "March 1, 2026",
    "to": "March 14, 2026",
    "days": 10,
    "records": 148
  },
  "summary": [
    {
      "label": "Store Mean SP %",   "medianLabel": "Store Median SP %",
      "value": "1.84%",             "medianValue": "1.81%",
      "trend": "+0.12%",            "medianTrend": "+0.09%",
      "trendDir": "up",
      "goal": "1.80%",
      "goalMet": true,              "medianGoalMet": true
    },
    {
      "label": "Store Mean Cust #", "medianLabel": "Store Median Cust #",
      "value": "42",                "medianValue": "41",
      "trend": "+4",               "medianTrend": "+3",
      "trendDir": "up",
      "goal": "40",
      "goalMet": true,             "medianGoalMet": true
    },
    {
      "label": "Store Mean SP $",   "medianLabel": "Store Median SP $",
      "value": "$199",              "medianValue": "$194",
      "trend": "+$14",             "medianTrend": "+$10",
      "trendDir": "up",
      "goal": "$250",
      "goalMet": false,            "medianGoalMet": false
    },
    {
      "label": "Store Mean SP #",   "medianLabel": "Store Median SP #",
      "value": "4.9",              "medianValue": "4.7",
      "trend": "-0.2",             "medianTrend": "-0.3",
      "trendDir": "down",
      "goal": "6",
      "goalMet": false,            "medianGoalMet": false
    }
  ],
  "charts": {
    "sp_pct": {
      "label": "SP %",
      "values": [
        1.66,
        1.7,
        1.72,
        1.68,
        1.76,
        1.78,
        1.8,
        1.83,
        1.85,
        1.88
      ],
      "yMin": 1.4,
      "yMax": 2.1,
      "goalVal": 1.8,
      "meanVal": 1.84,
      "medianVal": 1.81,
      "yFmt": "decimal2",
      "yTicks": [
        "2.10",
        "1.95",
        "1.80",
        "1.65",
        "1.50",
        "1.40"
      ]
    },
    "cust": {
      "label": "Cust #",
      "values": [
        35,
        37,
        39,
        36,
        40,
        39,
        42,
        43,
        45,
        47
      ],
      "yMin": 30,
      "yMax": 50,
      "goalVal": 40,
      "meanVal": 42,
      "medianVal": 41,
      "yFmt": "int",
      "yTicks": [
        "50",
        "46",
        "42",
        "38",
        "34",
        "30"
      ]
    },
    "sp_d": {
      "label": "SP $",
      "values": [
        165,
        170,
        178,
        168,
        182,
        185,
        192,
        200,
        208,
        215
      ],
      "yMin": 140,
      "yMax": 260,
      "goalVal": 250,
      "meanVal": 199,
      "medianVal": 194,
      "yFmt": "dollar",
      "yTicks": [
        "$260",
        "$236",
        "$212",
        "$188",
        "$164",
        "$140"
      ]
    },
    "sp_n": {
      "label": "SP #",
      "values": [
        4.3,
        4.5,
        4.7,
        4.4,
        4.8,
        4.9,
        5.0,
        5.2,
        5.4,
        5.5
      ],
      "yMin": 3,
      "yMax": 7,
      "goalVal": 6,
      "meanVal": 4.9,
      "medianVal": 4.7,
      "yFmt": "decimal1",
      "yTicks": [
        "7",
        "6.2",
        "5.4",
        "4.6",
        "3.8",
        "3"
      ]
    }
  }
};
  var CHART_DATA = DATA;
  let currentMode = 'mean';

 // 'mean' | 'median'

  function setMM(mode) {
    if (currentMode === mode) return;
    currentMode = mode;
    renderApp('bar');
    document.querySelectorAll('.mm-btn').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.mode === mode);
    });
    document.querySelectorAll('.leg-label.gold').forEach(el => {
      el.textContent = mode === 'mean' ? 'Period mean' : 'Period median';
    });
  }

  // ── Coordinate helpers ──────────────────────────────────────
  function toY(val, yMin, yMax) {
    return (1 - (val - yMin) / (yMax - yMin)) * 100;
  }

  function polyPts(xArr, yArr) {
    return xArr.map((x, i) => `${x.toFixed(2)},${yArr[i].toFixed(2)}`).join(' ');
  }

  function fillPts(xArr, yArr) {
    return polyPts(xArr, yArr) +
      ` ${xArr[xArr.length-1].toFixed(2)},100 ${xArr[0].toFixed(2)},100`;
  }

  // ── X-position calculators ───────────────────────────────────
  function lineXPositions(n) {
    return Array.from({length: n}, (_, i) => (n === 1) ? 50 : (i / (n - 1)) * 100);
  }

  function barXCenters(n) {
    return Array.from({length: n}, (_, i) => (i + 0.5) / n * 100);
  }

  // ── SVG builders ─────────────────────────────────────────────
  function buildBarSVG(chartKey, uid) {
    const c = CHART_DATA.charts[chartKey];
    const n = c.values.length;
    const xs = barXCenters(n);
    const bw = (100 / n) * 0.85;

    const goalY = toY(c.goalVal, c.yMin, c.yMax).toFixed(2);
    const refVal = currentMode === 'median' ? c.medianVal : c.meanVal;
    const meanY = toY(refVal, c.yMin, c.yMax).toFixed(2);

    const grids = [0,20,40,60,80,100].map(v =>
      `<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="#CBD5E1" stroke-width="0.4" opacity="0.4"/>`
    ).join('');

    const yrule = `<line x1="0" y1="0" x2="0" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
    const xrule = `<line x1="0" y1="100" x2="100" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
    const clip = `<clipPath id="c${uid}"><rect x="0" y="0" width="100" height="100"/></clipPath>`;

    const bars = c.values.map((val, i) => {
      const by = toY(val, c.yMin, c.yMax).toFixed(2);
      const bh = (100 - parseFloat(by)).toFixed(2);
      const bx = (xs[i] - bw/2).toFixed(2);
      return `<rect x="${bx}" y="${by}" width="${bw.toFixed(2)}" height="${bh}" fill="#2563EB" opacity="0.85" clip-path="url(#c${uid})"/>`;
    }).join('');

    const goalLine = `<line x1="0" y1="${goalY}" x2="100" y2="${goalY}" stroke="#B91C1C" stroke-width="1.2" stroke-dasharray="2.5,1.5" clip-path="url(#c${uid})"/>`;
    const meanLine = `<line x1="0" y1="${meanY}" x2="100" y2="${meanY}" stroke="#D97706" stroke-width="1.4" opacity="0.95" clip-path="url(#c${uid})"/>`;

    const ticks = xs.map(x =>
      `<line x1="${x.toFixed(2)}" y1="100" x2="${x.toFixed(2)}" y2="104" stroke="#94A3B8" stroke-width="0.5"/>`
    ).join('');

    return `<svg width="100%" height="160" viewBox="0 0 100 106" preserveAspectRatio="none" style="display:block;">
      <defs>${clip}</defs>
      ${grids}${yrule}${bars}${xrule}${goalLine}${meanLine}${ticks}
    </svg>`;
  }

  function buildLineSVG(chartKey, uid) {
    const c = CHART_DATA.charts[chartKey];
    const n = c.values.length;
    const xs = lineXPositions(n);
    const ys = c.values.map(v => toY(v, c.yMin, c.yMax));

    const goalY = toY(c.goalVal, c.yMin, c.yMax).toFixed(2);
    const refVal = currentMode === 'median' ? c.medianVal : c.meanVal;
    const meanY = toY(refVal, c.yMin, c.yMax).toFixed(2);

    const grids = [0,20,40,60,80,100].map(v =>
      `<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="#CBD5E1" stroke-width="0.4" opacity="0.45"/>`
    ).join('');

    const yrule = `<line x1="0" y1="0" x2="0" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
    const xrule = `<line x1="0" y1="100" x2="100" y2="100" stroke="#CBD5E1" stroke-width="0.5"/>`;
    const wkSep = `<line x1="50" y1="0" x2="50" y2="100" stroke="#CBD5E1" stroke-width="0.3" stroke-dasharray="1.5,1" opacity="0.5"/>`;

    const clip = `<clipPath id="c${uid}"><rect x="0" y="0" width="100" height="100"/></clipPath>`;
    const grad = `<linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2563EB" stop-opacity="0.20"/>
      <stop offset="80%"  stop-color="#2563EB" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
    </linearGradient>`;

    const fill = `<polygon points="${fillPts(xs, ys)}" fill="url(#g${uid})" clip-path="url(#c${uid})"/>`;
    const line = `<polyline points="${polyPts(xs, ys)}" fill="none" stroke="#2563EB" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#c${uid})"/>`;

    const goalLine = `<line x1="0" y1="${goalY}" x2="100" y2="${goalY}" stroke="#B91C1C" stroke-width="1.2" stroke-dasharray="2.5,1.5" clip-path="url(#c${uid})"/>`;
    const meanLine = `<line x1="0" y1="${meanY}" x2="100" y2="${meanY}" stroke="#D97706" stroke-width="1.4" opacity="0.95" clip-path="url(#c${uid})"/>`;

    const ticks = xs.map(x =>
      `<line x1="${x.toFixed(2)}" y1="100" x2="${x.toFixed(2)}" y2="104" stroke="#94A3B8" stroke-width="0.5"/>`
    ).join('');

    return `<svg width="100%" height="160" viewBox="0 0 100 106" preserveAspectRatio="none" style="display:block;">
      <defs>${grad}${clip}</defs>
      ${grids}${yrule}${wkSep}${fill}${line}${xrule}${goalLine}${meanLine}${ticks}
    </svg>`;
  }

  // ── Y-axis label column ──────────────────────────────────────
  function buildYAxis(chartKey) {
    const ticks = CHART_DATA.charts[chartKey].yTicks;
    const n = ticks.length;
    const spans = ticks.map((label, i) => {
      const topPct = (i / (n - 1)) * 100;
      return `<span style="top:${topPct.toFixed(1)}%">${label}</span>`;
    }).join('');
    return `<div class="y-col">${spans}</div>`;
  }

  // ── Chart panel ──────────────────────────────────────────────
  function buildChart(chartKey, uid, chartType) {
    const c = CHART_DATA.charts[chartKey];
    const svg = chartType === 'bar' ? buildBarSVG(chartKey, uid) : buildLineSVG(chartKey, uid);
    const goalLabel = chartType === 'bar'
      ? `${c.goalVal} (dotted red)`
      : `${c.goalVal} (red dotted)`;
    return `
      <div class="cp">
        <div class="cp-title">${c.label} &middot; Daily mean &middot; 2 weeks</div>
        <div class="cp-sub">March 1&ndash;14 &middot; Goal: ${goalLabel} &middot; Mean: ${c.meanVal} (gold)</div>
        <div style="display:flex;align-items:flex-start;gap:0;">
          ${buildYAxis(chartKey)}
          <div style="flex:1;min-width:0;">
            ${svg}
            <div class="chart-date">
              ${CHART_DATA.period.from.replace(', 2026','')}&nbsp;&ndash;&nbsp;${CHART_DATA.period.to}
            </div>
          </div>
        </div>
      </div>`;
  }

  // ── Legend ───────────────────────────────────────────────────
  function buildLegend(chartType) {
    const chartSwatch = chartType === 'bar'
      ? `<div style="width:14px;height:13px;background:#2563EB;border-radius:0;flex-shrink:0;opacity:0.85;"></div>`
      : `<svg width="28" height="13" viewBox="0 0 28 13" style="flex-shrink:0;">
           <defs>
             <linearGradient id="leg-grad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%"   stop-color="#2563EB" stop-opacity=".28"/>
               <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
             </linearGradient>
           </defs>
           <polygon points="0,7 28,7 28,13 0,13" fill="url(#leg-grad)"/>
           <line x1="0" y1="7" x2="28" y2="7" stroke="#2563EB" stroke-width="2.5"/>
         </svg>`;
    return `
      <div class="legend-bar">
        <span class="leg-section-lbl">Chart</span>
        <div class="leg-item">
          ${chartSwatch}
          <span class="leg-label blue">Daily mean</span>
        </div>
        <div class="leg-sep"></div>
        <span class="leg-section-lbl">References</span>
        <div class="leg-item">
          <div style="width:20px;border-top:2.5px dotted #B91C1C;flex-shrink:0;"></div>
          <span class="leg-label red">Goal target</span>
        </div>
        <div class="leg-item">
          <div style="width:20px;height:2.5px;background:linear-gradient(90deg,#F59E0B,#D97706,#F59E0B);flex-shrink:0;border-radius:1px;"></div>
          <span class="leg-label gold">Period mean</span>
        </div>
        <span class="leg-note">Goal only in legend &mdash; not labeled on chart</span>
        <div class="mm-toggle">
          <button class="mm-btn on" data-mode="mean" onclick="setMM('mean')">Mean</button>
          <button class="mm-btn" data-mode="median" onclick="setMM('median')">Median</button>
        </div>
      </div>`;
  }

  // ── Summary stat cards ───────────────────────────────────────
  function buildCards() {
    return `<div class="sc-row">${
      CHART_DATA.summary.map(s => {
        const isMedian  = currentMode === 'median';
        const label     = isMedian ? s.medianLabel : s.label;
        const value     = isMedian ? s.medianValue : s.value;
        const trend     = isMedian ? s.medianTrend : s.trend;
        const goalMet   = isMedian ? s.medianGoalMet : s.goalMet;
        const goalClass = goalMet ? 'hit' : 'miss';
        const goalIcon  = goalMet ? '&#10003;' : '&#10007;';
        const indClass  = s.trendDir === 'up' ? 'si-up' : 'si-dn';
        const indIcon   = s.trendDir === 'up' ? '&#8593;' : '&#8595;';
        const cardClass = goalMet ? 'above' : 'below';
        return `
          <div class="sc ${cardClass}">
            <div class="sc-lbl">${label}</div>
            <div class="sc-vrow">
              <div class="sc-val">${value}</div>
              <span class="sc-ind ${indClass}">${indIcon} ${trend}</span>
            </div>
            <div class="sc-note">vs prior 2w: ${s.prior || '&mdash;'}</div>
            <div class="sc-goal ${goalClass}">${goalIcon} ${goalMet ? 'Above' : 'Below'} goal (${s.goal})</div>
          </div>`;
      }).join('')
    }</div>`;
  }

  // ── Context strip ────────────────────────────────────────────
  function buildCtx() {
    const p = CHART_DATA.period;
    return `
      <div class="ctx">
        <span class="ctx-period">${p.label}</span>
        <span class="ctx-range">${p.from} &ndash; ${p.to} (Mon&ndash;Fri)</span>
        <span class="ctx-dot">&middot;</span>
        <span class="ctx-detail">${p.days} days &middot; ${p.records} records &middot; all employees</span>
      </div>`;
  }

  // ── Topbar ───────────────────────────────────────────────────
  function buildTopbar(activeChart) {
    const p = CHART_DATA.period;
    const bOn = activeChart === 'bar'  ? ' on' : '';
    const lOn = activeChart === 'line' ? ' on' : '';
    return `
      <div class="topbar">
        <div class="tb-title">Overview</div>
        <div class="tb-sep"></div>
        <div class="pbar">
          <div class="pnav">&#8249;</div>
          <div class="pnav">&#8250;</div>
          <span class="pdate">Mar 1&ndash;14, 2026 (2w)</span>
          <div class="ppills">
            <button class="pp rec">Rec.Upload</button>
            <div class="pdiv"></div>
            <button class="pp">3d</button><button class="pp">5d</button>
            <div class="pdiv"></div>
            <button class="pp">1w</button><button class="pp on">2w</button>
            <button class="pp">4w</button><button class="pp">8w</button>
            <button class="pp">12w</button><button class="pp">18w</button>
            <button class="pp">26w</button><button class="pp">34w</button>
            <button class="pp">48w</button><button class="pp">1yr</button>
            <div class="pdiv"></div>
            <button class="pp cp">Custom &#10022;</button>
          </div>
        </div>
      </div>`;
  }

  function renderApp(chartType) {
    chartType = chartType || 'bar';
    const el = document.getElementById('page-content');
    if (!el) return;

    const charts = Object.keys(CHART_DATA.charts);
    const [k0, k1, k2, k3] = charts;

    el.innerHTML = `
      <div class="topbar">
        <div class="tb-title">Overview</div>
        <div class="tb-sep"></div>
        <div class="pbar">
          <div class="pnav">&#8249;</div>
          <div class="pnav">&#8250;</div>
          <span class="pdate">Mar 1&ndash;14, 2026 (2w)</span>
          <div class="ppills">
            <button class="pp rec">Rec.Upload</button>
            <div class="pdiv"></div>
            <button class="pp">3d</button><button class="pp">5d</button>
            <div class="pdiv"></div>
            <button class="pp">1w</button><button class="pp on">2w</button>
            <button class="pp">4w</button><button class="pp">8w</button>
            <button class="pp">12w</button><button class="pp">18w</button>
            <button class="pp">26w</button><button class="pp">34w</button>
            <button class="pp">48w</button><button class="pp">1yr</button>
            <div class="pdiv"></div>
            <button class="pp cp">Custom &#10022;</button>
          </div>
        </div>
      </div>
      <div class="content">
        ${buildCtx()}
        ${buildLegend(chartType)}
        ${buildCards()}
        <div class="chart-grid-2">
          ${buildChart(k0, chartType + k0, chartType)}
          ${buildChart(k1, chartType + k1, chartType)}
        </div>
        <div class="chart-grid-2">
          ${buildChart(k2, chartType + k2, chartType)}
          ${buildChart(k3, chartType + k3, chartType)}
        </div>
      </div>`;
  }

  window.setMM = setMM;

  return {
    init: function(params) {
      renderApp('bar');
    },
    getData: function() { return DATA; },
    renderApp: renderApp
  };
})();

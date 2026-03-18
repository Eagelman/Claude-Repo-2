/**
 * GS Report Analytics - Shared chart rendering utilities.
 * Canvas-based chart drawing used across Overview, Employee, and Compare pages.
 */
window.GS = window.GS || {};

/**
 * Draw a line chart on a canvas element.
 * @param {string} canvasId - The canvas element ID
 * @param {Object} opts - Chart options
 * @param {number[]} opts.values - Data points
 * @param {string[]} [opts.labels] - X-axis labels
 * @param {number} opts.yMin - Y-axis minimum
 * @param {number} opts.yMax - Y-axis maximum
 * @param {number} [opts.goalVal] - Goal reference line value
 * @param {number} [opts.meanVal] - Mean reference line value
 * @param {number} [opts.medianVal] - Median reference line value
 * @param {string} [opts.yFmt] - Y-axis format ('pct','int','dollar','decimal2')
 * @param {string} [opts.lineColor] - Line color (default: blue)
 */
window.GS.drawLineChart = function (canvasId, opts) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var pad = { top: 20, right: 20, bottom: 30, left: 50 };
  var cw = W - pad.left - pad.right;
  var ch = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  var vals = opts.values || [];
  if (vals.length === 0) return;

  var yMin = opts.yMin !== undefined ? opts.yMin : Math.min.apply(null, vals);
  var yMax = opts.yMax !== undefined ? opts.yMax : Math.max.apply(null, vals);
  if (yMax === yMin) { yMax += 1; yMin -= 1; }

  function yPos(v) { return pad.top + ch - ((v - yMin) / (yMax - yMin)) * ch; }
  function xPos(i) { return pad.left + (i / Math.max(vals.length - 1, 1)) * cw; }

  // Grid lines
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 0.5;
  for (var t = 0; t <= 4; t++) {
    var gy = pad.top + (t / 4) * ch;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
    // Y labels
    var gv = yMax - (t / 4) * (yMax - yMin);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px "DM Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(window.GS.fmtVal(gv, opts.yFmt || 'dec1'), pad.left - 6, gy + 3);
  }

  // Goal line (red dashed)
  if (opts.goalVal !== undefined && opts.goalVal >= yMin && opts.goalVal <= yMax) {
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yPos(opts.goalVal));
    ctx.lineTo(W - pad.right, yPos(opts.goalVal));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Mean line (gold)
  if (opts.meanVal !== undefined && opts.meanVal >= yMin && opts.meanVal <= yMax) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, yPos(opts.meanVal));
    ctx.lineTo(W - pad.right, yPos(opts.meanVal));
    ctx.stroke();
  }

  // Median line (blue dashed)
  if (opts.medianVal !== undefined && opts.medianVal >= yMin && opts.medianVal <= yMax) {
    ctx.strokeStyle = '#1652E8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yPos(opts.medianVal));
    ctx.lineTo(W - pad.right, yPos(opts.medianVal));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Data line
  ctx.strokeStyle = opts.lineColor || '#1652E8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  vals.forEach(function (v, i) {
    if (i === 0) ctx.moveTo(xPos(i), yPos(v));
    else ctx.lineTo(xPos(i), yPos(v));
  });
  ctx.stroke();

  // Data points
  ctx.fillStyle = opts.lineColor || '#1652E8';
  vals.forEach(function (v, i) {
    ctx.beginPath();
    ctx.arc(xPos(i), yPos(v), 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // X labels
  if (opts.labels) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '8px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    opts.labels.forEach(function (lbl, i) {
      ctx.fillText(lbl, xPos(i), H - 5);
    });
  }
};

/**
 * Draw a horizontal bar chart.
 * @param {string} canvasId - Canvas element ID
 * @param {Object[]} bars - Array of { label, value, color }
 * @param {Object} opts - { yMin, yMax, goalVal }
 */
window.GS.drawBarChart = function (canvasId, bars, opts) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  if (!bars || bars.length === 0) return;

  var pad = { top: 10, right: 20, bottom: 10, left: 80 };
  var cw = W - pad.left - pad.right;
  var ch = H - pad.top - pad.bottom;
  var barH = Math.min(20, ch / bars.length - 4);
  var maxVal = opts.yMax || Math.max.apply(null, bars.map(function(b) { return b.value; }));

  bars.forEach(function (bar, i) {
    var y = pad.top + i * (barH + 4);
    var bw = (bar.value / maxVal) * cw;

    // Label
    ctx.fillStyle = '#0B1220';
    ctx.font = '10px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(bar.label, pad.left - 6, y + barH / 2 + 3);

    // Bar
    ctx.fillStyle = bar.color || '#1652E8';
    ctx.beginPath();
    ctx.roundRect(pad.left, y, Math.max(bw, 2), barH, 3);
    ctx.fill();

    // Value
    ctx.fillStyle = '#64748B';
    ctx.font = '9px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(window.GS.fmtVal(bar.value, opts.fmt || 'dec1'), pad.left + bw + 6, y + barH / 2 + 3);
  });

  // Goal line
  if (opts.goalVal) {
    var gx = pad.left + (opts.goalVal / maxVal) * cw;
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(gx, pad.top);
    ctx.lineTo(gx, H - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

/**
 * Draw a radar/spider chart.
 * @param {string} canvasId - Canvas element ID
 * @param {Object} opts
 * @param {Object[]} opts.axes - Array of { label, values: { emp, avg, median, goal } }
 * @param {number} opts.maxVal - Maximum value for normalization
 */
window.GS.drawRadarChart = function (canvasId, opts) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var cx = W / 2;
  var cy = H / 2;
  var R = Math.min(cx, cy) - 40;

  ctx.clearRect(0, 0, W, H);

  var axes = opts.axes || [];
  var n = axes.length;
  if (n < 3) return;

  var maxVal = opts.maxVal || 100;

  function angleFor(i) { return (Math.PI * 2 * i) / n - Math.PI / 2; }
  function point(i, val) {
    var a = angleFor(i);
    var r = (val / maxVal) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  // Grid rings
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 0.5;
  for (var ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var p = point(i % n, maxVal * ring / 4);
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }

  // Axis lines
  for (var i = 0; i < n; i++) {
    var p = point(i, maxVal);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); ctx.stroke();
    // Labels
    var lp = point(i, maxVal * 1.15);
    ctx.fillStyle = '#0B1220';
    ctx.font = '10px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(axes[i].label, lp[0], lp[1] + 4);
  }

  // Draw polygon helper
  function drawPoly(key, color, alpha, dash) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dash || []);
    ctx.fillStyle = color.replace(')', ',' + alpha + ')').replace('rgb', 'rgba');
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var val = axes[i % n].values[key] || 0;
      var p = point(i % n, val);
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw layers (back to front)
  if (axes[0].values.goal !== undefined) drawPoly('goal', 'rgb(185,28,28)', 0.05, [4, 3]);
  if (axes[0].values.median !== undefined) drawPoly('median', 'rgb(22,82,232)', 0.05, [3, 3]);
  if (axes[0].values.avg !== undefined) drawPoly('avg', 'rgb(245,158,11)', 0.08);
  drawPoly('emp', 'rgb(22,82,232)', 0.15);
};

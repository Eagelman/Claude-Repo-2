/**
 * GS Report Analytics - Shared formatting utilities.
 * Used across all pages for consistent number/date display.
 */
window.GS = window.GS || {};

/**
 * Format a value according to its metric type.
 * @param {number} val - The numeric value
 * @param {string} fmt - Format type: 'pct', 'dec1', 'dollar', 'int', 'decimal2'
 * @returns {string} Formatted string
 */
window.GS.fmtVal = function (val, fmt) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (fmt === 'pct' || fmt === 'decimal2') return parseFloat(val).toFixed(2) + '%';
  if (fmt === 'dec1') return parseFloat(val).toFixed(1);
  if (fmt === 'dollar') return '$' + Math.round(val);
  return Math.round(val).toString();
};

/**
 * Format a date string for display.
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} [style='short'] - 'short' (Mar 14), 'long' (March 14, 2026), 'iso' (2026-03-14)
 * @returns {string} Formatted date
 */
window.GS.fmtDate = function (dateStr, style) {
  if (!dateStr) return '';
  if (style === 'iso') return dateStr;
  var d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var longMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (style === 'long') {
    return longMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  return months[d.getMonth()] + ' ' + d.getDate();
};

/**
 * Get the day name abbreviation from a date.
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} e.g., 'Mon', 'Tue'
 */
window.GS.dayName = function (dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
};

/**
 * Calculate the number of days between two dates.
 * @param {string} from - YYYY-MM-DD
 * @param {string} to - YYYY-MM-DD
 * @returns {number}
 */
window.GS.daysBetween = function (from, to) {
  var a = new Date(from + 'T00:00:00');
  var b = new Date(to + 'T00:00:00');
  return Math.round((b - a) / 86400000);
};

// ============================================================================
// Period Management — shared across all pages with period pills
// ============================================================================

/**
 * Map period pill labels to number of days.
 */
window.GS.PERIOD_DAYS = {
  '3d': 3, '5d': 5,
  '1w': 7, '2w': 14, '4w': 28, '8w': 56, '12w': 84,
  '18w': 126, '26w': 182, '34w': 238, '48w': 336, '1yr': 365
};

/**
 * Current period state for each page module.
 * Keys are module names, values are { period, from, to, isRecUpload }.
 */
window.GS._periodState = {};

/**
 * Compute from/to dates for a period label, ending today.
 * @param {string} period - e.g. '2w', '4w', 'rec'
 * @returns {{ from: string, to: string, label: string, days: number }}
 */
window.GS.computePeriod = function (period) {
  var today = new Date();
  var to = today.toISOString().slice(0, 10);
  var days = window.GS.PERIOD_DAYS[period] || 14;
  var fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - days + 1);
  var from = fromDate.toISOString().slice(0, 10);
  return {
    from: from,
    to: to,
    label: period,
    days: days
  };
};

/**
 * Build period pills HTML with onclick wired to a global handler.
 * @param {string} activePeriod - The currently active period label
 * @param {string} handlerName - The global function to call, e.g. 'OverviewPage.setPeriod'
 * @param {boolean} [isRecUpload] - Whether Rec.Upload is the active selection
 * @returns {string} HTML string for the pills
 */
window.GS.buildPills = function (activePeriod, handlerName, isRecUpload) {
  var pills = ['3d','5d','1w','2w','4w','8w','12w','18w','26w','34w','48w','1yr'];
  var recClass = isRecUpload ? 'pp rec on' : 'pp rec';
  var html = '<button class="' + recClass + '" onclick="' + handlerName + '(\'rec\')">' + 'Rec.Upload</button><div class="pdiv"></div>';
  pills.forEach(function (p, i) {
    if (i === 2) html += '<div class="pdiv"></div>';
    var cls = (!isRecUpload && activePeriod === p) ? 'pp on' : 'pp';
    html += '<button class="' + cls + '" onclick="' + handlerName + '(\'' + p + '\')">' + p + '</button>';
  });
  html += '<div class="pdiv"></div><button class="pp cp">Custom &#10022;</button>';
  return html;
};

/**
 * Format a period range for display in the pdate element.
 * @param {string} from - YYYY-MM-DD
 * @param {string} to - YYYY-MM-DD
 * @param {string} label - Period label
 * @returns {string}
 */
window.GS.fmtPeriodRange = function (from, to, label) {
  return window.GS.fmtDate(from) + ' \u2013 ' + window.GS.fmtDate(to) + ' (' + label + ')';
};

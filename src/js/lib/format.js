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

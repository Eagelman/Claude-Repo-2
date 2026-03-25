/**
 * bridge.js — Tauri IPC bridge for GS Extractor
 *
 * This module connects the original HTML pages to the Tauri/SQLite backend.
 * It provides:
 *   1. invoke() wrapper for Tauri commands
 *   2. Period management (date range computation)
 *   3. Data computation: raw DB records → page-specific *_DATA objects
 *   4. Navigation between pages
 *
 * IMPORTANT: This file does NOT modify any rendering code.
 * It only populates the data objects each page already expects,
 * then calls the existing renderApp() function.
 */

// ── Tauri invoke wrapper ─────────────────────────────────────────
// In production Tauri, window.__TAURI__ is available.
// In dev/browser mode, we fall back to the hardcoded data already in each page.
const isTauri = typeof window.__TAURI__ !== 'undefined';

async function invoke(cmd, args) {
  if (isTauri) {
    return window.__TAURI__.core.invoke(cmd, args);
  }
  // Fallback: return null so pages use their hardcoded data
  return null;
}

// ── Constants ────────────────────────────────────────────────────
const STORE = '141';
const DEPT = 'GS';

// ── Period helpers ───────────────────────────────────────────────
// Supported period codes and their day counts
const PERIOD_DAYS = {
  '3d': 3, '5d': 5,
  '1w': 7, '2w': 14, '4w': 28, '8w': 56,
  '12w': 84, '18w': 126, '26w': 182, '34w': 238, '48w': 336, '1yr': 365,
};

/**
 * Compute date range for a period code ending on a given anchor date.
 * @param {string} periodCode - e.g. '4w', '2w', '1yr'
 * @param {Date} [anchorDate] - end date (default: today or last upload date)
 * @returns {{ from: Date, to: Date, days: number, label: string }}
 */
function computePeriod(periodCode, anchorDate) {
  const days = PERIOD_DAYS[periodCode] || 28;
  const to = anchorDate ? new Date(anchorDate) : new Date();
  to.setHours(12, 0, 0, 0);
  const from = new Date(to);
  from.setDate(from.getDate() - days + 1);

  const label = periodCode.endsWith('d')
    ? periodCode.replace('d', ' days')
    : periodCode === '1yr'
    ? '1 year'
    : periodCode.replace('w', ' week') + (parseInt(periodCode) > 1 ? 's' : '');

  return { from, to, days, label };
}

function fmtDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function isoDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// ── Navigation ───────────────────────────────────────────────────
const NAV_PAGES = {
  extractor:      'pages/extractor.html',
  overview:       'pages/overview.html',
  'employee-bar': 'pages/employee-bar.html',
  'employee-line':'pages/employee-line.html',
  'employee-radar':'pages/employee-radar.html',
  compare:        'pages/compare.html',
  goals:          'pages/goals.html',
  points:         'pages/points.html',
  trifecta:       'pages/trifecta.html',
  archive:        'pages/archive.html',
};

function navigateTo(page) {
  const path = NAV_PAGES[page];
  if (path) {
    window.location.href = '../' + path;
  }
}

// Make navigateTo available globally for onclick handlers in HTML
window.navigateTo = navigateTo;

// ── Data computation helpers ─────────────────────────────────────

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Group records by employee name ("LastName, FirstName")
 */
function groupByEmployee(records) {
  const map = {};
  for (const r of records) {
    const key = r.lastName + ', ' + r.firstName;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  }
  return map;
}

/**
 * Group records by date (ISO string)
 */
function groupByDate(records) {
  const map = {};
  for (const r of records) {
    if (!map[r.date]) map[r.date] = [];
    map[r.date].push(r);
  }
  return map;
}

/**
 * Compute per-employee aggregates over a set of records.
 * Returns: { name, initials, records, avgCust, avgSpQty, avgSpSales, avgSpPct, totalCust, ... }
 */
function computeEmployeeStats(records) {
  const byEmp = groupByEmployee(records);
  return Object.entries(byEmp).map(([name, recs]) => {
    const parts = name.split(', ');
    const lastName = parts[0] || '';
    const firstName = parts[1] || '';
    const initials = (lastName[0] || '') + (firstName[0] || '');
    const daysWorked = recs.length;

    return {
      name,
      lastName,
      firstName,
      initials: initials.toUpperCase(),
      daysWorked,
      records: recs,
      totalCust: recs.reduce((s, r) => s + r.custNum, 0),
      totalSpQty: recs.reduce((s, r) => s + r.spQty, 0),
      totalSpSales: recs.reduce((s, r) => s + r.spSales, 0),
      avgCust: mean(recs.map(r => r.custNum)),
      avgSpQty: mean(recs.map(r => r.spQty)),
      avgSpSales: mean(recs.map(r => r.spSales)),
      avgSpPct: mean(recs.map(r => r.spPct < 1 ? r.spPct * 100 : r.spPct)),
    };
  });
}

/**
 * Compute daily aggregate means across all employees.
 * Returns array of { date, meanSpPct, meanCust, meanSpSales, meanSpQty }
 */
function computeDailyMeans(records) {
  const byDate = groupByDate(records);
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, recs]) => ({
      date,
      meanSpPct: mean(recs.map(r => r.spPct < 1 ? r.spPct * 100 : r.spPct)),
      meanCust: mean(recs.map(r => r.custNum)),
      meanSpSales: mean(recs.map(r => r.spSales)),
      meanSpQty: mean(recs.map(r => r.spQty)),
    }));
}

// ── Expose to pages ──────────────────────────────────────────────
window.GS_BRIDGE = {
  invoke,
  isTauri,
  STORE,
  DEPT,
  PERIOD_DAYS,
  computePeriod,
  fmtDate,
  isoDate,
  navigateTo,
  mean,
  median,
  groupByEmployee,
  groupByDate,
  computeEmployeeStats,
  computeDailyMeans,

  /**
   * Load records from DB for a period, compute data, and return.
   * Each page calls this then maps the result to its own *_DATA shape.
   */
  async loadRecordsForPeriod(periodCode, anchorDate) {
    const period = computePeriod(periodCode, anchorDate);
    const dateFrom = isoDate(period.from);
    const dateTo = isoDate(period.to);

    const records = await invoke('get_records', {
      store: STORE, dept: DEPT, dateFrom, dateTo,
    });

    if (!records || records.length === 0) {
      return { records: [], period, dateFrom, dateTo, isEmpty: true };
    }

    return {
      records,
      period,
      dateFrom,
      dateTo,
      isEmpty: false,
      dailyMeans: computeDailyMeans(records),
      employeeStats: computeEmployeeStats(records),
    };
  },

  /**
   * Load all config data needed for a page.
   */
  async loadConfig() {
    const [goals, pointSystem, ptsExceptions, trifectaConfig] = await Promise.all([
      invoke('get_goals', { store: STORE }),
      invoke('get_point_system', { store: STORE }),
      invoke('get_pts_exceptions', { store: STORE }),
      invoke('get_trifecta_config', { store: STORE }),
    ]);
    return { goals, pointSystem, ptsExceptions, trifectaConfig };
  },

  /**
   * Save records from Extractor to database + export CSV archive.
   */
  async saveRecordsToDb(allRecords, archiveDir) {
    // Convert records to the shape the Rust command expects
    const dbRecords = allRecords.map(r => ({
      id: null,
      date: r.date ? isoDate(r.date) : '',
      sourceFile: r.sourceFile || '',
      store: r.store,
      dept: r.dept,
      lastName: r.lastName,
      firstName: r.firstName,
      custNum: r.custNum,
      spQty: r.spQty,
      spSales: r.spSales,
      spPct: r.spPct,
    }));

    const count = await invoke('save_records', { records: dbRecords });

    // Also export CSV archive copy
    if (dbRecords.length > 0) {
      const dates = dbRecords.map(r => r.date).filter(Boolean).sort();
      const dateFrom = dates[0];
      const dateTo = dates[dates.length - 1];

      try {
        await invoke('export_csv_archive', {
          archiveDir: archiveDir || './archive',
          store: STORE,
          dept: DEPT,
          dateFrom,
          dateTo,
        });
      } catch (e) {
        console.warn('CSV archive export failed:', e);
      }
    }

    return count;
  },
};

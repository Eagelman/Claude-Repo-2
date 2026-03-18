/**
 * Archive Browser Page
 *
 * Provides a unified view into the historical database. Users can:
 * - Browse data by day, week, month, quarter, or year
 * - View summary statistics for any period
 * - Export data as CSV or JSON
 * - See import history
 * - View the database file location
 */
window.ArchivePage = (function () {
  'use strict';

  var state = {
    periodType: 'month',
    selectedDate: new Date().toISOString().split('T')[0],
    periods: [],
    archiveData: null,
    importHistory: [],
    dbPath: '',
    loading: false
  };

  function init() {
    renderApp();
    loadAvailablePeriods();
    loadImportHistory();
    loadDbPath();
  }

  async function loadAvailablePeriods() {
    try {
      var result = await GS.getAvailablePeriods(window.appStoreId || 141);
      if (result) state.periods = result;
    } catch (e) {
      // Use empty array as fallback
      state.periods = [];
    }
    renderApp();
  }

  async function loadImportHistory() {
    try {
      var result = await GS.getImportHistory(window.appStoreId || 141);
      if (result) state.importHistory = result;
    } catch (e) {
      state.importHistory = [];
    }
  }

  async function loadDbPath() {
    try {
      var result = await GS.getDbPath();
      if (result) state.dbPath = result;
    } catch (e) {
      state.dbPath = 'archive/gs_archive.db';
    }
  }

  async function queryPeriod() {
    state.loading = true;
    renderApp();
    try {
      var result = await GS.queryArchive(
        window.appStoreId || 141,
        state.periodType,
        state.selectedDate
      );
      if (result) state.archiveData = result;
    } catch (e) {
      state.archiveData = null;
    }
    state.loading = false;
    renderApp();
  }

  async function exportData(format) {
    if (!state.archiveData) return;
    try {
      var csv = await GS.exportArchive(
        window.appStoreId || 141,
        state.archiveData.period.from,
        state.archiveData.period.to,
        format
      );
      if (csv) {
        var blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'archive_export_' + state.archiveData.period.from + '.' + format;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed:', e);
    }
  }

  function renderApp() {
    var fmtVal = window.GS.fmtVal;
    var ad = state.archiveData;

    var summaryHtml = '';
    if (ad && ad.summary) {
      var s = ad.summary;
      summaryHtml = `
        <div class="sg5" style="grid-template-columns:repeat(5,1fr);">
          <div class="sc"><div class="sc-lbl">Mean SP %</div><div class="sc-vrow"><span class="sc-val">${fmtVal(s.mean_sp_pct, 'pct')}</span></div></div>
          <div class="sc"><div class="sc-lbl">Mean Cust #</div><div class="sc-vrow"><span class="sc-val">${fmtVal(s.mean_cust, 'int')}</span></div></div>
          <div class="sc"><div class="sc-lbl">Mean SP $</div><div class="sc-vrow"><span class="sc-val">${fmtVal(s.mean_sp_d, 'dollar')}</span></div></div>
          <div class="sc"><div class="sc-lbl">Mean SP #</div><div class="sc-vrow"><span class="sc-val">${fmtVal(s.mean_sp_n, 'dec1')}</span></div></div>
          <div class="sc"><div class="sc-lbl">Mean Pts</div><div class="sc-vrow"><span class="sc-val">${fmtVal(s.mean_pts, 'dec1')}</span></div></div>
        </div>`;
    }

    var recordsHtml = '';
    if (ad && ad.records && ad.records.length > 0) {
      var rows = ad.records.map(function (r) {
        return '<tr>' +
          '<td style="font-family:\'DM Mono\',monospace;font-size:10px;">' + r.date + '</td>' +
          '<td>' + r.employee_id + '</td>' +
          '<td style="text-align:right;">' + fmtVal(r.sp_pct, 'pct') + '</td>' +
          '<td style="text-align:right;">' + fmtVal(r.cust, 'int') + '</td>' +
          '<td style="text-align:right;">' + fmtVal(r.sp_d, 'dollar') + '</td>' +
          '<td style="text-align:right;">' + fmtVal(r.sp_n, 'dec1') + '</td>' +
          '<td style="text-align:right;">' + fmtVal(r.pts, 'dec1') + '</td>' +
          '</tr>';
      }).join('');

      recordsHtml = `
        <div class="cp" style="margin-top:12px;">
          <div class="cp-title">Records (${ad.records.length})</div>
          <div style="max-height:400px;overflow-y:auto;margin-top:8px;">
            <table style="width:100%;border-collapse:collapse;font-size:11px;">
              <thead>
                <tr style="border-bottom:2px solid var(--sl-dim);text-align:left;">
                  <th style="padding:4px 8px;">Date</th>
                  <th style="padding:4px 8px;">Emp ID</th>
                  <th style="padding:4px 8px;text-align:right;">SP %</th>
                  <th style="padding:4px 8px;text-align:right;">Cust #</th>
                  <th style="padding:4px 8px;text-align:right;">SP $</th>
                  <th style="padding:4px 8px;text-align:right;">SP #</th>
                  <th style="padding:4px 8px;text-align:right;">Pts</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    } else if (ad) {
      recordsHtml = '<div class="cp" style="margin-top:12px;"><div class="cp-title">No records found for this period.</div></div>';
    }

    var periodsHtml = state.periods.map(function (p) {
      return '<div class="sn-item" onclick="ArchivePage.selectPeriod(\'' + p.from + '\')" style="cursor:pointer;">' +
        '<span class="sn-ico" style="font-size:9px;">' + p.record_count + '</span>' +
        '<span>' + p.label + '</span>' +
        '<span style="margin-left:auto;font-size:9px;color:var(--sl-lt);">' + p.record_count + ' records</span>' +
        '</div>';
    }).join('');

    var importHtml = state.importHistory.map(function (imp) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--sl-bg);font-size:10px;">' +
        '<span style="font-family:\'DM Mono\',monospace;font-size:9px;color:var(--sl);">' + (imp.imported_at || '') + '</span>' +
        '<span style="font-weight:600;">' + imp.filename + '</span>' +
        '<span style="margin-left:auto;color:var(--blue);font-weight:700;">' + imp.records + ' rows</span>' +
        '</div>';
    }).join('') || '<div style="font-size:10px;color:var(--sl);">No imports yet.</div>';

    document.getElementById('page-content').innerHTML = `
      <div class="topbar">
        <div class="tb-title">Archive Browser</div>
        <div class="tb-sep"></div>
        <div class="tb-r">
          <select id="arch-period-type" style="border:1px solid var(--sl-dim);border-radius:var(--r4);padding:4px 8px;font-size:11px;font-family:'DM Sans',sans-serif;"
                  onchange="ArchivePage.setPeriodType(this.value)">
            <option value="day" ${state.periodType === 'day' ? 'selected' : ''}>Day</option>
            <option value="week" ${state.periodType === 'week' ? 'selected' : ''}>Week</option>
            <option value="month" ${state.periodType === 'month' ? 'selected' : ''}>Month</option>
            <option value="quarter" ${state.periodType === 'quarter' ? 'selected' : ''}>Quarter</option>
            <option value="year" ${state.periodType === 'year' ? 'selected' : ''}>Year</option>
          </select>
          <input type="date" id="arch-date" value="${state.selectedDate}"
                 style="border:1px solid var(--sl-dim);border-radius:var(--r4);padding:4px 8px;font-size:11px;font-family:'DM Sans',sans-serif;"
                 onchange="ArchivePage.setDate(this.value)">
          <button class="btn-b" onclick="ArchivePage.query()">
            ${state.loading ? 'Loading...' : 'Query'}
          </button>
        </div>
      </div>
      <div class="content">
        <div style="display:grid;grid-template-columns:1fr 280px;gap:12px;">
          <div>
            ${ad ? `
              <div class="ctx" style="background:linear-gradient(90deg,var(--blue),#3B82F6);">
                <span class="ctx-lbl" style="color:rgba(255,255,255,.5);">Period</span>
                <span class="ctx-val" style="color:#fff;">${ad.period.label}</span>
                <span style="color:rgba(255,255,255,.25);">&middot;</span>
                <span class="ctx-note" style="color:rgba(255,255,255,.6);">${ad.period.days} days &middot; ${ad.records.length} records</span>
              </div>
            ` : `
              <div class="ctx" style="background:var(--sl-bg);border:1px solid var(--sl-dim);">
                <span class="ctx-lbl" style="color:var(--sl);">Archive</span>
                <span class="ctx-val" style="color:var(--ink);">Select a period and click Query to browse historical data</span>
              </div>
            `}
            ${summaryHtml}
            ${ad ? `
              <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn" onclick="ArchivePage.exportData('csv')">Export CSV</button>
                <button class="btn" onclick="ArchivePage.exportData('json')">Export JSON</button>
              </div>
            ` : ''}
            ${recordsHtml}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="cp">
              <div class="cp-title">Available Periods</div>
              <div class="cp-sub">${state.periods.length} months with data</div>
              <div style="max-height:300px;overflow-y:auto;">
                ${periodsHtml || '<div style="font-size:10px;color:var(--sl);">No data yet. Import records via the Extractor.</div>'}
              </div>
            </div>
            <div class="cp">
              <div class="cp-title">Import History</div>
              <div style="max-height:200px;overflow-y:auto;margin-top:6px;">
                ${importHtml}
              </div>
            </div>
            <div class="cp">
              <div class="cp-title">Database Location</div>
              <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--sl);margin-top:4px;word-break:break-all;">
                ${state.dbPath || 'archive/gs_archive.db'}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  return {
    init: init,
    renderApp: renderApp,
    query: queryPeriod,
    exportData: exportData,
    setPeriodType: function (type) { state.periodType = type; },
    setDate: function (date) { state.selectedDate = date; },
    selectPeriod: function (from) {
      state.selectedDate = from;
      state.periodType = 'month';
      var dateInput = document.getElementById('arch-date');
      if (dateInput) dateInput.value = from;
      queryPeriod();
    }
  };
})();

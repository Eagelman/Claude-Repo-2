/**
 * GS Report Analytics - Tauri Bridge
 *
 * Wraps Tauri's invoke() API for all backend commands.
 * Falls back to sample data when not running inside Tauri (for development).
 *
 * Usage:
 *   const data = await GS.invoke('get_overview_data', { storeId: 141, from: '2026-03-01', to: '2026-03-14' });
 */
window.GS = window.GS || {};

/**
 * Check if running inside Tauri.
 * @returns {boolean}
 */
window.GS.isTauri = function () {
  return !!(window.__TAURI__ && window.__TAURI__.core);
};

/**
 * Invoke a Tauri command. Falls back gracefully if not in Tauri.
 * @param {string} cmd - The Tauri command name
 * @param {Object} [args] - Command arguments
 * @returns {Promise<any>} The command result
 */
window.GS.invoke = async function (cmd, args) {
  if (window.GS.isTauri()) {
    try {
      return await window.__TAURI__.core.invoke(cmd, args || {});
    } catch (err) {
      console.error('[Tauri] Command failed:', cmd, err);
      throw err;
    }
  } else {
    console.warn('[Bridge] Not in Tauri. Command "' + cmd + '" using fallback data.');
    return null;
  }
};

// ============================================================================
// Convenience wrappers for each command group
// ============================================================================

// --- Store ---
window.GS.getStore = function (storeId) {
  return window.GS.invoke('get_store', { storeId: storeId });
};

// --- Employees ---
window.GS.getEmployees = function (storeId) {
  return window.GS.invoke('get_employees', { storeId: storeId });
};
window.GS.upsertEmployee = function (storeId, name, initials, status) {
  return window.GS.invoke('upsert_employee', { storeId: storeId, name: name, initials: initials, status: status });
};

// --- Metrics ---
window.GS.getDailyMetrics = function (storeId, from, to) {
  return window.GS.invoke('get_daily_metrics', { storeId: storeId, from: from, to: to });
};
window.GS.getEmployeeMetrics = function (employeeId, from, to) {
  return window.GS.invoke('get_employee_metrics', { employeeId: employeeId, from: from, to: to });
};
window.GS.getStoreSummary = function (storeId, from, to) {
  return window.GS.invoke('get_store_summary', { storeId: storeId, from: from, to: to });
};
window.GS.getOverviewData = function (storeId, from, to) {
  return window.GS.invoke('get_overview_data', { storeId: storeId, from: from, to: to });
};
window.GS.getCompareData = function (storeId, from, to) {
  return window.GS.invoke('get_compare_data', { storeId: storeId, from: from, to: to });
};
window.GS.getHeatmap = function (storeId, from, to) {
  return window.GS.invoke('get_heatmap', { storeId: storeId, from: from, to: to });
};
window.GS.upsertDailyMetric = function (employeeId, storeId, date, sp_pct, sp_n, sp_d, cust, pts) {
  return window.GS.invoke('upsert_daily_metric', {
    employeeId: employeeId, storeId: storeId, date: date,
    spPct: sp_pct, spN: sp_n, spD: sp_d, cust: cust, pts: pts
  });
};

// --- Goals ---
window.GS.getGoals = function (storeId) {
  return window.GS.invoke('get_goals', { storeId: storeId });
};
window.GS.saveGoals = function (storeId, goals) {
  return window.GS.invoke('save_goals', { storeId: storeId, goals: goals });
};
window.GS.getGoalsData = function (storeId, from, to) {
  return window.GS.invoke('get_goals_data', { storeId: storeId, from: from, to: to });
};
window.GS.toggleGoalLock = function (goalId) {
  return window.GS.invoke('toggle_goal_lock', { goalId: goalId });
};

// --- Notes ---
window.GS.getNotes = function (storeId, month) {
  return window.GS.invoke('get_notes', { storeId: storeId, month: month });
};
window.GS.addNote = function (storeId, month, title, body, author, category) {
  return window.GS.invoke('add_note', {
    storeId: storeId, month: month, title: title, body: body, author: author, category: category
  });
};
window.GS.updateNote = function (noteId, title, body, category) {
  return window.GS.invoke('update_note', { noteId: noteId, title: title, body: body, category: category });
};
window.GS.deleteNote = function (noteId) {
  return window.GS.invoke('delete_note', { noteId: noteId });
};
window.GS.toggleNoteLock = function (noteId) {
  return window.GS.invoke('toggle_note_lock', { noteId: noteId });
};

// --- Points ---
window.GS.getPointsData = function (storeId, from, to) {
  return window.GS.invoke('get_points_data', { storeId: storeId, from: from, to: to });
};
window.GS.getPointSystem = function (storeId) {
  return window.GS.invoke('get_point_system', { storeId: storeId });
};
window.GS.savePointSystem = function (storeId, config) {
  return window.GS.invoke('save_point_system', { storeId: storeId, config: config });
};
window.GS.getPointExceptions = function (storeId) {
  return window.GS.invoke('get_point_exceptions', { storeId: storeId });
};
window.GS.savePointExceptions = function (storeId, exceptions) {
  return window.GS.invoke('save_point_exceptions', { storeId: storeId, exceptions: exceptions });
};

// --- Trifecta ---
window.GS.getTrifectaData = function (storeId, from, to) {
  return window.GS.invoke('get_trifecta_data', { storeId: storeId, from: from, to: to });
};
window.GS.addTrifecta = function (employeeId, storeId, date, tier, sp_d, cust, sp_n) {
  return window.GS.invoke('add_trifecta', {
    employeeId: employeeId, storeId: storeId, date: date, tier: tier, spD: sp_d, cust: cust, spN: sp_n
  });
};
window.GS.archiveTrifectas = function (ids) {
  return window.GS.invoke('archive_trifectas', { ids: ids });
};
window.GS.getTrifectaFormula = function (storeId) {
  return window.GS.invoke('get_trifecta_formula', { storeId: storeId });
};
window.GS.saveTrifectaFormula = function (storeId, formula) {
  return window.GS.invoke('save_trifecta_formula', { storeId: storeId, formula: formula });
};
window.GS.addGiftCard = function (employeeId, storeId, amount) {
  return window.GS.invoke('add_gift_card', { employeeId: employeeId, storeId: storeId, amount: amount });
};
window.GS.getGiftCards = function (storeId) {
  return window.GS.invoke('get_gift_cards', { storeId: storeId });
};
window.GS.addAudit = function (storeId, action, userName, details) {
  return window.GS.invoke('add_audit', { storeId: storeId, action: action, userName: userName, details: details });
};

// --- Import ---
window.GS.importMetrics = function (storeId, filename, records) {
  return window.GS.invoke('import_metrics', { storeId: storeId, filename: filename, records: records });
};
window.GS.getImportHistory = function (storeId) {
  return window.GS.invoke('get_import_history', { storeId: storeId });
};

// --- Archive ---
window.GS.queryArchive = function (storeId, periodType, date) {
  return window.GS.invoke('query_archive', { storeId: storeId, periodType: periodType, date: date });
};
window.GS.getAvailablePeriods = function (storeId) {
  return window.GS.invoke('get_available_periods', { storeId: storeId });
};
window.GS.exportArchive = function (storeId, from, to, format) {
  return window.GS.invoke('export_archive', { storeId: storeId, from: from, to: to, format: format });
};
window.GS.getDbPath = function () {
  return window.GS.invoke('get_db_path', {});
};

// --- Files ---
window.GS.writeFile = function (path, content) {
  return window.GS.invoke('write_file', { path: path, content: content });
};
window.GS.writeFileBinary = function (path, content) {
  return window.GS.invoke('write_file_binary', { path: path, content: content });
};

/**
 * Show a save file dialog (Tauri v2 dialog plugin).
 * Returns the chosen path or null if cancelled.
 * @param {Object} opts - { defaultPath, filters: [{ name, extensions }] }
 */
window.GS.saveFileDialog = async function (opts) {
  if (!window.GS.isTauri()) {
    // Fallback: use browser download
    return null;
  }
  try {
    // Tauri v2 plugin dialog API
    var dialog = window.__TAURI_PLUGIN_DIALOG__;
    if (dialog && dialog.save) {
      return await dialog.save(opts || {});
    }
    // Alternative path for Tauri v2
    if (window.__TAURI__ && window.__TAURI__.dialog) {
      return await window.__TAURI__.dialog.save(opts || {});
    }
    return null;
  } catch (e) {
    console.warn('[Bridge] Dialog not available:', e);
    return null;
  }
};

/**
 * Save text content with a file dialog. Falls back to blob download.
 * @param {string} content - The file content
 * @param {string} filename - Default filename
 * @param {string} mimeType - MIME type for fallback
 * @param {Array} filters - [{name, extensions}] for dialog
 */
window.GS.saveWithDialog = async function (content, filename, mimeType, filters) {
  if (window.GS.isTauri()) {
    var path = await window.GS.saveFileDialog({
      defaultPath: filename,
      filters: filters || []
    });
    if (path) {
      await window.GS.writeFile(path, content);
      return true;
    }
  }
  // Fallback: browser blob download
  var blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
  return true;
};

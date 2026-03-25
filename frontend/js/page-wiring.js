/**
 * page-wiring.js — Shared wiring for all dashboard pages
 *
 * This script is loaded AFTER bridge.js and the page's own <script>.
 * It wires up:
 *   1. Period pill click handlers (calls page's setPeriod if available)
 *   2. Navigation arrow click handlers
 *   3. Sidebar navigation click handlers
 *   4. "Rec. Upload" button
 *
 * Each page must define a global `setPeriod(code)` function
 * that fetches data for the given period and calls renderApp().
 *
 * IMPORTANT: This runs after renderApp() so the DOM already exists.
 * It uses event delegation on document.body to handle dynamically
 * generated content (since renderApp() rebuilds the DOM).
 */

(function () {
  // Current period state (shared across pages via this script)
  if (!window._currentPeriod) window._currentPeriod = '4w';
  if (!window._anchorDate) window._anchorDate = null;

  // ── Event delegation for period pills and navigation ──────────
  document.body.addEventListener('click', function (e) {
    const target = e.target;

    // Period pill click
    if (target.matches('.pp') && !target.matches('.cp') && !target.matches('.rec')) {
      const code = target.textContent.trim();
      if (window.GS_BRIDGE && window.GS_BRIDGE.PERIOD_DAYS[code]) {
        window._currentPeriod = code;
        if (typeof window.setPeriod === 'function') {
          window.setPeriod(code);
        }
      }
    }

    // Rec. Upload button
    if (target.matches('.pp.rec')) {
      if (typeof window.setPeriod === 'function') {
        window.setPeriod('rec');
      }
    }

    // Period nav arrows
    if (target.matches('.pnav')) {
      const isNext = target.textContent.trim() === '\u203A'; // ›
      const days = window.GS_BRIDGE
        ? window.GS_BRIDGE.PERIOD_DAYS[window._currentPeriod] || 28
        : 28;
      const anchor = window._anchorDate ? new Date(window._anchorDate) : new Date();
      anchor.setDate(anchor.getDate() + (isNext ? days : -days));
      window._anchorDate = anchor;
      if (typeof window.setPeriod === 'function') {
        window.setPeriod(window._currentPeriod, anchor);
      }
    }

    // Sidebar navigation
    if (target.matches('.gsb-item') || target.closest('.gsb-item')) {
      const item = target.closest('.gsb-item') || target;
      const text = item.textContent.trim().toLowerCase();

      if (text.includes('extractor')) window.GS_BRIDGE.navigateTo('extractor');
      else if (text.includes('analytics') || text.includes('overview'))
        window.GS_BRIDGE.navigateTo('overview');
      else if (text.includes('points')) window.GS_BRIDGE.navigateTo('points');
      else if (text.includes('compare')) window.GS_BRIDGE.navigateTo('compare');
      else if (text.includes('trifecta')) window.GS_BRIDGE.navigateTo('trifecta');
      else if (text.includes('archive')) window.GS_BRIDGE.navigateTo('archive');
      else if (text.includes('goals')) window.GS_BRIDGE.navigateTo('goals');
    }

    // Sub-nav navigation for analytics views
    if (target.matches('.sn-item') || target.closest('.sn-item')) {
      const item = target.closest('.sn-item') || target;
      const text = item.textContent.trim().toLowerCase();

      if (text.includes('overview')) window.GS_BRIDGE.navigateTo('overview');
      else if (text.includes('by employee') || text.includes('bar chart'))
        window.GS_BRIDGE.navigateTo('employee-bar');
      else if (text.includes('line chart'))
        window.GS_BRIDGE.navigateTo('employee-line');
      else if (text.includes('radar'))
        window.GS_BRIDGE.navigateTo('employee-radar');
      else if (text.includes('compare')) window.GS_BRIDGE.navigateTo('compare');
      else if (text.includes('goals')) window.GS_BRIDGE.navigateTo('goals');
    }
  });

  // ── Initialize period from DB if available ─────────────────────
  if (window.GS_BRIDGE && window.GS_BRIDGE.isTauri) {
    window.GS_BRIDGE.invoke('get_last_upload_date', { store: window.GS_BRIDGE.STORE })
      .then(function (lastDate) {
        if (lastDate) {
          window._anchorDate = new Date(lastDate + 'T12:00:00');
          // Trigger initial data load with the current period
          if (typeof window.setPeriod === 'function') {
            window.setPeriod(window._currentPeriod, window._anchorDate);
          }
        }
      })
      .catch(function () { /* ignore - will use hardcoded data */ });
  }
})();

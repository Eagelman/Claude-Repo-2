/**
 * GS Report Analytics - Application Router
 *
 * Hash-based SPA router that connects all pages through a unified navigation.
 * Each page module is loaded on demand and rendered into #page-content.
 *
 * Routes:
 *   #/overview        → Overview dashboard
 *   #/compare         → Compare All employees
 *   #/employee/bar    → Employee bar charts
 *   #/employee/line   → Employee line charts
 *   #/employee/radar  → Employee radar chart
 *   #/goals           → Goals management
 *   #/points          → Points leaderboard
 *   #/trifecta        → Trifecta rewards
 *   #/extractor       → GS Report Extractor
 *   #/archive         → Archive browser
 */
(function () {
  'use strict';

  // ============================================================================
  // Route Registry
  // ============================================================================

  const ROUTES = {
    '/overview':       { module: 'OverviewPage',     label: 'Overview',       sidebar: 'overview' },
    '/compare':        { module: 'ComparePage',      label: 'Compare All',    sidebar: 'compare' },
    '/employee/bar':   { module: 'EmployeeBarPage',  label: 'By Employee',    sidebar: 'employee' },
    '/employee/line':  { module: 'EmployeeLinePage', label: 'By Employee',    sidebar: 'employee' },
    '/employee/radar': { module: 'EmployeeRadarPage',label: 'By Employee',    sidebar: 'employee' },
    '/goals':          { module: 'GoalsPage',        label: 'Goals',          sidebar: 'goals' },
    '/points':         { module: 'PointsPage',       label: 'Points',         sidebar: 'points' },
    '/trifecta':       { module: 'TrifectaPage',     label: 'Trifecta',       sidebar: 'trifecta' },
    '/extractor':      { module: 'ExtractorPage',    label: 'Extractor',      sidebar: 'extractor' },
    '/archive':        { module: 'ArchivePage',      label: 'Archive',        sidebar: 'archive' },
  };

  const DEFAULT_ROUTE = '/overview';

  // ============================================================================
  // State
  // ============================================================================

  let currentRoute = null;
  let storeId = 141;

  // ============================================================================
  // Router
  // ============================================================================

  function getRoute() {
    const hash = window.location.hash || '';
    return hash.startsWith('#') ? hash.substring(1) : DEFAULT_ROUTE;
  }

  function navigate(route) {
    window.location.hash = '#' + route;
  }

  function handleRouteChange() {
    const route = getRoute();
    const routeConfig = ROUTES[route];

    if (!routeConfig) {
      // Try to find a matching route prefix (for parameterized routes)
      const baseRoute = Object.keys(ROUTES).find(r => route.startsWith(r));
      if (baseRoute) {
        activateRoute(baseRoute, ROUTES[baseRoute], route);
      } else {
        navigate(DEFAULT_ROUTE);
      }
      return;
    }

    activateRoute(route, routeConfig, route);
  }

  function activateRoute(route, config, fullRoute) {
    if (currentRoute === fullRoute) return;
    currentRoute = fullRoute;

    // Update sidebar active states
    updateSidebarActive(config.sidebar);

    // Update page label
    const label = document.getElementById('page-label');
    if (label) {
      label.textContent = config.label + ' \u00B7 Store 141';
    }

    // Get the page module
    const pageModule = window[config.module];
    if (pageModule && typeof pageModule.init === 'function') {
      // Parse URL parameters
      const params = parseRouteParams(route, fullRoute);
      params.storeId = storeId;

      try {
        pageModule.init(params);
      } catch (e) {
        console.error('Error initializing page:', config.module, e);
        showError(config.label, e.message);
      }
    } else {
      showError(config.label, 'Page module "' + config.module + '" not found.');
    }
  }

  function parseRouteParams(baseRoute, fullRoute) {
    const params = {};
    const extra = fullRoute.substring(baseRoute.length);
    if (extra.startsWith('/')) {
      const parts = extra.substring(1).split('/');
      parts.forEach(function (part, i) {
        params['param' + i] = part;
      });
      if (parts[0]) params.id = parseInt(parts[0], 10) || parts[0];
    }
    return params;
  }

  function updateSidebarActive(sidebarKey) {
    // Update global sidebar items
    document.querySelectorAll('.gsb-item').forEach(function (el) {
      el.classList.toggle('on', el.dataset.route === sidebarKey);
    });

    // Update sub-nav items
    document.querySelectorAll('.sn-item').forEach(function (el) {
      el.classList.toggle('on', el.dataset.route === sidebarKey);
    });

    // Show/hide sub-nav based on whether we're in analytics section
    var analyticsRoutes = ['overview', 'employee', 'compare', 'goals'];
    var subNav = document.getElementById('sub-nav');
    if (subNav) {
      subNav.style.display = analyticsRoutes.indexOf(sidebarKey) >= 0 ? '' : 'none';
    }
  }

  function showError(title, message) {
    document.getElementById('page-content').innerHTML =
      '<div class="topbar"><div class="tb-title">' + title + '</div></div>' +
      '<div class="content" style="align-items:center;justify-content:center;">' +
      '<p style="color:var(--red);font-size:14px;">Error: ' + message + '</p></div>';
  }

  // ============================================================================
  // Initialize
  // ============================================================================

  window.addEventListener('hashchange', handleRouteChange);

  // Navigate on link clicks (for sidebar items using <a> tags)
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#/"]');
    if (link) {
      e.preventDefault();
      window.location.hash = link.getAttribute('href');
    }
  });

  // Initial route
  if (!window.location.hash) {
    window.location.hash = '#' + DEFAULT_ROUTE;
  } else {
    handleRouteChange();
  }

  // Expose navigate globally for pages that need it
  window.appNavigate = navigate;
  window.appStoreId = storeId;
})();

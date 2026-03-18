-- ============================================================================
-- GS Report Analytics - Initial Database Schema
-- ============================================================================
-- This migration creates all tables for the GS Report Analytics application.
-- The database lives in the app's archive directory and supports indefinite
-- historical data with efficient temporal indexing (day/month/year).
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- Store: Top-level entity representing a retail store location
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- Employee: Staff members tracked for performance metrics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id        INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    initials        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Active',
    weeks_on_record INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, name)
);
CREATE INDEX IF NOT EXISTS idx_employee_store ON employee(store_id);

-- ----------------------------------------------------------------------------
-- Daily Metric: Core fact table - one row per employee per working day
-- This is the primary data source for all analytics pages.
-- Columns: sp_pct (SP %), sp_n (SP #), sp_d (SP $), cust (Customer #), pts (Points)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_metric (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    sp_pct      REAL,
    sp_n        REAL,
    sp_d        REAL,
    cust        INTEGER,
    pts         REAL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, date)
);

-- Temporal indexes for efficient day/month/year queries
CREATE INDEX IF NOT EXISTS idx_metric_date ON daily_metric(date);
CREATE INDEX IF NOT EXISTS idx_metric_ym ON daily_metric(substr(date,1,7));
CREATE INDEX IF NOT EXISTS idx_metric_year ON daily_metric(substr(date,1,4));
CREATE INDEX IF NOT EXISTS idx_metric_emp_date ON daily_metric(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_metric_store_date ON daily_metric(store_id, date);

-- ----------------------------------------------------------------------------
-- Goal: Performance targets per metric per store
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goal (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    metric_key  TEXT NOT NULL,
    label       TEXT NOT NULL,
    fmt         TEXT NOT NULL DEFAULT 'dec1',
    value       REAL NOT NULL,
    unit        TEXT,
    locked      INTEGER NOT NULL DEFAULT 0,
    note        TEXT,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, metric_key)
);

-- ----------------------------------------------------------------------------
-- Point System: Configuration for how points are calculated per store
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS point_system (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id     INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    sp_pct_pts   REAL NOT NULL DEFAULT 2.0,
    cust_pts     REAL NOT NULL DEFAULT 1.0,
    sp_d_pts     REAL NOT NULL DEFAULT 1.0,
    sp_n_pts     REAL NOT NULL DEFAULT 1.0,
    pts_wk_bonus REAL NOT NULL DEFAULT 2.0,
    note         TEXT,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id)
);

-- ----------------------------------------------------------------------------
-- Point Exception: Per-employee overrides to the point system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS point_exception (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    status      TEXT,
    goal        TEXT,
    locked      INTEGER NOT NULL DEFAULT 0,
    UNIQUE(store_id, employee_id)
);

-- ----------------------------------------------------------------------------
-- Note: Monthly notes for goal tracking, coaching, and analysis
-- Indexed by YYYY-MM for the Goals page monthly view
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS note (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    month       TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    locked      INTEGER NOT NULL DEFAULT 0,
    author      TEXT,
    category    TEXT NOT NULL DEFAULT 'Misc',
    censored    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_note_month ON note(store_id, month);

-- ----------------------------------------------------------------------------
-- Trifecta: Records when employee hits all 3 goals on the same shift
-- Tiers 1-5 with escalating difficulty thresholds
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trifecta (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    tier        INTEGER NOT NULL CHECK(tier BETWEEN 1 AND 5),
    sp_d        REAL NOT NULL,
    cust        INTEGER NOT NULL,
    sp_n        REAL NOT NULL,
    archived    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, date)
);
CREATE INDEX IF NOT EXISTS idx_trifecta_date ON trifecta(date);
CREATE INDEX IF NOT EXISTS idx_trifecta_store_date ON trifecta(store_id, date);

-- ----------------------------------------------------------------------------
-- Trifecta Formula: Scoring formula configuration per store
-- score = (sp_d * spd_mult * spd_weight) + (cust * cust_mult * cust_weight) + (sp_n * spn_weight)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trifecta_formula (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    spd_mult    REAL NOT NULL DEFAULT 1.0,
    spd_weight  REAL NOT NULL DEFAULT 1.0,
    cust_mult   REAL NOT NULL DEFAULT 1.0,
    cust_weight REAL NOT NULL DEFAULT 1.0,
    spn_weight  REAL NOT NULL DEFAULT 1.0,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id)
);

-- ----------------------------------------------------------------------------
-- Gift Card: Rewards issued from trifecta achievements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gift_card (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    store_id        INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    amount          REAL NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    fulfilled_date  TEXT,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gift_card_store ON gift_card(store_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_employee ON gift_card(employee_id);

-- ----------------------------------------------------------------------------
-- Audit Log: Tracks all significant actions for accountability
-- Actions: archive, note_edit, pin_attempt, goal_change, import, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,
    user_name   TEXT,
    details     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_store ON audit_log(store_id, created_at);

-- ----------------------------------------------------------------------------
-- Import Log: Tracks Excel file imports for data provenance
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id    INTEGER NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    filename    TEXT NOT NULL,
    records     INTEGER NOT NULL DEFAULT 0,
    imported_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Seed default store
-- ============================================================================
INSERT OR IGNORE INTO store (id, name) VALUES (141, 'Store 141');

-- ============================================================================
-- Seed default goals
-- ============================================================================
INSERT OR IGNORE INTO goal (store_id, metric_key, label, fmt, value, unit, locked, note)
VALUES
  (141, 'sp_pct', 'SP %',   'pct',    1.8,  'rate',    0, ''),
  (141, 'cust',   'Cust #', 'int',    40,   'per day', 0, ''),
  (141, 'sp_d',   'SP $',   'dollar', 250,  'per day', 1, 'District-set. Do not modify.'),
  (141, 'sp_n',   'SP #',   'dec1',   6.0,  'per day', 0, ''),
  (141, 'pts_wk', 'Pts/wk', 'dec1',   7.0,  'per wk',  0, 'Dept average counted weekly.');

-- ============================================================================
-- Seed default point system
-- ============================================================================
INSERT OR IGNORE INTO point_system (store_id, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note)
VALUES (141, 1.0, 1.0, 1.0, 1.0, 1.0, 'If pts/wk goal met for the week, each working day earns +1 bonus point.');

-- ============================================================================
-- Seed default trifecta formula
-- ============================================================================
INSERT OR IGNORE INTO trifecta_formula (store_id, spd_mult, spd_weight, cust_mult, cust_weight, spn_weight)
VALUES (141, 0.02, 1.0, 0.0857, 2.0, 0.5);

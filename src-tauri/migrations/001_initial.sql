-- Raw daily records from the GS Report Extractor
-- This is the core data table. All page computations derive from this.
CREATE TABLE IF NOT EXISTS daily_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,              -- ISO date YYYY-MM-DD
    source_file TEXT,                -- Original filename
    store TEXT NOT NULL,             -- Store number (e.g. "141")
    dept TEXT NOT NULL,              -- Department (e.g. "GS")
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    cust_num REAL NOT NULL DEFAULT 0,   -- Customer/transaction count
    sp_qty REAL NOT NULL DEFAULT 0,     -- Service Plan quantity
    sp_sales REAL NOT NULL DEFAULT 0,   -- Service Plan dollar amount
    sp_pct REAL NOT NULL DEFAULT 0,     -- SP percentage (raw decimal, e.g. 0.0184)
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(date, store, dept, last_name, first_name)
);

-- Employee roster
CREATE TABLE IF NOT EXISTS roster (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    dept TEXT NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(store, dept, last_name, first_name)
);

-- Goal targets per metric
CREATE TABLE IF NOT EXISTS goals_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    metric_key TEXT NOT NULL,        -- sp_pct, cust, sp_d, sp_n, pts_wk
    label TEXT NOT NULL,             -- Display label
    fmt TEXT NOT NULL DEFAULT 'dec1', -- Format: pct, dec1, dollar, int
    value REAL NOT NULL,
    unit TEXT DEFAULT '',
    locked INTEGER NOT NULL DEFAULT 0,
    note TEXT DEFAULT '',
    UNIQUE(store, metric_key)
);

-- Point system rules
CREATE TABLE IF NOT EXISTS point_system (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    sp_pct_pts REAL NOT NULL DEFAULT 2,
    cust_pts REAL NOT NULL DEFAULT 2,
    sp_d_pts REAL NOT NULL DEFAULT 2,
    sp_n_pts REAL NOT NULL DEFAULT 2,
    pts_wk_bonus REAL NOT NULL DEFAULT 1,
    note TEXT DEFAULT '',
    UNIQUE(store)
);

-- Per-employee points/wk exceptions
CREATE TABLE IF NOT EXISTS pts_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    employee_name TEXT NOT NULL,     -- "LastName, FirstName"
    status TEXT DEFAULT 'active',
    goal_override REAL,
    locked INTEGER NOT NULL DEFAULT 0,
    UNIQUE(store, employee_name)
);

-- Manager notes (keyed by year-month)
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    month TEXT NOT NULL,             -- YYYY-MM
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Analysis',  -- Analysis, Coaching Ideas, Misc
    author TEXT DEFAULT '',
    locked INTEGER NOT NULL DEFAULT 0,
    censored INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Trifecta configuration
CREATE TABLE IF NOT EXISTS trifecta_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    -- Goals
    sp_d_goal REAL NOT NULL DEFAULT 250,
    cust_goal REAL NOT NULL DEFAULT 40,
    sp_n_goal REAL NOT NULL DEFAULT 6.0,
    -- Double metrics (standard)
    double_sp_d REAL NOT NULL DEFAULT 70,
    double_sp_n REAL NOT NULL DEFAULT 6,
    double_cust REAL NOT NULL DEFAULT 300,
    -- Double metrics (elite)
    elite_sp_d REAL NOT NULL DEFAULT 105,
    elite_sp_n REAL NOT NULL DEFAULT 9,
    elite_cust REAL NOT NULL DEFAULT 450,
    -- Formula weights
    fw_count REAL NOT NULL DEFAULT 1.0,
    fw_tier REAL NOT NULL DEFAULT 0.5,
    fw_super REAL NOT NULL DEFAULT 0.75,
    fw_avg_sp_d REAL NOT NULL DEFAULT 0.3,
    fw_avg_cust REAL NOT NULL DEFAULT 0.2,
    UNIQUE(store)
);

-- Gift card log
CREATE TABLE IF NOT EXISTS gift_cards (
    id TEXT PRIMARY KEY,             -- UUID
    store TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    tag TEXT DEFAULT '',             -- e.g. "3rd Trifecta"
    amount REAL NOT NULL DEFAULT 10,
    date TEXT NOT NULL,              -- ISO date
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, in_progress, fulfilled
    note TEXT DEFAULT ''
);

-- Per-employee goal exceptions (for employee detail pages)
CREATE TABLE IF NOT EXISTS employee_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    employee_name TEXT NOT NULL,     -- "LastName, FirstName"
    metric_key TEXT NOT NULL,        -- sp_pct, sp_n, sp_d, cust
    default_goal REAL,
    override_val REAL,
    locked INTEGER NOT NULL DEFAULT 0,
    reason TEXT DEFAULT ''
);

-- Per-employee personal goals
CREATE TABLE IF NOT EXISTS personal_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    val TEXT NOT NULL,
    unit TEXT DEFAULT '',
    locked INTEGER NOT NULL DEFAULT 0,
    note TEXT DEFAULT ''
);

-- Track CSV archive exports
CREATE TABLE IF NOT EXISTS archive_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    date_from TEXT,
    date_to TEXT,
    record_count INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_records_date ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_records_store ON daily_records(store, dept);
CREATE INDEX IF NOT EXISTS idx_records_name ON daily_records(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_notes_month ON notes(store, month);
CREATE INDEX IF NOT EXISTS idx_gift_cards_store ON gift_cards(store);

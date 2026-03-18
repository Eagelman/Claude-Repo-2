# GS Report Analytics - Database Documentation

## Overview

The GS Report Analytics application uses an **SQLite** database for persistent storage of all employee performance data. The database file lives in the application's archive directory at `archive/gs_archive.db` and supports indefinite historical data accumulation.

## Database Location

| Platform | Path |
|----------|------|
| Development | `<executable-dir>/data/archive/gs_archive.db` |
| Production (macOS) | `~/Library/Application Support/com.gs-analytics.app/archive/gs_archive.db` |
| Production (Windows) | `%APPDATA%/com.gs-analytics.app/archive/gs_archive.db` |
| Production (Linux) | `~/.local/share/com.gs-analytics.app/archive/gs_archive.db` |

## Schema

### Entity Relationship

```
store (1) ──────┬──── (N) employee
                │          │
                │          ├──── (N) daily_metric  ← Core fact table
                │          ├──── (N) trifecta
                │          ├──── (N) gift_card
                │          └──── (N) point_exception
                │
                ├──── (N) goal
                ├──── (1) point_system
                ├──── (N) note
                ├──── (1) trifecta_formula
                ├──── (N) audit_log
                └──── (N) import_log
```

### Tables

#### `store`
Top-level entity representing a retail store location.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Store number (e.g., 141) |
| `name` | TEXT | Store display name |
| `created_at` | TEXT | ISO datetime |

#### `employee`
Staff members tracked for performance metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTO | Unique employee ID |
| `store_id` | INTEGER FK → store | Parent store |
| `name` | TEXT | Full name (Last, First) |
| `initials` | TEXT | 2-character initials |
| `status` | TEXT | Active, Part-time, Seasonal, Inactive |
| `weeks_on_record` | INTEGER | Weeks of historical data |
| `created_at` | TEXT | ISO datetime |
| `updated_at` | TEXT | ISO datetime |

#### `daily_metric` (Core Fact Table)
One row per employee per working day. This is the primary data source for all analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTO | Row ID |
| `employee_id` | INTEGER FK → employee | Employee |
| `store_id` | INTEGER FK → store | Store |
| `date` | TEXT | Date in `YYYY-MM-DD` format |
| `sp_pct` | REAL | SP % (service plan percentage) |
| `sp_n` | REAL | SP # (service plan count) |
| `sp_d` | REAL | SP $ (service plan dollars) |
| `cust` | INTEGER | Customer count |
| `pts` | REAL | Points earned |

**Unique constraint:** `(employee_id, date)` — one record per employee per day.

#### `goal`
Performance targets per metric per store.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK AUTO | Row ID |
| `store_id` | INTEGER FK → store | Store |
| `metric_key` | TEXT | sp_pct, cust, sp_d, sp_n, pts_wk |
| `label` | TEXT | Display label (e.g., "SP %") |
| `fmt` | TEXT | Format: pct, int, dollar, dec1 |
| `value` | REAL | Goal value |
| `unit` | TEXT | Unit description |
| `locked` | INTEGER | 0=editable, 1=locked |
| `note` | TEXT | Admin note |

**Unique constraint:** `(store_id, metric_key)`

#### `point_system`
Configuration for how points are calculated per store.

| Column | Type | Description |
|--------|------|-------------|
| `sp_pct_pts` | REAL | Points for hitting SP % goal (default: 2) |
| `cust_pts` | REAL | Points for hitting Cust # goal (default: 1) |
| `sp_d_pts` | REAL | Points for hitting SP $ goal (default: 1) |
| `sp_n_pts` | REAL | Points for hitting SP # goal (default: 1) |
| `pts_wk_bonus` | REAL | Bonus points if weekly goal met (default: 2) |

#### `note`
Monthly notes for goal tracking, coaching, and analysis.

| Column | Type | Description |
|--------|------|-------------|
| `month` | TEXT | `YYYY-MM` format (indexed) |
| `title` | TEXT | Note title |
| `body` | TEXT | Note content |
| `category` | TEXT | Analysis, Coaching Ideas, Misc |
| `censored` | INTEGER | 0=visible, 1=blurred by default |

#### `trifecta`
Records when an employee hits all 3 goals (SP $, Cust #, SP #) on the same shift.

| Column | Type | Description |
|--------|------|-------------|
| `tier` | INTEGER | Achievement tier 1-5 |
| `sp_d` | REAL | Actual SP $ value |
| `cust` | INTEGER | Actual customer count |
| `sp_n` | REAL | Actual SP # count |
| `archived` | INTEGER | 0=active, 1=archived |

**Tiers:**
- Tier 1: >= goal (blue)
- Tier 2: >= 110% of goal (green)
- Tier 3: >= 125% of goal (silver)
- Tier 4: >= 150% of goal (gold)
- Tier 5: Double metrics (diamond)

#### `trifecta_formula`
Scoring formula for trifecta leaderboard ranking.

Formula: `score = (sp_d × spd_mult × spd_weight) + (cust × cust_mult × cust_weight) + (sp_n × spn_weight)`

#### `gift_card`
Gift card rewards issued from trifecta achievements.

| Status Values | Description |
|--------------|-------------|
| `pending` | Awaiting fulfillment |
| `fulfilled` | Delivered to employee |
| `cancelled` | Revoked |

#### `audit_log`
Tracks all significant actions for accountability.

| Action Types | Description |
|-------------|-------------|
| `archive` | Trifecta records archived |
| `note_edit` | Note modified |
| `pin_attempt` | PIN entry attempt |
| `goal_change` | Goal value modified |
| `import` | Data imported from Excel |

#### `import_log`
Tracks Excel file imports for data provenance.

## Temporal Indexes

The database is optimized for querying by time period with these indexes:

| Index | Column Expression | Use Case |
|-------|-------------------|----------|
| `idx_metric_date` | `date` | Single day lookups |
| `idx_metric_ym` | `substr(date,1,7)` | Monthly queries (YYYY-MM) |
| `idx_metric_year` | `substr(date,1,4)` | Yearly queries (YYYY) |
| `idx_metric_emp_date` | `(employee_id, date)` | Employee history |
| `idx_metric_store_date` | `(store_id, date)` | Store-wide date queries |

## Query Patterns

### By Day
```sql
SELECT * FROM daily_metric WHERE date = '2026-03-14';
```

### By Week (Last 7 Days)
```sql
SELECT * FROM daily_metric
WHERE date >= date('now', '-7 days');
```

### By Month
```sql
SELECT * FROM daily_metric
WHERE substr(date,1,7) = '2026-03';
-- OR: WHERE date BETWEEN '2026-03-01' AND '2026-03-31';
```

### By Quarter
```sql
SELECT * FROM daily_metric
WHERE date BETWEEN '2026-01-01' AND '2026-03-31';
```

### By Year
```sql
SELECT * FROM daily_metric
WHERE substr(date,1,4) = '2026';
```

### Store Averages for a Period
```sql
SELECT
    AVG(sp_pct) as mean_sp_pct,
    AVG(cust) as mean_cust,
    AVG(sp_d) as mean_sp_d,
    AVG(sp_n) as mean_sp_n,
    AVG(pts) as mean_pts
FROM daily_metric
WHERE store_id = 141
  AND date BETWEEN '2026-03-01' AND '2026-03-31';
```

### Per-Employee Rankings
```sql
SELECT e.name, e.initials,
       SUM(m.pts) as total_pts,
       COUNT(m.id) as days_worked
FROM employee e
JOIN daily_metric m ON m.employee_id = e.id
WHERE e.store_id = 141
  AND m.date BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY e.id
ORDER BY total_pts DESC;
```

### Available Data Periods
```sql
SELECT substr(date,1,7) as month,
       MIN(date) as first_day,
       MAX(date) as last_day,
       COUNT(*) as records
FROM daily_metric
WHERE store_id = 141
GROUP BY substr(date,1,7)
ORDER BY month DESC;
```

## Data Flow

```
Excel File (.xlsx)
    │
    ▼
GS Report Extractor (frontend)
    │ Parses rows, filters by roster
    ▼
import_metrics command (Tauri backend)
    │ Upserts employee + daily_metric rows
    ▼
SQLite Database (archive/gs_archive.db)
    │
    ├──▶ Overview Page    (get_overview_data)
    ├──▶ Compare Page     (get_compare_data)
    ├──▶ Employee Pages   (get_employee_metrics + aggregation)
    ├──▶ Goals Page       (get_goals_data)
    ├──▶ Points Page      (get_points_data)
    ├──▶ Trifecta Page    (get_trifecta_data)
    └──▶ Archive Page     (query_archive, export_archive)
```

## Migrations

Migrations are tracked in the `_migrations` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Migration ID |
| `name` | TEXT | Migration name (e.g., '001_initial') |
| `applied_at` | TEXT | When applied |

On application startup, the database module checks for unapplied migrations and runs them automatically.

## Backup

The database is a single file. To back it up:
1. Close the application
2. Copy `gs_archive.db` to your backup location
3. Restart the application

For automated backups, the database path can be retrieved via the `get_db_path` Tauri command.

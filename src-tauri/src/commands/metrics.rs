//! Daily metrics commands: CRUD, aggregation, and chart data.

use crate::db::DbState;
use crate::models::*;
use tauri::State;

/// Get daily metrics for a store within a date range.
#[tauri::command]
pub fn get_daily_metrics(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<Vec<DailyMetric>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, employee_id, store_id, date, sp_pct, sp_n, sp_d, cust, pts
             FROM daily_metric
             WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3
             ORDER BY date, employee_id",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![store_id, from, to], |row| {
            Ok(DailyMetric {
                id: row.get(0)?,
                employee_id: row.get(1)?,
                store_id: row.get(2)?,
                date: row.get(3)?,
                sp_pct: row.get(4)?,
                sp_n: row.get(5)?,
                sp_d: row.get(6)?,
                cust: row.get(7)?,
                pts: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Get metrics for a single employee within a date range.
#[tauri::command]
pub fn get_employee_metrics(
    state: State<DbState>,
    employee_id: i64,
    from: String,
    to: String,
) -> Result<Vec<DailyMetric>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, employee_id, store_id, date, sp_pct, sp_n, sp_d, cust, pts
             FROM daily_metric
             WHERE employee_id = ?1 AND date BETWEEN ?2 AND ?3
             ORDER BY date",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![employee_id, from, to], |row| {
            Ok(DailyMetric {
                id: row.get(0)?,
                employee_id: row.get(1)?,
                store_id: row.get(2)?,
                date: row.get(3)?,
                sp_pct: row.get(4)?,
                sp_n: row.get(5)?,
                sp_d: row.get(6)?,
                cust: row.get(7)?,
                pts: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Insert or update a daily metric record.
#[tauri::command]
pub fn upsert_daily_metric(
    state: State<DbState>,
    employee_id: i64,
    store_id: i64,
    date: String,
    sp_pct: Option<f64>,
    sp_n: Option<f64>,
    sp_d: Option<f64>,
    cust: Option<i64>,
    pts: Option<f64>,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO daily_metric (employee_id, store_id, date, sp_pct, sp_n, sp_d, cust, pts)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(employee_id, date) DO UPDATE SET
            sp_pct = excluded.sp_pct,
            sp_n = excluded.sp_n,
            sp_d = excluded.sp_d,
            cust = excluded.cust,
            pts = excluded.pts",
        rusqlite::params![employee_id, store_id, date, sp_pct, sp_n, sp_d, cust, pts],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get store summary (means and medians) for a date range.
#[tauri::command]
pub fn get_store_summary(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<StoreSummary, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Calculate means
    let (mean_sp_pct, mean_sp_n, mean_sp_d, mean_cust, mean_pts): (f64, f64, f64, f64, f64) = conn
        .query_row(
            "SELECT
                COALESCE(AVG(sp_pct), 0),
                COALESCE(AVG(sp_n), 0),
                COALESCE(AVG(sp_d), 0),
                COALESCE(AVG(cust), 0),
                COALESCE(AVG(pts), 0)
             FROM daily_metric
             WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
        )
        .map_err(|e| e.to_string())?;

    // Calculate medians using a helper
    let median_sp_pct = calc_median(&conn, store_id, &from, &to, "sp_pct")?;
    let median_sp_n = calc_median(&conn, store_id, &from, &to, "sp_n")?;
    let median_sp_d = calc_median(&conn, store_id, &from, &to, "sp_d")?;
    let median_cust = calc_median(&conn, store_id, &from, &to, "cust")?;
    let median_pts = calc_median(&conn, store_id, &from, &to, "pts")?;

    // Calculate days
    let days: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT date) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(StoreSummary {
        period: Period {
            label: format!("{} to {}", from, to),
            from: from.clone(),
            to: to.clone(),
            days,
        },
        mean_sp_pct,
        mean_sp_n,
        mean_sp_d,
        mean_cust,
        mean_pts,
        median_sp_pct,
        median_sp_n,
        median_sp_d,
        median_cust,
        median_pts,
    })
}

/// Calculate the median of a metric column for a store and date range.
fn calc_median(
    conn: &rusqlite::Connection,
    store_id: i64,
    from: &str,
    to: &str,
    column: &str,
) -> Result<f64, String> {
    // Get all non-null values sorted
    let sql = format!(
        "SELECT {} FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3 AND {} IS NOT NULL ORDER BY {}",
        column, column, column
    );
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let values: Vec<f64> = stmt
        .query_map(rusqlite::params![store_id, from, to], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    if values.is_empty() {
        return Ok(0.0);
    }

    let mid = values.len() / 2;
    if values.len() % 2 == 0 {
        Ok((values[mid - 1] + values[mid]) / 2.0)
    } else {
        Ok(values[mid])
    }
}

/// Get compare data for all employees in a store.
#[tauri::command]
pub fn get_compare_data(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<CompareData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Get store
    let store = conn
        .query_row(
            "SELECT id, name, created_at FROM store WHERE id = ?1",
            [store_id],
            |row| {
                Ok(Store {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    // Get goals
    let goals = get_metric_goals(&conn, store_id)?;

    // Get per-employee averages
    let mut stmt = conn
        .prepare(
            "SELECT e.id, e.name, e.initials,
                    COALESCE(AVG(m.sp_pct), 0),
                    COALESCE(AVG(m.sp_n), 0),
                    COALESCE(AVG(m.sp_d), 0),
                    COALESCE(AVG(m.cust), 0),
                    COALESCE(AVG(m.pts), 0)
             FROM employee e
             LEFT JOIN daily_metric m ON m.employee_id = e.id AND m.date BETWEEN ?2 AND ?3
             WHERE e.store_id = ?1 AND e.status = 'Active'
             GROUP BY e.id
             ORDER BY e.name",
        )
        .map_err(|e| e.to_string())?;

    let employees: Vec<EmployeeCompare> = stmt
        .query_map(rusqlite::params![store_id, from, to], |row| {
            Ok(EmployeeCompare {
                id: row.get(0)?,
                name: row.get(1)?,
                initials: row.get(2)?,
                sp_pct: row.get(3)?,
                sp_n: row.get(4)?,
                sp_d: row.get(5)?,
                cust: row.get(6)?,
                pts_wk: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Calculate store means and medians from employee averages
    let store_mean = calc_mean_from_employees(&employees);
    let store_median = calc_median_from_employees(&employees);

    let days: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT date) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(CompareData {
        store,
        period: Period {
            label: format!("{} to {}", from, to),
            from,
            to,
            days,
        },
        goals,
        store_mean,
        store_median,
        employees,
    })
}

/// Get overview page data with chart series and summary cards.
#[tauri::command]
pub fn get_overview_data(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<OverviewData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let store = conn
        .query_row(
            "SELECT id, name, created_at FROM store WHERE id = ?1",
            [store_id],
            |row| {
                Ok(Store {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let goals = get_metric_goals(&conn, store_id)?;

    // Get distinct dates in range
    let mut date_stmt = conn
        .prepare(
            "SELECT DISTINCT date FROM daily_metric
             WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3
             ORDER BY date",
        )
        .map_err(|e| e.to_string())?;

    let dates: Vec<String> = date_stmt
        .query_map(rusqlite::params![store_id, from, to], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Build chart series for each metric
    let sp_pct_series = build_chart_series(&conn, store_id, &dates, "sp_pct", "SP %", "decimal2", goals.sp_pct)?;
    let cust_series = build_chart_series(&conn, store_id, &dates, "cust", "Cust #", "int", goals.cust)?;
    let sp_d_series = build_chart_series(&conn, store_id, &dates, "sp_d", "SP $", "dollar", goals.sp_d)?;
    let sp_n_series = build_chart_series(&conn, store_id, &dates, "sp_n", "SP #", "int", goals.sp_n)?;

    // Build summary cards
    let summary = build_summary_cards(&conn, store_id, &from, &to, &goals)?;

    Ok(OverviewData {
        store,
        period: Period {
            label: format!("{} to {}", from, to),
            from,
            to,
            days: dates.len() as i64,
        },
        summary,
        charts: ChartCollection {
            sp_pct: sp_pct_series,
            cust: cust_series,
            sp_d: sp_d_series,
            sp_n: sp_n_series,
        },
    })
}

/// Get heatmap data for a store date range (used in Goals page).
#[tauri::command]
pub fn get_heatmap(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<Vec<HeatmapDay>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let goals = get_metric_goals(&conn, store_id)?;

    let mut stmt = conn
        .prepare(
            "SELECT date,
                    COALESCE(AVG(sp_pct), 0),
                    COALESCE(AVG(cust), 0),
                    COALESCE(AVG(sp_d), 0),
                    COALESCE(AVG(sp_n), 0),
                    COALESCE(AVG(pts), 0)
             FROM daily_metric
             WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3
             GROUP BY date
             ORDER BY date",
        )
        .map_err(|e| e.to_string())?;

    let rows: Vec<HeatmapDay> = stmt
        .query_map(rusqlite::params![store_id, from, to], |row| {
            let date: String = row.get(0)?;
            let sp_pct: f64 = row.get(1)?;
            let cust: f64 = row.get(2)?;
            let sp_d: f64 = row.get(3)?;
            let sp_n: f64 = row.get(4)?;
            let pts: f64 = row.get(5)?;
            // Parse day name from date
            let day = date.clone(); // Frontend will format this
            Ok(HeatmapDay {
                date,
                day,
                sp_pct_hit: sp_pct >= goals.sp_pct,
                cust_hit: cust >= goals.cust,
                sp_d_hit: sp_d >= goals.sp_d,
                sp_n_hit: sp_n >= goals.sp_n,
                pts_wk_hit: pts >= goals.pts_wk,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(rows)
}

// ============================================================================
// Helper functions
// ============================================================================

/// Get goal values from the database for a store.
fn get_metric_goals(conn: &rusqlite::Connection, store_id: i64) -> Result<MetricGoals, String> {
    let mut goals = MetricGoals {
        sp_pct: 2.0,
        sp_n: 3.0,
        sp_d: 150.0,
        cust: 35.0,
        pts_wk: 7.0,
    };

    let mut stmt = conn
        .prepare("SELECT metric_key, value FROM goal WHERE store_id = ?1")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
        })
        .map_err(|e| e.to_string())?;

    for row in rows.flatten() {
        match row.0.as_str() {
            "sp_pct" => goals.sp_pct = row.1,
            "sp_n" => goals.sp_n = row.1,
            "sp_d" => goals.sp_d = row.1,
            "cust" => goals.cust = row.1,
            "pts_wk" => goals.pts_wk = row.1,
            _ => {}
        }
    }

    Ok(goals)
}

/// Calculate mean from a vector of EmployeeCompare.
fn calc_mean_from_employees(employees: &[EmployeeCompare]) -> MetricValues {
    if employees.is_empty() {
        return MetricValues { sp_pct: 0.0, sp_n: 0.0, sp_d: 0.0, cust: 0.0, pts_wk: 0.0 };
    }
    let n = employees.len() as f64;
    MetricValues {
        sp_pct: employees.iter().map(|e| e.sp_pct).sum::<f64>() / n,
        sp_n: employees.iter().map(|e| e.sp_n).sum::<f64>() / n,
        sp_d: employees.iter().map(|e| e.sp_d).sum::<f64>() / n,
        cust: employees.iter().map(|e| e.cust).sum::<f64>() / n,
        pts_wk: employees.iter().map(|e| e.pts_wk).sum::<f64>() / n,
    }
}

/// Calculate median from a vector of EmployeeCompare.
fn calc_median_from_employees(employees: &[EmployeeCompare]) -> MetricValues {
    fn median(vals: &mut Vec<f64>) -> f64 {
        if vals.is_empty() { return 0.0; }
        vals.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let mid = vals.len() / 2;
        if vals.len() % 2 == 0 { (vals[mid - 1] + vals[mid]) / 2.0 } else { vals[mid] }
    }

    let mut sp_pcts: Vec<f64> = employees.iter().map(|e| e.sp_pct).collect();
    let mut sp_ns: Vec<f64> = employees.iter().map(|e| e.sp_n).collect();
    let mut sp_ds: Vec<f64> = employees.iter().map(|e| e.sp_d).collect();
    let mut custs: Vec<f64> = employees.iter().map(|e| e.cust).collect();
    let mut pts: Vec<f64> = employees.iter().map(|e| e.pts_wk).collect();

    MetricValues {
        sp_pct: median(&mut sp_pcts),
        sp_n: median(&mut sp_ns),
        sp_d: median(&mut sp_ds),
        cust: median(&mut custs),
        pts_wk: median(&mut pts),
    }
}

/// Build a chart series for a given metric across dates.
fn build_chart_series(
    conn: &rusqlite::Connection,
    store_id: i64,
    dates: &[String],
    column: &str,
    label: &str,
    fmt: &str,
    goal: f64,
) -> Result<ChartSeries, String> {
    let mut values = Vec::new();
    let mut all_vals = Vec::new();

    for date in dates {
        let sql = format!(
            "SELECT COALESCE(AVG({}), 0) FROM daily_metric WHERE store_id = ?1 AND date = ?2",
            column
        );
        let val: f64 = conn
            .query_row(&sql, rusqlite::params![store_id, date], |row| row.get(0))
            .unwrap_or(0.0);
        values.push(val);
        all_vals.push(val);
    }

    let mean_val = if all_vals.is_empty() {
        0.0
    } else {
        all_vals.iter().sum::<f64>() / all_vals.len() as f64
    };

    all_vals.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median_val = if all_vals.is_empty() {
        0.0
    } else {
        let mid = all_vals.len() / 2;
        if all_vals.len() % 2 == 0 {
            (all_vals[mid - 1] + all_vals[mid]) / 2.0
        } else {
            all_vals[mid]
        }
    };

    let y_min = all_vals.first().copied().unwrap_or(0.0).min(goal) * 0.8;
    let y_max = all_vals.last().copied().unwrap_or(0.0).max(goal) * 1.2;

    Ok(ChartSeries {
        label: label.to_string(),
        values,
        dates: dates.to_vec(),
        y_min,
        y_max,
        goal_val: goal,
        mean_val,
        median_val,
        y_fmt: fmt.to_string(),
    })
}

/// Build summary cards for the overview page.
fn build_summary_cards(
    conn: &rusqlite::Connection,
    store_id: i64,
    from: &str,
    to: &str,
    goals: &MetricGoals,
) -> Result<Vec<SummaryCard>, String> {
    let metrics = [
        ("sp_pct", "Store Mean SP %", goals.sp_pct),
        ("cust", "Store Mean Cust #", goals.cust),
        ("sp_d", "Store Mean SP $", goals.sp_d),
        ("sp_n", "Store Mean SP #", goals.sp_n),
    ];

    let mut cards = Vec::new();
    for (col, label, goal) in &metrics {
        let sql = format!(
            "SELECT COALESCE(AVG({}), 0) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            col
        );
        let value: f64 = conn
            .query_row(&sql, rusqlite::params![store_id, from, to], |row| row.get(0))
            .unwrap_or(0.0);

        let median = calc_median(conn, store_id, from, to, col).unwrap_or(0.0);

        cards.push(SummaryCard {
            label: label.to_string(),
            value,
            median_value: median,
            trend: 0.0, // Would compare to prior period
            trend_dir: if value >= *goal { "up".to_string() } else { "down".to_string() },
            goal: *goal,
            goal_met: value >= *goal,
        });
    }

    Ok(cards)
}

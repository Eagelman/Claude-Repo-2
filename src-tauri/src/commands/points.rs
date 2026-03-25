//! Points system commands - leaderboard, config, and calculations.

use crate::db::DbState;
use crate::models::*;
use tauri::State;

/// Get full points page data.
#[tauri::command]
pub fn get_points_data(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<PointsData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let store = conn
        .query_row("SELECT id, name, created_at FROM store WHERE id = ?1", [store_id], |row| {
            Ok(Store { id: row.get(0)?, name: row.get(1)?, created_at: row.get(2)? })
        })
        .map_err(|e| e.to_string())?;

    // Get point system config
    let point_system = conn
        .query_row(
            "SELECT id, store_id, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note
             FROM point_system WHERE store_id = ?1",
            [store_id],
            |row| {
                Ok(PointSystem {
                    id: row.get(0)?,
                    store_id: row.get(1)?,
                    sp_pct_pts: row.get(2)?,
                    cust_pts: row.get(3)?,
                    sp_d_pts: row.get(4)?,
                    sp_n_pts: row.get(5)?,
                    pts_wk_bonus: row.get(6)?,
                    note: row.get(7)?,
                })
            },
        )
        .unwrap_or(PointSystem {
            id: None,
            store_id,
            sp_pct_pts: 2.0,
            cust_pts: 1.0,
            sp_d_pts: 1.0,
            sp_n_pts: 1.0,
            pts_wk_bonus: 2.0,
            note: None,
        });

    // Get goals for hit rate calculation
    let goals = get_goals_inner(&conn, store_id)?;

    // Get employees with their metrics
    let mut emp_stmt = conn
        .prepare(
            "SELECT id, name, initials FROM employee WHERE store_id = ?1 AND status = 'Active' ORDER BY name",
        )
        .map_err(|e| e.to_string())?;

    let emp_rows: Vec<(i64, String, String)> = emp_stmt
        .query_map([store_id], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let mut employees: Vec<PointsEmployee> = Vec::new();

    for (emp_id, name, initials) in &emp_rows {
        // Get all metrics for this employee in the period
        let mut m_stmt = conn
            .prepare(
                "SELECT date, sp_pct, sp_n, sp_d, cust, pts
                 FROM daily_metric
                 WHERE employee_id = ?1 AND date BETWEEN ?2 AND ?3
                 ORDER BY date",
            )
            .map_err(|e| e.to_string())?;

        let metrics: Vec<(String, Option<f64>, Option<f64>, Option<f64>, Option<i64>, Option<f64>)> = m_stmt
            .query_map(rusqlite::params![emp_id, from, to], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?))
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        // Calculate total points and hit rates
        let mut total_pts = 0.0_f64;
        let mut sp_pct_hits = 0_i64;
        let mut cust_hits = 0_i64;
        let mut sp_d_hits = 0_i64;
        let mut sp_n_hits = 0_i64;
        let total_days = metrics.len() as f64;
        let mut cust_total = 0.0_f64;

        for (_date, sp_pct, sp_n, sp_d, cust, pts) in &metrics {
            if let Some(p) = pts {
                total_pts += p;
            }
            if sp_pct.unwrap_or(0.0) >= goals.sp_pct { sp_pct_hits += 1; }
            if (cust.unwrap_or(0) as f64) >= goals.cust { cust_hits += 1; }
            if sp_d.unwrap_or(0.0) >= goals.sp_d { sp_d_hits += 1; }
            if sp_n.unwrap_or(0.0) >= goals.sp_n { sp_n_hits += 1; }
            cust_total += cust.unwrap_or(0) as f64;
        }

        let hit_rate = |hits: i64| -> f64 {
            if total_days > 0.0 { hits as f64 / total_days } else { 0.0 }
        };

        // Calculate weekly points (group by ISO week)
        let weekly_pts = calc_weekly_points(&metrics);

        employees.push(PointsEmployee {
            id: *emp_id,
            name: name.clone(),
            initials: initials.clone(),
            total_pts,
            rank: 0, // Will be set after sorting
            weekly_pts: weekly_pts.clone(),
            current_week_pts: weekly_pts.last().copied().unwrap_or(0.0),
            cust_pts: cust_total,
            metric_hit_rates: MetricValues {
                sp_pct: hit_rate(sp_pct_hits),
                sp_n: hit_rate(sp_n_hits),
                sp_d: hit_rate(sp_d_hits),
                cust: hit_rate(cust_hits),
                pts_wk: 0.0,
            },
        });
    }

    // Sort by total points descending and assign ranks
    employees.sort_by(|a, b| b.total_pts.partial_cmp(&a.total_pts).unwrap());
    for (i, emp) in employees.iter_mut().enumerate() {
        emp.rank = (i + 1) as i64;
    }

    // Store summary
    let total_associates = employees.len() as i64;
    let total_pts_sum: f64 = employees.iter().map(|e| e.total_pts).sum();
    let days_count: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT date) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| row.get(0),
        )
        .unwrap_or(1);

    let avg_pts_per_day = if total_associates > 0 && days_count > 0 {
        total_pts_sum / total_associates as f64 / days_count as f64
    } else {
        0.0
    };

    let weekly_goal = point_system.pts_wk_bonus * 5.0; // Rough weekly goal
    let associates_over_goal = employees.iter().filter(|e| e.current_week_pts >= weekly_goal).count() as i64;

    Ok(PointsData {
        store,
        period: Period {
            label: format!("{} to {}", from, to),
            from,
            to,
            days: days_count,
        },
        point_system,
        store_summary: PointsStoreSummary {
            avg_pts_per_day,
            weekly_pts_goal: weekly_goal,
            weekly_pts_earned: total_pts_sum,
            associates_over_goal,
            total_associates,
        },
        employees,
    })
}

/// Get point system configuration.
#[tauri::command]
pub fn get_point_system(state: State<DbState>, store_id: i64) -> Result<PointSystem, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, store_id, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note
         FROM point_system WHERE store_id = ?1",
        [store_id],
        |row| {
            Ok(PointSystem {
                id: row.get(0)?,
                store_id: row.get(1)?,
                sp_pct_pts: row.get(2)?,
                cust_pts: row.get(3)?,
                sp_d_pts: row.get(4)?,
                sp_n_pts: row.get(5)?,
                pts_wk_bonus: row.get(6)?,
                note: row.get(7)?,
            })
        },
    )
    .or_else(|_| {
        Ok(PointSystem {
            id: None,
            store_id,
            sp_pct_pts: 2.0,
            cust_pts: 1.0,
            sp_d_pts: 1.0,
            sp_n_pts: 1.0,
            pts_wk_bonus: 2.0,
            note: None,
        })
    })
}

/// Save point system configuration.
#[tauri::command]
pub fn save_point_system(state: State<DbState>, store_id: i64, config: PointSystem) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO point_system (store_id, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now'))
         ON CONFLICT(store_id) DO UPDATE SET
            sp_pct_pts = excluded.sp_pct_pts,
            cust_pts = excluded.cust_pts,
            sp_d_pts = excluded.sp_d_pts,
            sp_n_pts = excluded.sp_n_pts,
            pts_wk_bonus = excluded.pts_wk_bonus,
            note = excluded.note,
            updated_at = datetime('now')",
        rusqlite::params![
            store_id,
            config.sp_pct_pts,
            config.cust_pts,
            config.sp_d_pts,
            config.sp_n_pts,
            config.pts_wk_bonus,
            config.note,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get point exceptions for a store.
#[tauri::command]
pub fn get_point_exceptions(state: State<DbState>, store_id: i64) -> Result<Vec<PointException>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT pe.id, pe.store_id, pe.employee_id, e.name, pe.status, pe.goal, pe.locked
             FROM point_exception pe
             JOIN employee e ON e.id = pe.employee_id
             WHERE pe.store_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok(PointException {
                id: row.get(0)?,
                store_id: row.get(1)?,
                employee_id: row.get(2)?,
                name: row.get(3)?,
                status: row.get(4)?,
                goal: row.get(5)?,
                locked: row.get::<_, i64>(6)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Save point exceptions.
#[tauri::command]
pub fn save_point_exceptions(
    state: State<DbState>,
    store_id: i64,
    exceptions: Vec<PointException>,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    // Clear existing and re-insert
    conn.execute("DELETE FROM point_exception WHERE store_id = ?1", [store_id])
        .map_err(|e| e.to_string())?;

    for exc in &exceptions {
        conn.execute(
            "INSERT INTO point_exception (store_id, employee_id, status, goal, locked)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![store_id, exc.employee_id, exc.status, exc.goal, exc.locked as i64],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ============================================================================
// Helpers
// ============================================================================

fn get_goals_inner(conn: &rusqlite::Connection, store_id: i64) -> Result<MetricGoals, String> {
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

/// Group daily metrics into weekly point totals.
fn calc_weekly_points(
    metrics: &[(String, Option<f64>, Option<f64>, Option<f64>, Option<i64>, Option<f64>)],
) -> Vec<f64> {
    if metrics.is_empty() {
        return Vec::new();
    }

    // Group by 7-day windows
    let mut weekly = Vec::new();
    let mut week_total = 0.0_f64;
    let mut day_count = 0;

    for (_date, _sp_pct, _sp_n, _sp_d, _cust, pts) in metrics {
        week_total += pts.unwrap_or(0.0);
        day_count += 1;
        if day_count % 7 == 0 {
            weekly.push(week_total);
            week_total = 0.0;
        }
    }

    // Push remaining partial week
    if day_count % 7 != 0 {
        weekly.push(week_total);
    }

    weekly
}

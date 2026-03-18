//! Goal management commands.

use crate::db::DbState;
use crate::models::{Goal, GoalsData, MetricValues, Note, Performers, Period, PointException, PointSystem, Store};
use std::collections::HashMap;
use tauri::State;

/// Get all goals for a store.
#[tauri::command]
pub fn get_goals(state: State<DbState>, store_id: i64) -> Result<Vec<Goal>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store_id, metric_key, label, fmt, value, unit, locked, note, updated_at
             FROM goal WHERE store_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok(Goal {
                id: row.get(0)?,
                store_id: row.get(1)?,
                metric_key: row.get(2)?,
                label: row.get(3)?,
                fmt: row.get(4)?,
                value: row.get(5)?,
                unit: row.get(6)?,
                locked: row.get::<_, i64>(7)? != 0,
                note: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Save (upsert) goals for a store.
#[tauri::command]
pub fn save_goals(state: State<DbState>, store_id: i64, goals: Vec<Goal>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    for goal in &goals {
        conn.execute(
            "INSERT INTO goal (store_id, metric_key, label, fmt, value, unit, locked, note, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, datetime('now'))
             ON CONFLICT(store_id, metric_key) DO UPDATE SET
                label = excluded.label,
                fmt = excluded.fmt,
                value = excluded.value,
                unit = excluded.unit,
                locked = excluded.locked,
                note = excluded.note,
                updated_at = datetime('now')",
            rusqlite::params![
                store_id,
                goal.metric_key,
                goal.label,
                goal.fmt,
                goal.value,
                goal.unit,
                goal.locked as i64,
                goal.note,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Toggle the locked state of a goal.
#[tauri::command]
pub fn toggle_goal_lock(state: State<DbState>, goal_id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE goal SET locked = NOT locked, updated_at = datetime('now') WHERE id = ?1",
        [goal_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get the full goals page data payload.
#[tauri::command]
pub fn get_goals_data(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<GoalsData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let store = conn
        .query_row("SELECT id, name, created_at FROM store WHERE id = ?1", [store_id], |row| {
            Ok(Store { id: row.get(0)?, name: row.get(1)?, created_at: row.get(2)? })
        })
        .map_err(|e| e.to_string())?;

    // Get goals
    let mut goal_stmt = conn
        .prepare("SELECT id, store_id, metric_key, label, fmt, value, unit, locked, note FROM goal WHERE store_id = ?1")
        .map_err(|e| e.to_string())?;
    let goals: Vec<Goal> = goal_stmt
        .query_map([store_id], |row| {
            Ok(Goal {
                id: row.get(0)?,
                store_id: row.get(1)?,
                metric_key: row.get(2)?,
                label: row.get(3)?,
                fmt: row.get(4)?,
                value: row.get(5)?,
                unit: row.get(6)?,
                locked: row.get::<_, i64>(7)? != 0,
                note: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Get actuals (averages for the period)
    let actuals = get_period_actuals(&conn, store_id, &from, &to)?;

    // Get point system
    let point_system = get_point_system_inner(&conn, store_id)?;

    // Get notes grouped by month
    let mut note_stmt = conn
        .prepare("SELECT id, store_id, month, title, body, locked, author, category, censored, created_at, updated_at FROM note WHERE store_id = ?1 ORDER BY month, created_at")
        .map_err(|e| e.to_string())?;
    let all_notes: Vec<Note> = note_stmt
        .query_map([store_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                store_id: row.get(1)?,
                month: row.get(2)?,
                title: row.get(3)?,
                body: row.get(4)?,
                locked: row.get::<_, i64>(5)? != 0,
                author: row.get(6)?,
                category: row.get(7)?,
                censored: row.get::<_, i64>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let mut notes_map: HashMap<String, Vec<Note>> = HashMap::new();
    for note in all_notes {
        notes_map.entry(note.month.clone()).or_default().push(note);
    }

    // Get point exceptions
    let mut exc_stmt = conn
        .prepare(
            "SELECT pe.id, pe.store_id, pe.employee_id, e.name, pe.status, pe.goal, pe.locked
             FROM point_exception pe
             JOIN employee e ON e.id = pe.employee_id
             WHERE pe.store_id = ?1"
        )
        .map_err(|e| e.to_string())?;
    let pts_exceptions: Vec<PointException> = exc_stmt
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
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let days: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT date) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(GoalsData {
        store,
        manager: String::new(),
        period: Period {
            label: format!("{} to {}", from, to),
            from,
            to,
            days,
        },
        last_updated: chrono::Utc::now().format("%Y-%m-%d %H:%M").to_string(),
        goals,
        actuals: actuals.clone(),
        prior_actuals: actuals, // Would need prior period calculation
        point_system,
        pts_exceptions,
        performers: Performers {
            improvement: Vec::new(),
            best: Vec::new(),
        },
        notes: notes_map,
        heatmap: Vec::new(),
    })
}

/// Get average metric values for a period.
fn get_period_actuals(
    conn: &rusqlite::Connection,
    store_id: i64,
    from: &str,
    to: &str,
) -> Result<MetricValues, String> {
    conn.query_row(
        "SELECT
            COALESCE(AVG(sp_pct), 0),
            COALESCE(AVG(sp_n), 0),
            COALESCE(AVG(sp_d), 0),
            COALESCE(AVG(cust), 0),
            COALESCE(AVG(pts), 0)
         FROM daily_metric
         WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
        rusqlite::params![store_id, from, to],
        |row| {
            Ok(MetricValues {
                sp_pct: row.get(0)?,
                sp_n: row.get(1)?,
                sp_d: row.get(2)?,
                cust: row.get(3)?,
                pts_wk: row.get(4)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

/// Get point system config from database.
fn get_point_system_inner(conn: &rusqlite::Connection, store_id: i64) -> Result<PointSystem, String> {
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
        // Return defaults if not configured yet
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

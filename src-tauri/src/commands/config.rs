use crate::db::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

// ── Goals Config ─────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GoalConfig {
    pub id: Option<i64>,
    pub store: String,
    pub metric_key: String,
    pub label: String,
    pub fmt: String,
    pub value: f64,
    pub unit: String,
    pub locked: bool,
    pub note: String,
}

#[tauri::command]
pub fn get_goals(db: State<'_, Database>, store: String) -> Result<Vec<GoalConfig>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, metric_key, label, fmt, value, unit, locked, note
             FROM goals_config WHERE store = ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store], |row| {
            Ok(GoalConfig {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                metric_key: row.get(2)?,
                label: row.get(3)?,
                fmt: row.get(4)?,
                value: row.get(5)?,
                unit: row.get(6)?,
                locked: row.get::<_, i32>(7)? != 0,
                note: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_goals(db: State<'_, Database>, goals: Vec<GoalConfig>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    {
        let mut stmt = tx
            .prepare_cached(
                "INSERT OR REPLACE INTO goals_config
                 (store, metric_key, label, fmt, value, unit, locked, note)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            )
            .map_err(|e| e.to_string())?;

        for g in &goals {
            stmt.execute(params![
                g.store,
                g.metric_key,
                g.label,
                g.fmt,
                g.value,
                g.unit,
                g.locked as i32,
                g.note,
            ])
            .map_err(|e| e.to_string())?;
        }
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

// ── Point System ─────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PointSystem {
    pub store: String,
    pub sp_pct_pts: f64,
    pub cust_pts: f64,
    pub sp_d_pts: f64,
    pub sp_n_pts: f64,
    pub pts_wk_bonus: f64,
    pub note: String,
}

#[tauri::command]
pub fn get_point_system(
    db: State<'_, Database>,
    store: String,
) -> Result<Option<PointSystem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let result = conn.query_row(
        "SELECT store, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note
         FROM point_system WHERE store = ?1",
        params![store],
        |row| {
            Ok(PointSystem {
                store: row.get(0)?,
                sp_pct_pts: row.get(1)?,
                cust_pts: row.get(2)?,
                sp_d_pts: row.get(3)?,
                sp_n_pts: row.get(4)?,
                pts_wk_bonus: row.get(5)?,
                note: row.get(6)?,
            })
        },
    );

    match result {
        Ok(ps) => Ok(Some(ps)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn save_point_system(db: State<'_, Database>, ps: PointSystem) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO point_system
         (store, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            ps.store,
            ps.sp_pct_pts,
            ps.cust_pts,
            ps.sp_d_pts,
            ps.sp_n_pts,
            ps.pts_wk_bonus,
            ps.note,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Notes ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: Option<i64>,
    pub store: String,
    pub month: String,
    pub title: String,
    pub body: String,
    pub category: String,
    pub author: String,
    pub locked: bool,
    pub censored: bool,
    pub created_at: Option<String>,
}

#[tauri::command]
pub fn get_notes(
    db: State<'_, Database>,
    store: String,
    month: String,
) -> Result<Vec<Note>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, month, title, body, category, author, locked, censored, created_at
             FROM notes WHERE store = ?1 AND month = ?2
             ORDER BY created_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, month], |row| {
            Ok(Note {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                month: row.get(2)?,
                title: row.get(3)?,
                body: row.get(4)?,
                category: row.get(5)?,
                author: row.get(6)?,
                locked: row.get::<_, i32>(7)? != 0,
                censored: row.get::<_, i32>(8)? != 0,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_note(db: State<'_, Database>, note: Note) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    if let Some(id) = note.id {
        conn.execute(
            "UPDATE notes SET title=?1, body=?2, category=?3, locked=?4, censored=?5
             WHERE id=?6",
            params![
                note.title,
                note.body,
                note.category,
                note.locked as i32,
                note.censored as i32,
                id,
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(id)
    } else {
        conn.execute(
            "INSERT INTO notes (store, month, title, body, category, author, locked, censored)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                note.store,
                note.month,
                note.title,
                note.body,
                note.category,
                note.author,
                note.locked as i32,
                note.censored as i32,
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }
}

#[tauri::command]
pub fn delete_note(db: State<'_, Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Gift Cards ───────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GiftCard {
    pub id: String,
    pub store: String,
    pub employee_name: String,
    pub tag: String,
    pub amount: f64,
    pub date: String,
    pub status: String,
    pub note: String,
}

#[tauri::command]
pub fn get_gift_cards(db: State<'_, Database>, store: String) -> Result<Vec<GiftCard>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, employee_name, tag, amount, date, status, note
             FROM gift_cards WHERE store = ?1
             ORDER BY date DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store], |row| {
            Ok(GiftCard {
                id: row.get(0)?,
                store: row.get(1)?,
                employee_name: row.get(2)?,
                tag: row.get(3)?,
                amount: row.get(4)?,
                date: row.get(5)?,
                status: row.get(6)?,
                note: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_gift_card(db: State<'_, Database>, gc: GiftCard) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO gift_cards
         (id, store, employee_name, tag, amount, date, status, note)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            gc.id,
            gc.store,
            gc.employee_name,
            gc.tag,
            gc.amount,
            gc.date,
            gc.status,
            gc.note,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_gift_card(db: State<'_, Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM gift_cards WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Trifecta Config ──────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TrifectaConfig {
    pub store: String,
    pub sp_d_goal: f64,
    pub cust_goal: f64,
    pub sp_n_goal: f64,
    pub double_sp_d: f64,
    pub double_sp_n: f64,
    pub double_cust: f64,
    pub elite_sp_d: f64,
    pub elite_sp_n: f64,
    pub elite_cust: f64,
    pub fw_count: f64,
    pub fw_tier: f64,
    pub fw_super: f64,
    pub fw_avg_sp_d: f64,
    pub fw_avg_cust: f64,
}

#[tauri::command]
pub fn get_trifecta_config(
    db: State<'_, Database>,
    store: String,
) -> Result<Option<TrifectaConfig>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let result = conn.query_row(
        "SELECT store, sp_d_goal, cust_goal, sp_n_goal,
                double_sp_d, double_sp_n, double_cust,
                elite_sp_d, elite_sp_n, elite_cust,
                fw_count, fw_tier, fw_super, fw_avg_sp_d, fw_avg_cust
         FROM trifecta_config WHERE store = ?1",
        params![store],
        |row| {
            Ok(TrifectaConfig {
                store: row.get(0)?,
                sp_d_goal: row.get(1)?,
                cust_goal: row.get(2)?,
                sp_n_goal: row.get(3)?,
                double_sp_d: row.get(4)?,
                double_sp_n: row.get(5)?,
                double_cust: row.get(6)?,
                elite_sp_d: row.get(7)?,
                elite_sp_n: row.get(8)?,
                elite_cust: row.get(9)?,
                fw_count: row.get(10)?,
                fw_tier: row.get(11)?,
                fw_super: row.get(12)?,
                fw_avg_sp_d: row.get(13)?,
                fw_avg_cust: row.get(14)?,
            })
        },
    );

    match result {
        Ok(tc) => Ok(Some(tc)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn save_trifecta_config(db: State<'_, Database>, config: TrifectaConfig) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO trifecta_config
         (store, sp_d_goal, cust_goal, sp_n_goal,
          double_sp_d, double_sp_n, double_cust,
          elite_sp_d, elite_sp_n, elite_cust,
          fw_count, fw_tier, fw_super, fw_avg_sp_d, fw_avg_cust)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)",
        params![
            config.store,
            config.sp_d_goal,
            config.cust_goal,
            config.sp_n_goal,
            config.double_sp_d,
            config.double_sp_n,
            config.double_cust,
            config.elite_sp_d,
            config.elite_sp_n,
            config.elite_cust,
            config.fw_count,
            config.fw_tier,
            config.fw_super,
            config.fw_avg_sp_d,
            config.fw_avg_cust,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Employee Exceptions & Personal Goals ─────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EmployeeException {
    pub id: Option<i64>,
    pub store: String,
    pub employee_name: String,
    pub metric_key: String,
    pub default_goal: Option<f64>,
    pub override_val: Option<f64>,
    pub locked: bool,
    pub reason: String,
}

#[tauri::command]
pub fn get_employee_exceptions(
    db: State<'_, Database>,
    store: String,
    employee_name: String,
) -> Result<Vec<EmployeeException>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, employee_name, metric_key, default_goal, override_val, locked, reason
             FROM employee_exceptions WHERE store = ?1 AND employee_name = ?2",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, employee_name], |row| {
            Ok(EmployeeException {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                employee_name: row.get(2)?,
                metric_key: row.get(3)?,
                default_goal: row.get(4)?,
                override_val: row.get(5)?,
                locked: row.get::<_, i32>(6)? != 0,
                reason: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_employee_exceptions(
    db: State<'_, Database>,
    exceptions: Vec<EmployeeException>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    for exc in &exceptions {
        if let Some(id) = exc.id {
            tx.execute(
                "UPDATE employee_exceptions SET metric_key=?1, default_goal=?2,
                 override_val=?3, locked=?4, reason=?5 WHERE id=?6",
                params![
                    exc.metric_key,
                    exc.default_goal,
                    exc.override_val,
                    exc.locked as i32,
                    exc.reason,
                    id,
                ],
            )
            .map_err(|e| e.to_string())?;
        } else {
            tx.execute(
                "INSERT INTO employee_exceptions
                 (store, employee_name, metric_key, default_goal, override_val, locked, reason)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    exc.store,
                    exc.employee_name,
                    exc.metric_key,
                    exc.default_goal,
                    exc.override_val,
                    exc.locked as i32,
                    exc.reason,
                ],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PersonalGoal {
    pub id: Option<i64>,
    pub store: String,
    pub employee_name: String,
    pub metric_key: String,
    pub val: String,
    pub unit: String,
    pub locked: bool,
    pub note: String,
}

#[tauri::command]
pub fn get_personal_goals(
    db: State<'_, Database>,
    store: String,
    employee_name: String,
) -> Result<Vec<PersonalGoal>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, employee_name, metric_key, val, unit, locked, note
             FROM personal_goals WHERE store = ?1 AND employee_name = ?2",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, employee_name], |row| {
            Ok(PersonalGoal {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                employee_name: row.get(2)?,
                metric_key: row.get(3)?,
                val: row.get(4)?,
                unit: row.get(5)?,
                locked: row.get::<_, i32>(6)? != 0,
                note: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_personal_goals(
    db: State<'_, Database>,
    goals: Vec<PersonalGoal>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    for g in &goals {
        if let Some(id) = g.id {
            tx.execute(
                "UPDATE personal_goals SET val=?1, unit=?2, locked=?3, note=?4 WHERE id=?5",
                params![g.val, g.unit, g.locked as i32, g.note, id],
            )
            .map_err(|e| e.to_string())?;
        } else {
            tx.execute(
                "INSERT INTO personal_goals
                 (store, employee_name, metric_key, val, unit, locked, note)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    g.store,
                    g.employee_name,
                    g.metric_key,
                    g.val,
                    g.unit,
                    g.locked as i32,
                    g.note,
                ],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

// ── Pts Exceptions ───────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PtsException {
    pub id: Option<i64>,
    pub store: String,
    pub employee_name: String,
    pub status: String,
    pub goal_override: Option<f64>,
    pub locked: bool,
}

#[tauri::command]
pub fn get_pts_exceptions(
    db: State<'_, Database>,
    store: String,
) -> Result<Vec<PtsException>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, employee_name, status, goal_override, locked
             FROM pts_exceptions WHERE store = ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store], |row| {
            Ok(PtsException {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                employee_name: row.get(2)?,
                status: row.get(3)?,
                goal_override: row.get(4)?,
                locked: row.get::<_, i32>(5)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_pts_exceptions(
    db: State<'_, Database>,
    exceptions: Vec<PtsException>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;

    // Clear existing and re-insert
    if let Some(first) = exceptions.first() {
        tx.execute(
            "DELETE FROM pts_exceptions WHERE store = ?1",
            params![first.store],
        )
        .map_err(|e| e.to_string())?;
    }

    for exc in &exceptions {
        tx.execute(
            "INSERT INTO pts_exceptions (store, employee_name, status, goal_override, locked)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                exc.store,
                exc.employee_name,
                exc.status,
                exc.goal_override,
                exc.locked as i32,
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

// ── Roster ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RosterEntry {
    pub id: Option<i64>,
    pub store: String,
    pub dept: String,
    pub last_name: String,
    pub first_name: String,
    pub active: bool,
}

#[tauri::command]
pub fn get_roster(
    db: State<'_, Database>,
    store: String,
    dept: String,
) -> Result<Vec<RosterEntry>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store, dept, last_name, first_name, active
             FROM roster WHERE store = ?1 AND dept = ?2 AND active = 1
             ORDER BY last_name ASC, first_name ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, dept], |row| {
            Ok(RosterEntry {
                id: Some(row.get(0)?),
                store: row.get(1)?,
                dept: row.get(2)?,
                last_name: row.get(3)?,
                first_name: row.get(4)?,
                active: row.get::<_, i32>(5)? != 0,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

#[tauri::command]
pub fn save_roster(db: State<'_, Database>, roster: Vec<RosterEntry>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;

    if let Some(first) = roster.first() {
        tx.execute(
            "DELETE FROM roster WHERE store = ?1 AND dept = ?2",
            params![first.store, first.dept],
        )
        .map_err(|e| e.to_string())?;
    }

    for r in &roster {
        tx.execute(
            "INSERT INTO roster (store, dept, last_name, first_name, active)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![r.store, r.dept, r.last_name, r.first_name, r.active as i32],
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

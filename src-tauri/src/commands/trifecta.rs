//! Trifecta rewards system commands - achievement tracking, gift cards, scoring.

use crate::db::DbState;
use crate::models::*;
use tauri::State;

/// Get full trifecta page data.
#[tauri::command]
pub fn get_trifecta_data(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
) -> Result<TrifectaData, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let store = conn
        .query_row("SELECT id, name, created_at FROM store WHERE id = ?1", [store_id], |row| {
            Ok(Store { id: row.get(0)?, name: row.get(1)?, created_at: row.get(2)? })
        })
        .map_err(|e| e.to_string())?;

    // Get goals for trifecta thresholds
    let mut goal_sp_d = 150.0_f64;
    let mut goal_cust = 35_i64;
    let mut goal_sp_n = 3.0_f64;
    {
        let mut stmt = conn.prepare("SELECT metric_key, value FROM goal WHERE store_id = ?1")
            .map_err(|e| e.to_string())?;
        let rows = stmt.query_map([store_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
        }).map_err(|e| e.to_string())?;
        for row in rows.flatten() {
            match row.0.as_str() {
                "sp_d" => goal_sp_d = row.1,
                "cust" => goal_cust = row.1 as i64,
                "sp_n" => goal_sp_n = row.1,
                _ => {}
            }
        }
    }

    // Get formula
    let formula = conn
        .query_row(
            "SELECT id, store_id, spd_mult, spd_weight, cust_mult, cust_weight, spn_weight
             FROM trifecta_formula WHERE store_id = ?1",
            [store_id],
            |row| {
                Ok(TrifectaFormula {
                    id: row.get(0)?,
                    store_id: row.get(1)?,
                    spd_mult: row.get(2)?,
                    spd_weight: row.get(3)?,
                    cust_mult: row.get(4)?,
                    cust_weight: row.get(5)?,
                    spn_weight: row.get(6)?,
                })
            },
        )
        .unwrap_or(TrifectaFormula {
            id: None,
            store_id,
            spd_mult: 1.0,
            spd_weight: 1.0,
            cust_mult: 1.0,
            cust_weight: 1.0,
            spn_weight: 1.0,
        });

    // Get employees with their trifecta records
    let mut emp_stmt = conn
        .prepare("SELECT id, name, initials FROM employee WHERE store_id = ?1 AND status = 'Active' ORDER BY name")
        .map_err(|e| e.to_string())?;
    let emp_rows: Vec<(i64, String, String)> = emp_stmt
        .query_map([store_id], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let mut employees = Vec::new();
    for (emp_id, name, initials) in emp_rows {
        let mut tri_stmt = conn
            .prepare(
                "SELECT id, employee_id, date, tier, sp_d, cust, sp_n, archived
                 FROM trifecta
                 WHERE employee_id = ?1 AND store_id = ?2 AND date BETWEEN ?3 AND ?4
                 ORDER BY date",
            )
            .map_err(|e| e.to_string())?;

        let trifectas: Vec<TrifectaRecord> = tri_stmt
            .query_map(rusqlite::params![emp_id, store_id, from, to], |row| {
                Ok(TrifectaRecord {
                    id: row.get(0)?,
                    employee_id: row.get(1)?,
                    date: row.get(2)?,
                    tier: row.get(3)?,
                    sp_d: row.get(4)?,
                    cust: row.get(5)?,
                    sp_n: row.get(6)?,
                    archived: row.get::<_, i64>(7)? != 0,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        employees.push(TrifectaEmployee {
            id: emp_id,
            name,
            initials,
            trifectas,
        });
    }

    // Get gift cards
    let mut gc_stmt = conn
        .prepare(
            "SELECT id, employee_id, store_id, amount, status, fulfilled_date, notes, created_at
             FROM gift_card WHERE store_id = ?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let gift_cards: Vec<GiftCard> = gc_stmt
        .query_map([store_id], |row| {
            Ok(GiftCard {
                id: row.get(0)?,
                employee_id: row.get(1)?,
                store_id: row.get(2)?,
                amount: row.get(3)?,
                status: row.get(4)?,
                fulfilled_date: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Get audit log
    let mut audit_stmt = conn
        .prepare(
            "SELECT id, store_id, action, user_name, details, created_at
             FROM audit_log WHERE store_id = ?1 ORDER BY created_at DESC LIMIT 100",
        )
        .map_err(|e| e.to_string())?;
    let audit_log: Vec<AuditEntry> = audit_stmt
        .query_map([store_id], |row| {
            Ok(AuditEntry {
                id: row.get(0)?,
                store_id: row.get(1)?,
                action: row.get(2)?,
                user_name: row.get(3)?,
                details: row.get(4)?,
                created_at: row.get(5)?,
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

    Ok(TrifectaData {
        store,
        period: Period {
            label: format!("{} to {}", from, to),
            from,
            to,
            days,
        },
        goals: TrifectaGoals {
            sp_d: goal_sp_d,
            cust: goal_cust,
            sp_n: goal_sp_n,
        },
        formula,
        employees,
        gift_cards,
        audit_log,
    })
}

/// Add a trifecta record.
#[tauri::command]
pub fn add_trifecta(
    state: State<DbState>,
    employee_id: i64,
    store_id: i64,
    date: String,
    tier: i64,
    sp_d: f64,
    cust: i64,
    sp_n: f64,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO trifecta (employee_id, store_id, date, tier, sp_d, cust, sp_n)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(employee_id, date) DO UPDATE SET
            tier = excluded.tier,
            sp_d = excluded.sp_d,
            cust = excluded.cust,
            sp_n = excluded.sp_n",
        rusqlite::params![employee_id, store_id, date, tier, sp_d, cust, sp_n],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Archive trifecta records by IDs.
#[tauri::command]
pub fn archive_trifectas(state: State<DbState>, ids: Vec<i64>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    for id in &ids {
        conn.execute(
            "UPDATE trifecta SET archived = 1 WHERE id = ?1",
            [id],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Get trifecta formula.
#[tauri::command]
pub fn get_trifecta_formula(state: State<DbState>, store_id: i64) -> Result<TrifectaFormula, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, store_id, spd_mult, spd_weight, cust_mult, cust_weight, spn_weight
         FROM trifecta_formula WHERE store_id = ?1",
        [store_id],
        |row| {
            Ok(TrifectaFormula {
                id: row.get(0)?,
                store_id: row.get(1)?,
                spd_mult: row.get(2)?,
                spd_weight: row.get(3)?,
                cust_mult: row.get(4)?,
                cust_weight: row.get(5)?,
                spn_weight: row.get(6)?,
            })
        },
    )
    .or_else(|_| {
        Ok(TrifectaFormula {
            id: None,
            store_id,
            spd_mult: 1.0,
            spd_weight: 1.0,
            cust_mult: 1.0,
            cust_weight: 1.0,
            spn_weight: 1.0,
        })
    })
}

/// Save trifecta formula.
#[tauri::command]
pub fn save_trifecta_formula(state: State<DbState>, store_id: i64, formula: TrifectaFormula) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO trifecta_formula (store_id, spd_mult, spd_weight, cust_mult, cust_weight, spn_weight, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))
         ON CONFLICT(store_id) DO UPDATE SET
            spd_mult = excluded.spd_mult,
            spd_weight = excluded.spd_weight,
            cust_mult = excluded.cust_mult,
            cust_weight = excluded.cust_weight,
            spn_weight = excluded.spn_weight,
            updated_at = datetime('now')",
        rusqlite::params![
            store_id, formula.spd_mult, formula.spd_weight,
            formula.cust_mult, formula.cust_weight, formula.spn_weight,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Add a gift card.
#[tauri::command]
pub fn add_gift_card(
    state: State<DbState>,
    employee_id: i64,
    store_id: i64,
    amount: f64,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO gift_card (employee_id, store_id, amount) VALUES (?1, ?2, ?3)",
        rusqlite::params![employee_id, store_id, amount],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get gift cards for a store.
#[tauri::command]
pub fn get_gift_cards(state: State<DbState>, store_id: i64) -> Result<Vec<GiftCard>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, employee_id, store_id, amount, status, fulfilled_date, notes, created_at
             FROM gift_card WHERE store_id = ?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok(GiftCard {
                id: row.get(0)?,
                employee_id: row.get(1)?,
                store_id: row.get(2)?,
                amount: row.get(3)?,
                status: row.get(4)?,
                fulfilled_date: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Add an audit log entry.
#[tauri::command]
pub fn add_audit(
    state: State<DbState>,
    store_id: i64,
    action: String,
    user_name: Option<String>,
    details: Option<String>,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO audit_log (store_id, action, user_name, details) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![store_id, action, user_name, details],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

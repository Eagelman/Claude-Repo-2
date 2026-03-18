//! Employee roster CRUD commands.

use crate::db::DbState;
use crate::models::Employee;
use tauri::State;

/// Get all employees for a store.
#[tauri::command]
pub fn get_employees(state: State<DbState>, store_id: i64) -> Result<Vec<Employee>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store_id, name, initials, status, weeks_on_record, created_at, updated_at
             FROM employee WHERE store_id = ?1 ORDER BY name",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok(Employee {
                id: row.get(0)?,
                store_id: row.get(1)?,
                name: row.get(2)?,
                initials: row.get(3)?,
                status: row.get(4)?,
                weeks_on_record: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Insert or update an employee. Returns the employee record.
#[tauri::command]
pub fn upsert_employee(
    state: State<DbState>,
    store_id: i64,
    name: String,
    initials: String,
    status: String,
) -> Result<Employee, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO employee (store_id, name, initials, status)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(store_id, name) DO UPDATE SET
            initials = excluded.initials,
            status = excluded.status,
            updated_at = datetime('now')",
        rusqlite::params![store_id, name, initials, status],
    )
    .map_err(|e| {
        // If unique constraint doesn't exist on (store_id, name), do a fallback
        // Try to find existing or insert
        e.to_string()
    })?;

    let emp = conn.query_row(
        "SELECT id, store_id, name, initials, status, weeks_on_record, created_at, updated_at
         FROM employee WHERE store_id = ?1 AND name = ?2",
        rusqlite::params![store_id, name],
        |row| {
            Ok(Employee {
                id: row.get(0)?,
                store_id: row.get(1)?,
                name: row.get(2)?,
                initials: row.get(3)?,
                status: row.get(4)?,
                weeks_on_record: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    ).map_err(|e| e.to_string())?;

    Ok(emp)
}

/// Update employee status (Active, Part-time, Seasonal, Inactive).
#[tauri::command]
pub fn update_employee_status(
    state: State<DbState>,
    employee_id: i64,
    status: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employee SET status = ?1, updated_at = datetime('now') WHERE id = ?2",
        rusqlite::params![status, employee_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

//! Import commands - bulk insert metrics from Excel extraction.

use crate::db::DbState;
use crate::models::{ImportLog, ImportRecord};
use tauri::State;

/// Bulk import metrics from the GS Report Extractor.
/// Each record represents one employee's data for one day.
/// Automatically creates employees if they don't exist.
#[tauri::command]
pub fn import_metrics(
    state: State<DbState>,
    store_id: i64,
    filename: String,
    records: Vec<ImportRecord>,
) -> Result<i64, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut imported = 0_i64;

    for record in &records {
        // Ensure employee exists
        conn.execute(
            "INSERT OR IGNORE INTO employee (store_id, name, initials, status)
             VALUES (?1, ?2, ?3, 'Active')",
            rusqlite::params![store_id, record.employee_name, record.employee_initials],
        )
        .map_err(|e| e.to_string())?;

        // Get employee ID
        let emp_id: i64 = conn
            .query_row(
                "SELECT id FROM employee WHERE store_id = ?1 AND name = ?2",
                rusqlite::params![store_id, record.employee_name],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        // Upsert the daily metric
        conn.execute(
            "INSERT INTO daily_metric (employee_id, store_id, date, sp_pct, sp_n, sp_d, cust)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(employee_id, date) DO UPDATE SET
                sp_pct = excluded.sp_pct,
                sp_n = excluded.sp_n,
                sp_d = excluded.sp_d,
                cust = excluded.cust",
            rusqlite::params![
                emp_id,
                store_id,
                record.date,
                record.sp_pct,
                record.sp_n,
                record.sp_d,
                record.cust,
            ],
        )
        .map_err(|e| e.to_string())?;

        imported += 1;
    }

    // Log the import
    conn.execute(
        "INSERT INTO import_log (store_id, filename, records) VALUES (?1, ?2, ?3)",
        rusqlite::params![store_id, filename, imported],
    )
    .map_err(|e| e.to_string())?;

    // Add audit entry
    conn.execute(
        "INSERT INTO audit_log (store_id, action, details) VALUES (?1, 'import', ?2)",
        rusqlite::params![
            store_id,
            format!("Imported {} records from {}", imported, filename),
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(imported)
}

/// Get import history for a store.
#[tauri::command]
pub fn get_import_history(state: State<DbState>, store_id: i64) -> Result<Vec<ImportLog>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store_id, filename, records, imported_at
             FROM import_log WHERE store_id = ?1 ORDER BY imported_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([store_id], |row| {
            Ok(ImportLog {
                id: row.get(0)?,
                store_id: row.get(1)?,
                filename: row.get(2)?,
                records: row.get(3)?,
                imported_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

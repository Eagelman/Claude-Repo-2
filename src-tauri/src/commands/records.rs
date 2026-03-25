use crate::db::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyRecord {
    pub id: Option<i64>,
    pub date: String,
    pub source_file: Option<String>,
    pub store: String,
    pub dept: String,
    pub last_name: String,
    pub first_name: String,
    pub cust_num: f64,
    pub sp_qty: f64,
    pub sp_sales: f64,
    pub sp_pct: f64,
}

/// Save records from the Extractor to the database.
/// Uses INSERT OR REPLACE to handle duplicates (same date+store+dept+name).
#[tauri::command]
pub fn save_records(db: State<'_, Database>, records: Vec<DailyRecord>) -> Result<usize, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut count = 0;

    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    {
        let mut stmt = tx
            .prepare_cached(
                "INSERT OR REPLACE INTO daily_records
                 (date, source_file, store, dept, last_name, first_name, cust_num, sp_qty, sp_sales, sp_pct)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            )
            .map_err(|e| e.to_string())?;

        for r in &records {
            stmt.execute(params![
                r.date,
                r.source_file,
                r.store,
                r.dept,
                r.last_name,
                r.first_name,
                r.cust_num,
                r.sp_qty,
                r.sp_sales,
                r.sp_pct,
            ])
            .map_err(|e| e.to_string())?;
            count += 1;
        }
    }
    tx.commit().map_err(|e| e.to_string())?;

    Ok(count)
}

/// Get all records for a store/dept within a date range.
#[tauri::command]
pub fn get_records(
    db: State<'_, Database>,
    store: String,
    dept: String,
    date_from: String,
    date_to: String,
) -> Result<Vec<DailyRecord>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, date, source_file, store, dept, last_name, first_name,
                    cust_num, sp_qty, sp_sales, sp_pct
             FROM daily_records
             WHERE store = ?1 AND dept = ?2 AND date >= ?3 AND date <= ?4
             ORDER BY date ASC, last_name ASC, first_name ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, dept, date_from, date_to], |row| {
            Ok(DailyRecord {
                id: Some(row.get(0)?),
                date: row.get(1)?,
                source_file: row.get(2)?,
                store: row.get(3)?,
                dept: row.get(4)?,
                last_name: row.get(5)?,
                first_name: row.get(6)?,
                cust_num: row.get(7)?,
                sp_qty: row.get(8)?,
                sp_sales: row.get(9)?,
                sp_pct: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

/// Get all unique dates that have records for a store.
#[tauri::command]
pub fn get_available_dates(
    db: State<'_, Database>,
    store: String,
    dept: String,
) -> Result<Vec<String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT date FROM daily_records
             WHERE store = ?1 AND dept = ?2
             ORDER BY date DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![store, dept], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

/// Get the most recent upload date.
#[tauri::command]
pub fn get_last_upload_date(
    db: State<'_, Database>,
    store: String,
) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let result = conn
        .query_row(
            "SELECT MAX(date) FROM daily_records WHERE store = ?1",
            params![store],
            |row| row.get::<_, Option<String>>(0),
        )
        .map_err(|e| e.to_string())?;
    Ok(result)
}

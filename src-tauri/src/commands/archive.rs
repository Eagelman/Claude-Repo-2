use crate::db::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveEntry {
    pub filename: String,
    pub path: String,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub record_count: Option<i64>,
    pub created_at: Option<String>,
}

/// Export records as a CSV file to archive/YYYY/MM/ folder structure.
/// Returns the path of the created CSV file.
#[tauri::command]
pub fn export_csv_archive(
    db: State<'_, Database>,
    archive_dir: String,
    store: String,
    dept: String,
    date_from: String,
    date_to: String,
) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Fetch records
    let mut stmt = conn
        .prepare(
            "SELECT date, store, dept, last_name, first_name, cust_num, sp_qty, sp_sales, sp_pct
             FROM daily_records
             WHERE store = ?1 AND dept = ?2 AND date >= ?3 AND date <= ?4
             ORDER BY date DESC, last_name ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows: Vec<(String, String, String, String, String, f64, f64, f64, f64)> = stmt
        .query_map(params![store, dept, date_from, date_to], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, f64>(5)?,
                row.get::<_, f64>(6)?,
                row.get::<_, f64>(7)?,
                row.get::<_, f64>(8)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    if rows.is_empty() {
        return Err("No records found for the specified date range".to_string());
    }

    // Determine year/month from the date_from for folder structure
    let year = &date_from[..4];
    let month = &date_from[5..7];

    // Create directory: archive/YYYY/MM/
    let dir = PathBuf::from(&archive_dir)
        .join(year)
        .join(month);
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Build filename
    let filename = format!(
        "Daily{}Sales-{}-to-{}.csv",
        dept,
        date_from.replace('-', ""),
        date_to.replace('-', "")
    );
    let filepath = dir.join(&filename);

    // Write CSV
    let mut wtr = csv::Writer::from_path(&filepath).map_err(|e| e.to_string())?;

    wtr.write_record(&[
        "Date", "Store", "Dept", "Last Name", "First Name", "Cust #", "SP Qty", "SP $", "SP %",
    ])
    .map_err(|e| e.to_string())?;

    let mut last_date = String::new();
    for (date, store_v, dept_v, ln, fn_, cn, sq, ss, sp) in &rows {
        // Add separator between date groups
        if !last_date.is_empty() && date != &last_date {
            wtr.write_record(&["---", "---", "---", "---", "---", "---", "---", "---", "---"])
                .map_err(|e| e.to_string())?;
        }
        last_date = date.clone();

        let pct_str = if *sp < 1.0 {
            format!("{:.4}", sp * 100.0)
        } else {
            format!("{:.4}", sp)
        };

        wtr.write_record(&[
            date.as_str(),
            store_v.as_str(),
            dept_v.as_str(),
            ln.as_str(),
            fn_.as_str(),
            &cn.to_string(),
            &sq.to_string(),
            &format!("{:.2}", ss),
            &pct_str,
        ])
        .map_err(|e| e.to_string())?;
    }

    wtr.flush().map_err(|e| e.to_string())?;

    // Log the archive export
    conn.execute(
        "INSERT INTO archive_log (filename, path, date_from, date_to, record_count)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            filename,
            filepath.to_string_lossy().to_string(),
            date_from,
            date_to,
            rows.len() as i64,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(filepath.to_string_lossy().to_string())
}

/// Get list of archived CSV files.
#[tauri::command]
pub fn get_archive_log(db: State<'_, Database>) -> Result<Vec<ArchiveEntry>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT filename, path, date_from, date_to, record_count, created_at
             FROM archive_log ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ArchiveEntry {
                filename: row.get(0)?,
                path: row.get(1)?,
                date_from: row.get(2)?,
                date_to: row.get(3)?,
                record_count: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}

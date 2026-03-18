//! Archive commands - query historical data by day, month, quarter, year.
//! The archive is the persistent data layer backed by the SQLite database.

use chrono::Datelike;
use crate::db::DbState;
use crate::models::*;
use tauri::State;

/// Query archive data for a given period type and date.
///
/// - period_type: "day", "week", "month", "quarter", "year"
/// - date: reference date in YYYY-MM-DD format
///
/// Returns metrics and aggregated summary for the requested period.
#[tauri::command]
pub fn query_archive(
    state: State<DbState>,
    store_id: i64,
    period_type: String,
    date: String,
) -> Result<ArchiveData, String> {
    let (from, to) = compute_date_range(&period_type, &date)?;

    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Get all records in range
    let mut stmt = conn
        .prepare(
            "SELECT id, employee_id, store_id, date, sp_pct, sp_n, sp_d, cust, pts
             FROM daily_metric
             WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3
             ORDER BY date, employee_id",
        )
        .map_err(|e| e.to_string())?;

    let records: Vec<DailyMetric> = stmt
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
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Calculate summary
    let (mean_sp_pct, mean_sp_n, mean_sp_d, mean_cust, mean_pts) = conn
        .query_row(
            "SELECT COALESCE(AVG(sp_pct),0), COALESCE(AVG(sp_n),0), COALESCE(AVG(sp_d),0),
                    COALESCE(AVG(cust),0), COALESCE(AVG(pts),0)
             FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
        )
        .unwrap_or((0.0, 0.0, 0.0, 0.0, 0.0));

    let days = conn
        .query_row(
            "SELECT COUNT(DISTINCT date) FROM daily_metric WHERE store_id = ?1 AND date BETWEEN ?2 AND ?3",
            rusqlite::params![store_id, from, to],
            |row| row.get(0),
        )
        .unwrap_or(0i64);

    Ok(ArchiveData {
        period: Period {
            label: format!("{} ({} to {})", period_type, from, to),
            from: from.clone(),
            to: to.clone(),
            days,
        },
        records,
        summary: StoreSummary {
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
            median_sp_pct: 0.0, // Simplified; full median calc available via get_store_summary
            median_sp_n: 0.0,
            median_sp_d: 0.0,
            median_cust: 0.0,
            median_pts: 0.0,
        },
    })
}

/// Get a list of all periods (months/years) that have data.
#[tauri::command]
pub fn get_available_periods(state: State<DbState>, store_id: i64) -> Result<Vec<AvailablePeriod>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Get months with data
    let mut stmt = conn
        .prepare(
            "SELECT substr(date,1,7) as month, MIN(date), MAX(date), COUNT(*)
             FROM daily_metric
             WHERE store_id = ?1
             GROUP BY substr(date,1,7)
             ORDER BY month DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows: Vec<AvailablePeriod> = stmt
        .query_map([store_id], |row| {
            Ok(AvailablePeriod {
                label: row.get(0)?,
                from: row.get(1)?,
                to: row.get(2)?,
                record_count: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(rows)
}

/// Export archive data as JSON or CSV string.
#[tauri::command]
pub fn export_archive(
    state: State<DbState>,
    store_id: i64,
    from: String,
    to: String,
    format: String,
) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT m.date, e.name, e.initials, m.sp_pct, m.sp_n, m.sp_d, m.cust, m.pts
             FROM daily_metric m
             JOIN employee e ON e.id = m.employee_id
             WHERE m.store_id = ?1 AND m.date BETWEEN ?2 AND ?3
             ORDER BY m.date, e.name",
        )
        .map_err(|e| e.to_string())?;

    let rows: Vec<(String, String, String, Option<f64>, Option<f64>, Option<f64>, Option<i64>, Option<f64>)> = stmt
        .query_map(rusqlite::params![store_id, from, to], |row| {
            Ok((
                row.get(0)?, row.get(1)?, row.get(2)?,
                row.get(3)?, row.get(4)?, row.get(5)?,
                row.get(6)?, row.get(7)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    match format.as_str() {
        "csv" => {
            let mut csv = String::from("Date,Name,Initials,SP%,SP#,SP$,Cust#,Points\n");
            for (date, name, initials, sp_pct, sp_n, sp_d, cust, pts) in &rows {
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{},{}\n",
                    date, name, initials,
                    sp_pct.map_or(String::new(), |v| v.to_string()),
                    sp_n.map_or(String::new(), |v| v.to_string()),
                    sp_d.map_or(String::new(), |v| v.to_string()),
                    cust.map_or(String::new(), |v| v.to_string()),
                    pts.map_or(String::new(), |v| v.to_string()),
                ));
            }
            Ok(csv)
        }
        _ => {
            // JSON format
            let json_rows: Vec<serde_json::Value> = rows
                .iter()
                .map(|(date, name, initials, sp_pct, sp_n, sp_d, cust, pts)| {
                    serde_json::json!({
                        "date": date,
                        "name": name,
                        "initials": initials,
                        "sp_pct": sp_pct,
                        "sp_n": sp_n,
                        "sp_d": sp_d,
                        "cust": cust,
                        "pts": pts,
                    })
                })
                .collect();
            serde_json::to_string_pretty(&json_rows).map_err(|e| e.to_string())
        }
    }
}

/// Get the database file path (for display in the UI).
#[tauri::command]
pub fn get_db_path() -> Result<String, String> {
    Ok(crate::db::db_path().to_string_lossy().to_string())
}

// ============================================================================
// Helpers
// ============================================================================

/// Compute the from/to date range for a given period type and reference date.
fn compute_date_range(period_type: &str, date: &str) -> Result<(String, String), String> {
    // Parse the date (YYYY-MM-DD)
    let parts: Vec<&str> = date.split('-').collect();
    if parts.len() < 3 && period_type != "month" && period_type != "year" {
        return Err("Date must be in YYYY-MM-DD format".to_string());
    }

    match period_type {
        "day" => Ok((date.to_string(), date.to_string())),
        "week" => {
            // Parse and compute week boundaries
            let d = chrono::NaiveDate::parse_from_str(date, "%Y-%m-%d")
                .map_err(|e| e.to_string())?;
            let weekday = d.weekday().num_days_from_monday();
            let monday = d - chrono::Duration::days(weekday as i64);
            let sunday = monday + chrono::Duration::days(6);
            Ok((monday.format("%Y-%m-%d").to_string(), sunday.format("%Y-%m-%d").to_string()))
        }
        "month" => {
            let ym = if date.len() >= 7 { &date[..7] } else { date };
            let from = format!("{}-01", ym);
            // Get last day of month
            let parts: Vec<&str> = ym.split('-').collect();
            let year: i32 = parts[0].parse().map_err(|_| "Invalid year")?;
            let month: u32 = parts[1].parse().map_err(|_| "Invalid month")?;
            let last_day = if month == 12 {
                chrono::NaiveDate::from_ymd_opt(year + 1, 1, 1)
            } else {
                chrono::NaiveDate::from_ymd_opt(year, month + 1, 1)
            }
            .map(|d| d.pred_opt().unwrap())
            .ok_or("Invalid date")?;
            Ok((from, last_day.format("%Y-%m-%d").to_string()))
        }
        "quarter" => {
            let parts: Vec<&str> = date.split('-').collect();
            let year = parts[0];
            let month: u32 = parts.get(1).unwrap_or(&"01").parse().unwrap_or(1);
            let q_start = match month {
                1..=3 => format!("{}-01-01", year),
                4..=6 => format!("{}-04-01", year),
                7..=9 => format!("{}-07-01", year),
                _ => format!("{}-10-01", year),
            };
            let q_end = match month {
                1..=3 => format!("{}-03-31", year),
                4..=6 => format!("{}-06-30", year),
                7..=9 => format!("{}-09-30", year),
                _ => format!("{}-12-31", year),
            };
            Ok((q_start, q_end))
        }
        "year" => {
            let year = if date.len() >= 4 { &date[..4] } else { date };
            Ok((format!("{}-01-01", year), format!("{}-12-31", year)))
        }
        _ => Err(format!("Unknown period type: {}", period_type)),
    }
}

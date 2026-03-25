mod commands;
mod db;

use db::Database;
use std::path::PathBuf;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Use app data dir for the database
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("."));

            let database = Database::new(app_dir).expect("Failed to initialize database");

            // Seed default config if not present
            seed_defaults(&database);

            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Records (core data)
            commands::records::save_records,
            commands::records::get_records,
            commands::records::get_available_dates,
            commands::records::get_last_upload_date,
            // Config
            commands::config::get_goals,
            commands::config::save_goals,
            commands::config::get_point_system,
            commands::config::save_point_system,
            commands::config::get_notes,
            commands::config::save_note,
            commands::config::delete_note,
            commands::config::get_gift_cards,
            commands::config::save_gift_card,
            commands::config::delete_gift_card,
            commands::config::get_trifecta_config,
            commands::config::save_trifecta_config,
            commands::config::get_employee_exceptions,
            commands::config::save_employee_exceptions,
            commands::config::get_personal_goals,
            commands::config::save_personal_goals,
            commands::config::get_pts_exceptions,
            commands::config::save_pts_exceptions,
            commands::config::get_roster,
            commands::config::save_roster,
            // Archive
            commands::archive::export_csv_archive,
            commands::archive::get_archive_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn seed_defaults(database: &Database) {
    let conn = database.conn.lock().unwrap();

    // Seed default goals if none exist
    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM goals_config WHERE store = '141'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    if count == 0 {
        let defaults = [
            ("sp_pct", "SP %", "pct", 2.0, "rate per sale"),
            ("cust", "Cust #", "int", 40.0, "per day"),
            ("sp_d", "SP $", "dollar", 250.0, "per day"),
            ("sp_n", "SP #", "dec1", 6.0, "per day"),
            ("pts_wk", "Pts/wk", "dec1", 7.0, "per week"),
        ];
        for (key, label, fmt, value, unit) in &defaults {
            let _ = conn.execute(
                "INSERT OR IGNORE INTO goals_config (store, metric_key, label, fmt, value, unit, locked, note)
                 VALUES ('141', ?1, ?2, ?3, ?4, ?5, 0, '')",
                rusqlite::params![key, label, fmt, value, unit],
            );
        }
    }

    // Seed default point system if none exists
    let ps_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM point_system WHERE store = '141'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    if ps_count == 0 {
        let _ = conn.execute(
            "INSERT OR IGNORE INTO point_system (store, sp_pct_pts, cust_pts, sp_d_pts, sp_n_pts, pts_wk_bonus, note)
             VALUES ('141', 2, 2, 2, 2, 1, '')",
            [],
        );
    }

    // Seed default trifecta config if none exists
    let tc_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM trifecta_config WHERE store = '141'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    if tc_count == 0 {
        let _ = conn.execute(
            "INSERT OR IGNORE INTO trifecta_config
             (store, sp_d_goal, cust_goal, sp_n_goal,
              double_sp_d, double_sp_n, double_cust,
              elite_sp_d, elite_sp_n, elite_cust,
              fw_count, fw_tier, fw_super, fw_avg_sp_d, fw_avg_cust)
             VALUES ('141', 250, 40, 6.0, 70, 6, 300, 105, 9, 450, 1.0, 0.5, 0.75, 0.3, 0.2)",
            [],
        );
    }
}

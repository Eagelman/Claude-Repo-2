//! GS Report Analytics - Tauri Application Library
//!
//! This is a retail store employee performance analytics dashboard backed by SQLite.
//! The database lives in the archive directory and supports indefinite historical data
//! with efficient temporal indexing (day/month/year).

pub mod commands;
pub mod db;
pub mod models;

use db::DbState;
use std::sync::Mutex;

/// Build and configure the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the database
    let conn = db::init_db();
    let db_state = DbState {
        conn: Mutex::new(conn),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(db_state)
        .invoke_handler(tauri::generate_handler![
            // Store
            commands::store::get_store,
            commands::store::update_store,
            // Employees
            commands::employees::get_employees,
            commands::employees::upsert_employee,
            commands::employees::update_employee_status,
            // Metrics
            commands::metrics::get_daily_metrics,
            commands::metrics::get_employee_metrics,
            commands::metrics::upsert_daily_metric,
            commands::metrics::get_store_summary,
            commands::metrics::get_compare_data,
            commands::metrics::get_overview_data,
            commands::metrics::get_heatmap,
            // Goals
            commands::goals::get_goals,
            commands::goals::save_goals,
            commands::goals::toggle_goal_lock,
            commands::goals::get_goals_data,
            // Notes
            commands::notes::get_notes,
            commands::notes::add_note,
            commands::notes::update_note,
            commands::notes::delete_note,
            commands::notes::toggle_note_lock,
            // Points
            commands::points::get_points_data,
            commands::points::get_point_system,
            commands::points::save_point_system,
            commands::points::get_point_exceptions,
            commands::points::save_point_exceptions,
            // Trifecta
            commands::trifecta::get_trifecta_data,
            commands::trifecta::add_trifecta,
            commands::trifecta::archive_trifectas,
            commands::trifecta::get_trifecta_formula,
            commands::trifecta::save_trifecta_formula,
            commands::trifecta::add_gift_card,
            commands::trifecta::get_gift_cards,
            commands::trifecta::add_audit,
            // Import
            commands::import::import_metrics,
            commands::import::get_import_history,
            // Archive
            commands::archive::query_archive,
            commands::archive::get_available_periods,
            commands::archive::export_archive,
            commands::archive::get_db_path,
            // Files
            commands::files::write_file,
            commands::files::write_file_binary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

//! Database initialization, migration, and connection management.
//!
//! The SQLite database lives in the app's archive directory at `archive/gs_archive.db`.
//! On first run, the migration script creates all tables and indexes.

use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

/// Holds the SQLite connection wrapped in a Mutex for thread-safe access from Tauri commands.
pub struct DbState {
    pub conn: Mutex<Connection>,
}

/// Returns the path to the archive directory where the database lives.
/// Creates the directory if it doesn't exist.
pub fn archive_dir() -> PathBuf {
    let base = dirs_next().unwrap_or_else(|| PathBuf::from("."));
    let archive = base.join("archive");
    fs::create_dir_all(&archive).expect("Failed to create archive directory");
    archive
}

/// Platform-appropriate data directory.
fn dirs_next() -> Option<PathBuf> {
    // Use a local "data" folder relative to the executable for portability
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));
    exe_dir.map(|d| d.join("data"))
}

/// Returns the full path to the database file.
pub fn db_path() -> PathBuf {
    archive_dir().join("gs_archive.db")
}

/// Initialize the database: open (or create) the SQLite file and run migrations.
pub fn init_db() -> Connection {
    let path = db_path();
    let conn = Connection::open(&path).expect("Failed to open database");

    // Enable WAL mode for better concurrent read performance
    conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;")
        .expect("Failed to set PRAGMAs");

    run_migrations(&conn);
    conn
}

/// Run all pending migrations. Uses a simple version tracking table.
fn run_migrations(conn: &Connection) {
    // Create migrations tracking table
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );"
    ).expect("Failed to create migrations table");

    // Check if initial migration has been applied
    let applied: bool = conn
        .query_row(
            "SELECT COUNT(*) > 0 FROM _migrations WHERE name = '001_initial'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if !applied {
        let migration_sql = include_str!("../migrations/001_initial.sql");
        conn.execute_batch(migration_sql)
            .expect("Failed to run initial migration");
        conn.execute(
            "INSERT INTO _migrations (name) VALUES ('001_initial')",
            [],
        )
        .expect("Failed to record migration");
    }
}

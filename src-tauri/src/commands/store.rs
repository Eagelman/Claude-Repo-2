//! Store CRUD commands.

use crate::db::DbState;
use crate::models::Store;
use tauri::State;

/// Get store by ID.
#[tauri::command]
pub fn get_store(state: State<DbState>, store_id: i64) -> Result<Store, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, name, created_at FROM store WHERE id = ?1",
        [store_id],
        |row| {
            Ok(Store {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

/// Update store name.
#[tauri::command]
pub fn update_store(state: State<DbState>, store_id: i64, name: String) -> Result<Store, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE store SET name = ?1 WHERE id = ?2",
        rusqlite::params![name, store_id],
    )
    .map_err(|e| e.to_string())?;
    drop(conn);
    get_store(state, store_id)
}

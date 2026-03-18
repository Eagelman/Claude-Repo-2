//! Notes CRUD commands - monthly notes for goal tracking and coaching.

use crate::db::DbState;
use crate::models::Note;
use tauri::State;

/// Get all notes for a store and month (YYYY-MM format).
#[tauri::command]
pub fn get_notes(state: State<DbState>, store_id: i64, month: String) -> Result<Vec<Note>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, store_id, month, title, body, locked, author, category, censored, created_at, updated_at
             FROM note WHERE store_id = ?1 AND month = ?2
             ORDER BY created_at",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![store_id, month], |row| {
            Ok(Note {
                id: row.get(0)?,
                store_id: row.get(1)?,
                month: row.get(2)?,
                title: row.get(3)?,
                body: row.get(4)?,
                locked: row.get::<_, i64>(5)? != 0,
                author: row.get(6)?,
                category: row.get(7)?,
                censored: row.get::<_, i64>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Add a new note.
#[tauri::command]
pub fn add_note(
    state: State<DbState>,
    store_id: i64,
    month: String,
    title: String,
    body: Option<String>,
    author: Option<String>,
    category: String,
) -> Result<Note, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO note (store_id, month, title, body, author, category)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![store_id, month, title, body, author, category],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, store_id, month, title, body, locked, author, category, censored, created_at, updated_at
         FROM note WHERE id = ?1",
        [id],
        |row| {
            Ok(Note {
                id: row.get(0)?,
                store_id: row.get(1)?,
                month: row.get(2)?,
                title: row.get(3)?,
                body: row.get(4)?,
                locked: row.get::<_, i64>(5)? != 0,
                author: row.get(6)?,
                category: row.get(7)?,
                censored: row.get::<_, i64>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

/// Update an existing note.
#[tauri::command]
pub fn update_note(
    state: State<DbState>,
    note_id: i64,
    title: String,
    body: Option<String>,
    category: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE note SET title = ?1, body = ?2, category = ?3, updated_at = datetime('now')
         WHERE id = ?4",
        rusqlite::params![title, body, category, note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Delete a note by ID.
#[tauri::command]
pub fn delete_note(state: State<DbState>, note_id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM note WHERE id = ?1", [note_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Toggle the locked state of a note.
#[tauri::command]
pub fn toggle_note_lock(state: State<DbState>, note_id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE note SET locked = NOT locked, updated_at = datetime('now') WHERE id = ?1",
        [note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

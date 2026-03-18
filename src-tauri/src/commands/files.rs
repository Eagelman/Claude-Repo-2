use std::fs;

/// Save content (text or base64-encoded binary) to a user-chosen file path.
/// The frontend is expected to use the Tauri dialog plugin's JS API to get the
/// file path, then call this command to write the data.
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content.as_bytes()).map_err(|e| format!("Failed to write file: {}", e))
}

/// Save binary content (passed as a Vec<u8>) to a file path.
#[tauri::command]
pub fn write_file_binary(path: String, content: Vec<u8>) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to write file: {}", e))
}

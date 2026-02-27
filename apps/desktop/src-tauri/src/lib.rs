use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![create_guidance_overlay_window])
        .setup(|app| {
            #[cfg(desktop)]
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_min_size(Some((400.0, 500.0)));
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_guidance_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    if app.get_webview_window("guidance-overlay").is_some() {
        return Ok(());
    }
    let webview_url = if cfg!(debug_assertions) {
        WebviewUrl::External("http://localhost:5173/#overlay".parse().map_err(|e| e.to_string())?)
    } else {
        WebviewUrl::App("index.html#overlay".into())
    };
    let _ = WebviewWindowBuilder::new(&app, "guidance-overlay", webview_url)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .fullscreen(true)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

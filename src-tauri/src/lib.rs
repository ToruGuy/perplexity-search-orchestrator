mod models;
mod state;
mod storage;
mod perplexity;
mod scheduler;
mod commands;

#[cfg(test)]
mod tests;

use state::{AppState, SchedulerState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // Load environment variables
  dotenvy::dotenv().ok();

  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize state
      let app_state = AppState::new();
      let scheduler_state = SchedulerState::new();

      // Load topics from storage
      match storage::load_topics(app.handle()) {
        Ok(topics) => {
          let mut state_topics = app_state.topics.lock().unwrap();
          *state_topics = topics;
        }
        Err(e) => {
          log::warn!("Failed to load topics: {}", e);
        }
      }

      app.manage(app_state);
      app.manage(scheduler_state);

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::save_api_key,
      commands::load_api_key,
      commands::get_topics,
      commands::create_topic,
      commands::update_topic,
      commands::delete_topic,
      commands::toggle_topic,
      commands::trigger_search,
      commands::get_results,
      commands::get_result,
      commands::start_scheduler,
      commands::stop_scheduler,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}



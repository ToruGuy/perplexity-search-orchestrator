use tauri::{AppHandle, Manager, Emitter};
use uuid::Uuid;
use chrono::Utc;
use std::fs;
use crate::models::{Topic, SearchResult, Interval};
use crate::state::{AppState, SchedulerState};
use crate::storage;
use crate::perplexity::PerplexityClient;
use crate::scheduler::{calculate_next_run, should_run_now};

#[tauri::command]
pub async fn save_api_key(api_key: String, app: AppHandle) -> Result<(), String> {
    // Save to app data directory for security
    let app_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app directory: {}", e))?;
    
    let key_path = app_dir.join("api-key.txt");
    fs::write(&key_path, api_key.trim())
        .map_err(|e| format!("Failed to save API key: {}", e))?;
    
    log::info!("API key saved to: {:?}", key_path);
    Ok(())
}

#[tauri::command]
pub async fn load_api_key(app: AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let key_path = app_dir.join("api-key.txt");
    
    if key_path.exists() {
        let key = fs::read_to_string(&key_path)
            .map_err(|e| format!("Failed to read API key: {}", e))?;
        Ok(key.trim().to_string())
    } else {
        Err("API key not found".to_string())
    }
}

#[tauri::command]

pub async fn get_topics(state: tauri::State<'_, AppState>) -> Result<Vec<Topic>, String> {
    let topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(topics.clone())
}

#[tauri::command]
pub async fn create_topic(
    name: String,
    query: String,
    interval: String,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<Topic, String> {
    let interval_enum = match interval.as_str() {
        "hourly" => Interval::Hourly,
        "daily" => Interval::Daily,
        "weekly" => Interval::Weekly,
        _ => return Err("Invalid interval. Must be 'hourly', 'daily', or 'weekly'".to_string()),
    };

    let now = Utc::now().to_rfc3339();
    let topic = Topic {
        id: Uuid::new_v4().to_string(),
        name,
        query,
        interval: interval_enum.clone(),
        active: true,
        created_at: now.clone(),
        last_run: None,
        next_run: calculate_next_run(&Topic {
            id: String::new(),
            name: String::new(),
            query: String::new(),
            interval: interval_enum,
            active: true,
            created_at: now,
            last_run: None,
            next_run: None,
        }),
    };

    let mut topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    topics.push(topic.clone());
    let topics_vec = topics.clone();
    drop(topics);

    storage::save_topics(&app, &topics_vec)?;
    Ok(topic)
}

#[tauri::command]
pub async fn update_topic(
    id: String,
    name: Option<String>,
    query: Option<String>,
    interval: Option<String>,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<Topic, String> {
    let mut topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    let topic_index = topics.iter().position(|t| t.id == id)
        .ok_or_else(|| "Topic not found".to_string())?;

    let mut topic = topics[topic_index].clone();

    if let Some(name) = name {
        topic.name = name;
    }
    if let Some(query) = query {
        topic.query = query;
    }
    if let Some(interval_str) = interval {
        let interval_enum = match interval_str.as_str() {
            "hourly" => Interval::Hourly,
            "daily" => Interval::Daily,
            "weekly" => Interval::Weekly,
            _ => return Err("Invalid interval. Must be 'hourly', 'daily', or 'weekly'".to_string()),
        };
        topic.interval = interval_enum;
        topic.next_run = calculate_next_run(&topic);
    }

    topics[topic_index] = topic.clone();
    let topics_vec = topics.clone();
    drop(topics);

    storage::save_topics(&app, &topics_vec)?;
    Ok(topic)
}

#[tauri::command]
pub async fn delete_topic(
    id: String,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mut topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    let initial_len = topics.len();
    topics.retain(|t| t.id != id);
    
    if topics.len() == initial_len {
        return Err("Topic not found".to_string());
    }

    let topics_vec = topics.clone();
    drop(topics);

    storage::save_topics(&app, &topics_vec)?;
    Ok(())
}

#[tauri::command]
pub async fn toggle_topic(
    id: String,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<Topic, String> {
    let mut topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    let topic_index = topics.iter().position(|t| t.id == id)
        .ok_or_else(|| "Topic not found".to_string())?;

    topics[topic_index].active = !topics[topic_index].active;
    let topic = topics[topic_index].clone();
    let topics_vec = topics.clone();
    drop(topics);

    storage::save_topics(&app, &topics_vec)?;
    Ok(topic)
}

#[tauri::command]
pub async fn trigger_search(
    id: String,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<SearchResult, String> {
    // Load API key from app data directory
    let api_key = load_api_key(app.clone()).await
        .map_err(|_| "API key not configured. Please add your API key in Settings.".to_string())?;
    
    log::info!("Using API key (first 10 chars): {}...", &api_key[..10.min(api_key.len())]);

    let client = PerplexityClient::new(api_key)?;

    let query = {
        let topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
        let topic = topics.iter().find(|t| t.id == id)
            .ok_or_else(|| "Topic not found".to_string())?;
        topic.query.clone()
    };

    let now = Utc::now().to_rfc3339();
    let result_id = Uuid::new_v4().to_string();

    let (status, response, error) = match client.execute_search(&query).await {
        Ok(response_text) => ("success".to_string(), Some(response_text), None),
        Err(e) => ("error".to_string(), None, Some(e)),
    };

    let result = SearchResult {
        id: result_id.clone(),
        topic_id: id.clone(),
        query: query.clone(),
        timestamp: now.clone(),
        status: status.clone(),
        response: response.clone(),
        error: error.clone(),
    };

    storage::save_result(&app, &result)?;

    // Update topic's last_run and next_run
    let mut topics = state.topics.lock().map_err(|e| format!("Lock error: {}", e))?;
    let topic_index = topics.iter().position(|t| t.id == id)
        .ok_or_else(|| "Topic not found".to_string())?;
    
    topics[topic_index].last_run = Some(now);
    topics[topic_index].next_run = calculate_next_run(&topics[topic_index]);
    
    let topics_vec = topics.clone();
    drop(topics);

    storage::save_topics(&app, &topics_vec)?;

    // Emit event to frontend
    app.emit("search-completed", &result)
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn get_results(
    topic_id: String,
    limit: Option<u32>,
    app: AppHandle,
) -> Result<Vec<SearchResult>, String> {
    log::info!("get_results called with topic_id: {}, limit: {:?}", topic_id, limit);
    let results = storage::load_results(&app, &topic_id, limit)?;
    log::info!("Found {} results for topic {}", results.len(), topic_id);
    Ok(results)
}

#[tauri::command]
pub async fn get_result(
    id: String,
    app: AppHandle,
) -> Result<SearchResult, String> {
    storage::load_result_by_id(&app, &id)
}

#[tauri::command]
pub async fn start_scheduler(
    app: AppHandle,
    scheduler_state: tauri::State<'_, SchedulerState>,
) -> Result<(), String> {
    let mut running = scheduler_state.running.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    if *running {
        return Err("Scheduler is already running".to_string());
    }

    *running = true;
    drop(running);

    let app_handle = app.clone();

    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
        
        loop {
            interval.tick().await;

            // Check if scheduler should stop
            let should_continue = {
                let scheduler_state = app_handle.state::<SchedulerState>();
                let running = scheduler_state.running.lock().unwrap();
                *running
            };

            if !should_continue {
                break;
            }

            // Get topics that should run
            let topics_to_run = {
                let app_state = app_handle.state::<AppState>();
                let topics = app_state.topics.lock().unwrap();
                topics.iter()
                    .filter(|t| should_run_now(t))
                    .map(|t| t.clone())
                    .collect::<Vec<_>>()
            };

            // Execute searches for topics that should run
            for topic in topics_to_run {
                // Try to read API key from file first, then fall back to env var
                let api_key = match std::fs::read_to_string("perplexity-api-key.txt")
                    .or_else(|_| std::fs::read_to_string("../perplexity-api-key.txt"))
                    .map(|s| s.trim().to_string())
                    .or_else(|_| std::env::var("PERPLEXITY_API_KEY"))
                {
                    Ok(key) => key,
                    Err(_) => {
                        log::error!("API key not found. Please create perplexity-api-key.txt in project root");
                        continue;
                    }
                };

                let client = match PerplexityClient::new(api_key) {
                    Ok(c) => c,
                    Err(e) => {
                        log::error!("Failed to create Perplexity client: {}", e);
                        continue;
                    }
                };

                let topic_id = topic.id.clone();
                let query = topic.query.clone();
                let now = Utc::now().to_rfc3339();
                let result_id = Uuid::new_v4().to_string();

                let (status, response, error) = match client.execute_search(&query).await {
                    Ok(response_text) => ("success".to_string(), Some(response_text), None),
                    Err(e) => ("error".to_string(), None, Some(e)),
                };

                let result = SearchResult {
                    id: result_id.clone(),
                    topic_id: topic_id.clone(),
                    query: query.clone(),
                    timestamp: now.clone(),
                    status: status.clone(),
                    response: response.clone(),
                    error: error.clone(),
                };

                // Save result
                if let Err(e) = storage::save_result(&app_handle, &result) {
                    log::error!("Failed to save result: {}", e);
                }

                // Update topic's last_run and next_run
                {
                    let app_state = app_handle.state::<AppState>();
                    let mut topics = app_state.topics.lock().unwrap();
                    if let Some(topic) = topics.iter_mut().find(|t| t.id == topic_id) {
                        topic.last_run = Some(now.clone());
                        topic.next_run = calculate_next_run(topic);
                    }
                    let topics_vec = topics.clone();
                    drop(topics);

                    if let Err(e) = storage::save_topics(&app_handle, &topics_vec) {
                        log::error!("Failed to save topics: {}", e);
                    }
                }

                // Emit event to frontend
                let _ = app_handle.emit("search-completed", &result);
            }
        }
    });

    app.emit("scheduler-started", ())
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn stop_scheduler(
    scheduler_state: tauri::State<'_, SchedulerState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut running = scheduler_state.running.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    if !*running {
        return Err("Scheduler is not running".to_string());
    }

    *running = false;

    app.emit("scheduler-stopped", ())
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    Ok(())
}


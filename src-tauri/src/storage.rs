use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use crate::models::{Topic, SearchResult, TopicsFile};
use serde_json;

pub fn get_app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}

pub fn get_topics_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = get_app_data_dir(app)?;
    Ok(app_data_dir.join("topics.json"))
}

pub fn get_results_dir(app: &AppHandle, topic_id: &str) -> Result<PathBuf, String> {
    let app_data_dir = get_app_data_dir(app)?;
    Ok(app_data_dir.join("results").join(topic_id))
}

pub fn get_result_file_path(app: &AppHandle, topic_id: &str, timestamp: &str) -> Result<PathBuf, String> {
    let results_dir = get_results_dir(app, topic_id)?;
    Ok(results_dir.join(format!("{}.json", timestamp)))
}

pub fn ensure_dir_exists(path: &PathBuf) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    Ok(())
}

pub fn load_topics(app: &AppHandle) -> Result<Vec<Topic>, String> {
    let topics_path = get_topics_file_path(app)?;
    
    if !topics_path.exists() {
        return Ok(Vec::new());
    }

    let content = std::fs::read_to_string(&topics_path)
        .map_err(|e| format!("Failed to read topics file: {}", e))?;

    let topics_file: TopicsFile = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse topics file: {}", e))?;

    Ok(topics_file.topics)
}

pub fn save_topics(app: &AppHandle, topics: &[Topic]) -> Result<(), String> {
    let topics_path = get_topics_file_path(app)?;
    ensure_dir_exists(&topics_path)?;

    let topics_file = TopicsFile {
        topics: topics.to_vec(),
    };

    let content = serde_json::to_string_pretty(&topics_file)
        .map_err(|e| format!("Failed to serialize topics: {}", e))?;

    std::fs::write(&topics_path, content)
        .map_err(|e| format!("Failed to write topics file: {}", e))?;

    Ok(())
}

pub fn save_result(app: &AppHandle, result: &SearchResult) -> Result<(), String> {
    let result_path = get_result_file_path(app, &result.topic_id, &result.timestamp)?;
    ensure_dir_exists(&result_path)?;

    let content = serde_json::to_string_pretty(result)
        .map_err(|e| format!("Failed to serialize result: {}", e))?;

    std::fs::write(&result_path, content)
        .map_err(|e| format!("Failed to write result file: {}", e))?;

    Ok(())
}

pub fn load_results(app: &AppHandle, topic_id: &str, limit: Option<u32>) -> Result<Vec<SearchResult>, String> {
    let results_dir = get_results_dir(app, topic_id)?;
    
    if !results_dir.exists() {
        return Ok(Vec::new());
    }

    let mut results = Vec::new();
    let entries = std::fs::read_dir(&results_dir)
        .map_err(|e| format!("Failed to read results directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
            let content = std::fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read result file: {}", e))?;
            
            let result: SearchResult = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse result file: {}", e))?;
            
            results.push(result);
        }
    }

    // Sort by timestamp descending (most recent first)
    results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    // Apply limit
    if let Some(limit) = limit {
        results.truncate(limit as usize);
    }

    Ok(results)
}

pub fn load_result_by_id(app: &AppHandle, result_id: &str) -> Result<SearchResult, String> {
    let app_data_dir = get_app_data_dir(app)?;
    let results_dir = app_data_dir.join("results");

    if !results_dir.exists() {
        return Err("Results directory does not exist".to_string());
    }

    // Search through all topic directories
    for entry in std::fs::read_dir(&results_dir)
        .map_err(|e| format!("Failed to read results directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let topic_dir = entry.path();
        
        if topic_dir.is_dir() {
            for file_entry in std::fs::read_dir(&topic_dir)
                .map_err(|e| format!("Failed to read topic directory: {}", e))? {
                let file_entry = file_entry.map_err(|e| format!("Failed to read file entry: {}", e))?;
                let file_path = file_entry.path();
                
                if file_path.is_file() && file_path.extension().and_then(|s| s.to_str()) == Some("json") {
                    let content = std::fs::read_to_string(&file_path)
                        .map_err(|e| format!("Failed to read result file: {}", e))?;
                    
                    let result: SearchResult = serde_json::from_str(&content)
                        .map_err(|e| format!("Failed to parse result file: {}", e))?;
                    
                    if result.id == result_id {
                        return Ok(result);
                    }
                }
            }
        }
    }

    Err(format!("Result with id {} not found", result_id))
}


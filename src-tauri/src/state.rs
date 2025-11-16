use std::sync::Mutex;
use crate::models::Topic;

pub struct AppState {
    pub topics: Mutex<Vec<Topic>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            topics: Mutex::new(Vec::new()),
        }
    }
}

pub struct SchedulerState {
    pub running: Mutex<bool>,
}

impl SchedulerState {
    pub fn new() -> Self {
        Self {
            running: Mutex::new(false),
        }
    }
}


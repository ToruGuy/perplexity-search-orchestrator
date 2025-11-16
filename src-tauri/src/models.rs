use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Interval {
    Hourly,
    Daily,
    Weekly,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Topic {
    pub id: String,
    pub name: String,
    pub query: String,
    pub interval: Interval,
    pub active: bool,
    pub created_at: String,
    pub last_run: Option<String>,
    pub next_run: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SearchResult {
    pub id: String,
    pub topic_id: String,
    pub query: String,
    pub timestamp: String,
    pub status: String,
    pub response: Option<String>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TopicsFile {
    pub topics: Vec<Topic>,
}


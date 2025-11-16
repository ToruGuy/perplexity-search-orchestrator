#[cfg(test)]
mod tests {
    use crate::models::{Topic, SearchResult, Interval, TopicsFile};
    use serde_json;

    #[test]
    fn test_topics_file_serialization() {
        let topics_file = TopicsFile {
            topics: vec![
                Topic {
                    id: "id1".to_string(),
                    name: "Topic 1".to_string(),
                    query: "Query 1".to_string(),
                    interval: Interval::Hourly,
                    active: true,
                    created_at: "2024-01-01T00:00:00Z".to_string(),
                    last_run: None,
                    next_run: None,
                },
            ],
        };

        let json = serde_json::to_string_pretty(&topics_file).unwrap();
        let deserialized: TopicsFile = serde_json::from_str(&json).unwrap();

        assert_eq!(topics_file.topics.len(), deserialized.topics.len());
        assert_eq!(topics_file.topics[0].id, deserialized.topics[0].id);
    }

    #[test]
    fn test_search_result_serialization() {
        let result = SearchResult {
            id: "result-id".to_string(),
            topic_id: "topic-id".to_string(),
            query: "Test query".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            status: "success".to_string(),
            response: Some("Response content".to_string()),
            error: None,
        };

        let json = serde_json::to_string_pretty(&result).unwrap();
        let deserialized: SearchResult = serde_json::from_str(&json).unwrap();

        assert_eq!(result.id, deserialized.id);
        assert_eq!(result.topic_id, deserialized.topic_id);
        assert_eq!(result.status, deserialized.status);
    }

    #[test]
    fn test_search_result_error_serialization() {
        let result = SearchResult {
            id: "result-id".to_string(),
            topic_id: "topic-id".to_string(),
            query: "Test query".to_string(),
            timestamp: "2024-01-01T00:00:00Z".to_string(),
            status: "error".to_string(),
            response: None,
            error: Some("Error message".to_string()),
        };

        let json = serde_json::to_string_pretty(&result).unwrap();
        let deserialized: SearchResult = serde_json::from_str(&json).unwrap();

        assert_eq!(result.status, deserialized.status);
        assert_eq!(result.error, deserialized.error);
        assert_eq!(deserialized.response, None);
    }

    #[test]
    fn test_invalid_json_handling() {
        let invalid_json = "{ invalid json }";
        let result: Result<TopicsFile, _> = serde_json::from_str(invalid_json);
        assert!(result.is_err());
    }

    #[test]
    fn test_empty_topics_file() {
        let topics_file = TopicsFile {
            topics: vec![],
        };

        let json = serde_json::to_string(&topics_file).unwrap();
        let deserialized: TopicsFile = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.topics.len(), 0);
    }
}


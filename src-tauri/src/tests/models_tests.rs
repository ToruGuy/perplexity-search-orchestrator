#[cfg(test)]
mod tests {
    use crate::models::{Topic, SearchResult, Interval, TopicsFile};
    use serde_json;

    #[test]
    fn test_topic_serialization() {
        let topic = Topic {
            id: "test-id".to_string(),
            name: "Test Topic".to_string(),
            query: "Test query".to_string(),
            interval: Interval::Daily,
            active: true,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_run: Some("2024-01-01T12:00:00Z".to_string()),
            next_run: Some("2024-01-02T12:00:00Z".to_string()),
        };

        let json = serde_json::to_string(&topic).unwrap();
        let deserialized: Topic = serde_json::from_str(&json).unwrap();

        assert_eq!(topic.id, deserialized.id);
        assert_eq!(topic.name, deserialized.name);
        assert_eq!(topic.query, deserialized.query);
        assert_eq!(topic.interval, deserialized.interval);
        assert_eq!(topic.active, deserialized.active);
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

        let json = serde_json::to_string(&result).unwrap();
        let deserialized: SearchResult = serde_json::from_str(&json).unwrap();

        assert_eq!(result.id, deserialized.id);
        assert_eq!(result.topic_id, deserialized.topic_id);
        assert_eq!(result.status, deserialized.status);
        assert_eq!(result.response, deserialized.response);
    }

    #[test]
    fn test_interval_enum() {
        assert_eq!(Interval::Hourly, Interval::Hourly);
        assert_ne!(Interval::Hourly, Interval::Daily);
        assert_ne!(Interval::Daily, Interval::Weekly);
    }

    #[test]
    fn test_interval_serialization() {
        let hourly_json = serde_json::to_string(&Interval::Hourly).unwrap();
        assert!(hourly_json.contains("Hourly") || hourly_json.contains("hourly"));

        let daily_json = serde_json::to_string(&Interval::Daily).unwrap();
        assert!(daily_json.contains("Daily") || daily_json.contains("daily"));
    }

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
                Topic {
                    id: "id2".to_string(),
                    name: "Topic 2".to_string(),
                    query: "Query 2".to_string(),
                    interval: Interval::Daily,
                    active: false,
                    created_at: "2024-01-01T00:00:00Z".to_string(),
                    last_run: None,
                    next_run: None,
                },
            ],
        };

        let json = serde_json::to_string(&topics_file).unwrap();
        let deserialized: TopicsFile = serde_json::from_str(&json).unwrap();

        assert_eq!(topics_file.topics.len(), deserialized.topics.len());
        assert_eq!(topics_file.topics[0].id, deserialized.topics[0].id);
        assert_eq!(topics_file.topics[1].id, deserialized.topics[1].id);
    }
}


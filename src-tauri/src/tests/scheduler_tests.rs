#[cfg(test)]
mod tests {
    use crate::models::{Topic, Interval};
    use crate::scheduler::{calculate_next_run, should_run_now};
    use chrono::{DateTime, Utc, Duration};

    fn create_test_topic(interval: Interval, last_run: Option<&str>, next_run: Option<&str>) -> Topic {
        Topic {
            id: "test-id".to_string(),
            name: "Test".to_string(),
            query: "Test query".to_string(),
            interval,
            active: true,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_run: last_run.map(|s| s.to_string()),
            next_run: next_run.map(|s| s.to_string()),
        }
    }

    #[test]
    fn test_calculate_next_run_hourly() {
        let now = Utc::now();
        let last_run = (now - Duration::minutes(30)).to_rfc3339();
        let topic = create_test_topic(Interval::Hourly, Some(&last_run), None);
        let next_run = calculate_next_run(&topic).unwrap();
        
        let next_run_dt = DateTime::parse_from_rfc3339(&next_run).unwrap().with_timezone(&Utc);
        
        // Next run should be in the future (at least 25 minutes from now)
        assert!(next_run_dt > now);
        assert!(next_run_dt < now + Duration::hours(2));
    }

    #[test]
    fn test_calculate_next_run_daily() {
        let now = Utc::now();
        let last_run = (now - Duration::hours(12)).to_rfc3339();
        let topic = create_test_topic(Interval::Daily, Some(&last_run), None);
        let next_run = calculate_next_run(&topic).unwrap();
        
        let next_run_dt = DateTime::parse_from_rfc3339(&next_run).unwrap().with_timezone(&Utc);
        
        // Next run should be in the future
        assert!(next_run_dt > now);
        assert!(next_run_dt < now + Duration::days(2));
    }

    #[test]
    fn test_calculate_next_run_weekly() {
        let now = Utc::now();
        let last_run = (now - Duration::days(3)).to_rfc3339();
        let topic = create_test_topic(Interval::Weekly, Some(&last_run), None);
        let next_run = calculate_next_run(&topic).unwrap();
        
        let next_run_dt = DateTime::parse_from_rfc3339(&next_run).unwrap().with_timezone(&Utc);
        
        // Next run should be in the future
        assert!(next_run_dt > now);
        assert!(next_run_dt < now + Duration::weeks(2));
    }

    #[test]
    fn test_calculate_next_run_no_last_run() {
        // When there's no last_run, should use created_at
        let topic = create_test_topic(Interval::Hourly, None, None);
        let next_run = calculate_next_run(&topic);
        assert!(next_run.is_some());
    }

    #[test]
    fn test_should_run_now_active_past_time() {
        let past_time = (Utc::now() - Duration::hours(2)).to_rfc3339();
        let topic = create_test_topic(Interval::Hourly, None, Some(&past_time));
        assert!(should_run_now(&topic));
    }

    #[test]
    fn test_should_run_now_active_future_time() {
        let future_time = (Utc::now() + Duration::hours(2)).to_rfc3339();
        let topic = create_test_topic(Interval::Hourly, None, Some(&future_time));
        assert!(!should_run_now(&topic));
    }

    #[test]
    fn test_should_run_now_inactive() {
        let past_time = (Utc::now() - Duration::hours(2)).to_rfc3339();
        let mut topic = create_test_topic(Interval::Hourly, None, Some(&past_time));
        topic.active = false;
        assert!(!should_run_now(&topic));
    }

    #[test]
    fn test_should_run_now_no_next_run() {
        let topic = create_test_topic(Interval::Hourly, None, None);
        assert!(should_run_now(&topic)); // Should run if no next_run set
    }

    #[test]
    fn test_calculate_next_run_past_time_adjusts() {
        // If next_run would be in the past, it should be adjusted to future
        let past_time = (Utc::now() - Duration::days(2)).to_rfc3339();
        let topic = create_test_topic(Interval::Daily, Some(&past_time), None);
        let next_run = calculate_next_run(&topic).unwrap();
        
        let next_run_dt = DateTime::parse_from_rfc3339(&next_run).unwrap().with_timezone(&Utc);
        let now = Utc::now();
        
        // Next run should be in the future
        assert!(next_run_dt > now);
    }
}


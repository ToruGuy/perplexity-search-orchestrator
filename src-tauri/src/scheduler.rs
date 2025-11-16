use chrono::{DateTime, Utc, Duration};
use crate::models::{Topic, Interval};

pub fn calculate_next_run(topic: &Topic) -> Option<String> {
    let now = Utc::now();
    let base_time = topic.last_run
        .as_ref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(|| {
            // If never run, use created_at as base
            DateTime::parse_from_rfc3339(&topic.created_at)
                .ok()
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or(now)
        });

    let next_run = match topic.interval {
        Interval::Hourly => base_time + Duration::hours(1),
        Interval::Daily => base_time + Duration::days(1),
        Interval::Weekly => base_time + Duration::weeks(1),
    };

    // If next_run is in the past, set it to now + interval
    let next_run = if next_run < now {
        match topic.interval {
            Interval::Hourly => now + Duration::hours(1),
            Interval::Daily => now + Duration::days(1),
            Interval::Weekly => now + Duration::weeks(1),
        }
    } else {
        next_run
    };

    Some(next_run.to_rfc3339())
}

pub fn should_run_now(topic: &Topic) -> bool {
    if !topic.active {
        return false;
    }

    let Some(next_run_str) = &topic.next_run else {
        return true; // If no next_run set, should run
    };

    let Ok(next_run) = DateTime::parse_from_rfc3339(next_run_str) else {
        return true; // If invalid timestamp, should run
    };

    let now = Utc::now();
    let next_run_utc = next_run.with_timezone(&Utc);

    // Run if next_run is in the past or within the next minute (to account for timing)
    next_run_utc <= now + Duration::seconds(60)
}


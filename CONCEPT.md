# Perplexity Search Orchestrator

## Overview
Desktop app (Tauri + macOS/Windows) for scheduling and running automated Perplexity API searches.

## Tech Stack
- **Frontend**: Next.js + shadcn/ui components
- **Backend**: Tauri (Rust)
- **API**: Perplexity Sonar Reasoning model
- **Storage**: JSON files (local filesystem)
- **Config**: .env for API key

## Core Features

### 1. Search Topics Management
- Create search topics with:
  - Topic name
  - Search query/prompt
  - Schedule interval (simple: hourly, daily, weekly)
  - Status (active/paused)
- Edit/delete topics
- Pause/resume scheduling

### 2. Scheduled Execution
- Background runner checks schedules
- Executes searches via Perplexity API
- Saves results to JSON with timestamp
- Runs only when app is open (no daemon for v1)

### 3. Results Storage
- Each search result saved as JSON:
  - Timestamp
  - Topic ID
  - Query used
  - API response
  - Status (success/error)

## UI Views

1. **Main List** - All topics with status, last run, next scheduled run
2. **Add/Edit Topic** - Form for topic configuration
3. **Topic Details** - View topic config + recent runs
4. **History** - List of all past searches across topics
5. **Result Page** - Individual search result display

## Data Structure

### topics.json
```json
{
  "topics": [
    {
      "id": "uuid",
      "name": "Topic Name",
      "query": "Search query",
      "interval": "daily|hourly|weekly",
      "active": true,
      "created_at": "ISO timestamp",
      "last_run": "ISO timestamp",
      "next_run": "ISO timestamp"
    }
  ]
}
```

### results/{topic_id}/{timestamp}.json
```json
{
  "id": "uuid",
  "topic_id": "uuid",
  "query": "Search query",
  "timestamp": "ISO timestamp",
  "status": "success|error",
  "response": "API response",
  "error": "error message if failed"
}
```

## Scheduling Logic
- **Hourly**: Run every 1 hour from last run
- **Daily**: Run once per day (same time as created)
- **Weekly**: Run once per week (same day/time as created)

## MVP Scope
- Manual trigger option (don't wait for schedule)
- Simple interval-based scheduling
- No notifications
- App must be running for schedules to execute
- Basic error handling


# Interface Definitions

This document defines the shared interfaces between the Rust backend and TypeScript frontend. Both agents should reference this document to ensure type consistency.

## Rust Data Structures

### Interval Enum

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum Interval {
    Hourly,
    Daily,
    Weekly,
}
```

### Topic Struct

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Topic {
    pub id: String,                    // UUID
    pub name: String,                  // User-friendly name
    pub query: String,                 // Search query/prompt
    pub interval: Interval,            // Hourly, Daily, or Weekly
    pub active: bool,                  // Whether scheduling is enabled
    pub created_at: String,            // ISO 8601 timestamp
    pub last_run: Option<String>,      // ISO 8601 timestamp (None if never run)
    pub next_run: Option<String>,     // ISO 8601 timestamp (calculated)
}
```

### SearchResult Struct

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SearchResult {
    pub id: String,                    // UUID
    pub topic_id: String,              // Reference to Topic
    pub query: String,                 // Query used for this search
    pub timestamp: String,             // ISO 8601 timestamp
    pub status: String,               // "success" or "error"
    pub response: Option<String>,      // API response content (None if error)
    pub error: Option<String>,         // Error message (None if success)
}
```

## TypeScript Interfaces

### Interval Type

```typescript
export type Interval = "hourly" | "daily" | "weekly";
```

### Topic Interface

```typescript
export interface Topic {
  id: string;                    // UUID
  name: string;                  // User-friendly name
  query: string;                 // Search query/prompt
  interval: Interval;            // "hourly" | "daily" | "weekly"
  active: boolean;               // Whether scheduling is enabled
  created_at: string;            // ISO 8601 timestamp
  last_run: string | null;       // ISO 8601 timestamp (null if never run)
  next_run: string | null;       // ISO 8601 timestamp (calculated)
}
```

### SearchResult Interface

```typescript
export interface SearchResult {
  id: string;                    // UUID
  topic_id: string;              // Reference to Topic
  query: string;                 // Query used for this search
  timestamp: string;             // ISO 8601 timestamp
  status: "success" | "error";   // Status of the search
  response: string | null;       // API response content (null if error)
  error: string | null;           // Error message (null if success)
}
```

## Tauri Commands

All commands return `Result<T, String>` where `String` is the error message.

### Topic Management Commands

#### `get_topics`
- **Description**: Retrieve all topics
- **Parameters**: None
- **Returns**: `Result<Vec<Topic>, String>`

#### `create_topic`
- **Description**: Create a new topic
- **Parameters**:
  - `name: String` - Topic name
  - `query: String` - Search query
  - `interval: Interval` - Scheduling interval
- **Returns**: `Result<Topic, String>`
- **Notes**: Automatically calculates `next_run` based on interval

#### `update_topic`
- **Description**: Update an existing topic
- **Parameters**:
  - `id: String` - Topic ID
  - `name: Option<String>` - New name (optional)
  - `query: Option<String>` - New query (optional)
  - `interval: Option<Interval>` - New interval (optional)
- **Returns**: `Result<Topic, String>`
- **Notes**: Recalculates `next_run` if interval changes

#### `delete_topic`
- **Description**: Delete a topic
- **Parameters**:
  - `id: String` - Topic ID
- **Returns**: `Result<(), String>`
- **Notes**: Optionally deletes associated results (implementation detail)

#### `toggle_topic`
- **Description**: Pause or resume a topic
- **Parameters**:
  - `id: String` - Topic ID
- **Returns**: `Result<Topic, String>`
- **Notes**: Toggles `active` field

### Search Execution Commands

#### `trigger_search`
- **Description**: Manually trigger a search for a topic
- **Parameters**:
  - `id: String` - Topic ID
- **Returns**: `Result<SearchResult, String>`
- **Notes**: Executes search immediately, updates `last_run` and `next_run`

#### `get_results`
- **Description**: Get search results for a topic
- **Parameters**:
  - `topic_id: String` - Topic ID
  - `limit: Option<u32>` - Maximum number of results (default: 20)
- **Returns**: `Result<Vec<SearchResult>, String>`
- **Notes**: Returns most recent results first

#### `get_result`
- **Description**: Get a single search result by ID
- **Parameters**:
  - `id: String` - Result ID
- **Returns**: `Result<SearchResult, String>`

### Scheduler Commands

#### `start_scheduler`
- **Description**: Start the background scheduler
- **Parameters**: None
- **Returns**: `Result<(), String>`
- **Notes**: Begins checking topics every 60 seconds

#### `stop_scheduler`
- **Description**: Stop the background scheduler
- **Parameters**: None
- **Returns**: `Result<(), String>`

## Tauri Events

Events are emitted from the backend to the frontend.

### `search-completed`
- **Description**: Emitted when a scheduled search completes
- **Payload**: `SearchResult`
- **Emitted by**: Scheduler after successful or failed search execution

### `scheduler-started`
- **Description**: Emitted when scheduler starts
- **Payload**: None (empty)
- **Emitted by**: `start_scheduler` command

### `scheduler-stopped`
- **Description**: Emitted when scheduler stops
- **Payload**: None (empty)
- **Emitted by**: `stop_scheduler` command

## Type Conversion Notes

- **Interval**: Rust enum values (`Hourly`, `Daily`, `Weekly`) serialize to lowercase strings (`"hourly"`, `"daily"`, `"weekly"`) in JSON
- **Timestamps**: All timestamps use ISO 8601 format strings (e.g., `"2024-01-15T10:30:00Z"`)
- **UUIDs**: All IDs are UUID v4 strings
- **Option Types**: Rust `Option<T>` maps to TypeScript `T | null`

## Error Handling

- All commands return `Result<T, String>` where errors are human-readable strings
- Frontend should display error messages to users
- Common errors:
  - `"Topic not found"` - Invalid topic ID
  - `"Result not found"` - Invalid result ID
  - `"Invalid interval"` - Invalid interval value
  - `"API error: ..."` - Perplexity API errors
  - `"Storage error: ..."` - File system errors


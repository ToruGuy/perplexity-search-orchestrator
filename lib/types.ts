// Type definitions matching INTERFACES.md

export type Interval = "hourly" | "daily" | "weekly";

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

export interface SearchResult {
  id: string;                    // UUID
  topic_id: string;              // Reference to Topic
  query: string;                 // Query used for this search
  timestamp: string;             // ISO 8601 timestamp
  status: "success" | "error";   // Status of the search
  response: string | null;       // API response content (null if error)
  error: string | null;           // Error message (null if success)
}

// Command parameter types
export interface CreateTopicParams {
  name: string;
  query: string;
  interval: Interval;
}

export interface UpdateTopicParams {
  id: string;
  name?: string;
  query?: string;
  interval?: Interval;
}

export interface GetResultsParams {
  topic_id: string;
  limit?: number;
}


// Tauri Event Listeners for real-time updates

import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { SearchResult } from "./types";

// Event payload types
export interface SearchCompletedPayload {
  id: string;
  topic_id: string;
  query: string;
  timestamp: string;
  status: string;
  response?: string;
  error?: string;
}

// Listen for search completion events
export async function onSearchCompleted(
  callback: (result: SearchResult) => void
): Promise<UnlistenFn> {
  return await listen<SearchResult>("search-completed", (event) => {
    callback(event.payload);
  });
}

// Listen for scheduler start events
export async function onSchedulerStarted(
  callback: () => void
): Promise<UnlistenFn> {
  return await listen("scheduler-started", () => {
    callback();
  });
}

// Listen for scheduler stop events
export async function onSchedulerStopped(
  callback: () => void
): Promise<UnlistenFn> {
  return await listen("scheduler-stopped", () => {
    callback();
  });
}


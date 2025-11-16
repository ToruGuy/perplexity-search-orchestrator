// Connected to Tauri backend - Phase 6 Integration

import { invoke } from "@tauri-apps/api/core";
import { Topic, SearchResult, CreateTopicParams, UpdateTopicParams, GetResultsParams } from "./types";

// API Key management
export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("perplexity_api_key");
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("perplexity_api_key", key);
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("perplexity_api_key");
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

// Topic Management Commands
export async function getTopics(): Promise<Topic[]> {
  return await invoke<Topic[]>("get_topics");
}

export async function createTopic(params: CreateTopicParams): Promise<Topic> {
  return await invoke<Topic>("create_topic", {
    name: params.name,
    query: params.query,
    interval: params.interval,
  });
}

export async function updateTopic(params: UpdateTopicParams): Promise<Topic> {
  return await invoke<Topic>("update_topic", {
    id: params.id,
    name: params.name,
    query: params.query,
    interval: params.interval,
  });
}

export async function deleteTopic(id: string): Promise<void> {
  return await invoke<void>("delete_topic", { id });
}

export async function toggleTopic(id: string): Promise<Topic> {
  return await invoke<Topic>("toggle_topic", { id });
}

// Search Execution Commands
export async function triggerSearch(id: string): Promise<SearchResult> {
  return await invoke<SearchResult>("trigger_search", { id });
}

export async function getResults(params: GetResultsParams): Promise<SearchResult[]> {
  return await invoke<SearchResult[]>("get_results", {
    topicId: params.topic_id,  // Tauri converts snake_case Rust params to camelCase
    limit: params.limit,
  });
}

export async function getResult(id: string): Promise<SearchResult> {
  return await invoke<SearchResult>("get_result", { id });
}

// Scheduler Commands
export async function startScheduler(): Promise<void> {
  return await invoke<void>("start_scheduler");
}

export async function stopScheduler(): Promise<void> {
  return await invoke<void>("stop_scheduler");
}


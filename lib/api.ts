// TODO: Connect to real backend
// This is a stub implementation that returns mock data
// Replace with actual Tauri invoke() calls when backend is ready

import { invoke } from "@tauri-apps/api/core";
import { Topic, SearchResult, CreateTopicParams, UpdateTopicParams, GetResultsParams } from "./types";
import { mockTopics, mockResults, getMockResultsForTopic } from "./mock-data";

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  // TODO: Replace with: return await invoke<Topic[]>("get_topics");
  await delay(300);
  return [...mockTopics];
}

export async function createTopic(params: CreateTopicParams): Promise<Topic> {
  // TODO: Replace with: return await invoke<Topic>("create_topic", params);
  await delay(500);
  const newTopic: Topic = {
    id: Math.random().toString(36).substring(7),
    name: params.name,
    query: params.query,
    interval: params.interval,
    active: true,
    created_at: new Date().toISOString(),
    last_run: null,
    next_run: null,
  };
  mockTopics.push(newTopic);
  return newTopic;
}

export async function updateTopic(params: UpdateTopicParams): Promise<Topic> {
  // TODO: Replace with: return await invoke<Topic>("update_topic", params);
  await delay(500);
  const topic = mockTopics.find(t => t.id === params.id);
  if (!topic) {
    throw new Error("Topic not found");
  }
  if (params.name !== undefined) topic.name = params.name;
  if (params.query !== undefined) topic.query = params.query;
  if (params.interval !== undefined) topic.interval = params.interval;
  return { ...topic };
}

export async function deleteTopic(id: string): Promise<void> {
  // TODO: Replace with: return await invoke<void>("delete_topic", { id });
  await delay(300);
  const index = mockTopics.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error("Topic not found");
  }
  mockTopics.splice(index, 1);
}

export async function toggleTopic(id: string): Promise<Topic> {
  // TODO: Replace with: return await invoke<Topic>("toggle_topic", { id });
  await delay(300);
  const topic = mockTopics.find(t => t.id === id);
  if (!topic) {
    throw new Error("Topic not found");
  }
  topic.active = !topic.active;
  return { ...topic };
}

// Search Execution Commands
export async function triggerSearch(id: string): Promise<SearchResult> {
  // TODO: Replace with: return await invoke<SearchResult>("trigger_search", { id });
  await delay(2000); // Simulate API call
  const topic = mockTopics.find(t => t.id === id);
  if (!topic) {
    throw new Error("Topic not found");
  }
  const result: SearchResult = {
    id: Math.random().toString(36).substring(7),
    topic_id: id,
    query: topic.query,
    timestamp: new Date().toISOString(),
    status: "success",
    response: `Mock response for query: ${topic.query}`,
    error: null,
  };
  mockResults.unshift(result);
  return result;
}

export async function getResults(params: GetResultsParams): Promise<SearchResult[]> {
  // TODO: Replace with: return await invoke<SearchResult[]>("get_results", params);
  await delay(300);
  const results = getMockResultsForTopic(params.topic_id);
  const limit = params.limit || 20;
  return results.slice(0, limit);
}

export async function getResult(id: string): Promise<SearchResult> {
  // TODO: Replace with: return await invoke<SearchResult>("get_result", { id });
  await delay(300);
  const result = mockResults.find(r => r.id === id);
  if (!result) {
    throw new Error("Result not found");
  }
  return result;
}

// Scheduler Commands
export async function startScheduler(): Promise<void> {
  // TODO: Replace with: return await invoke<void>("start_scheduler");
  await delay(300);
  console.log("Scheduler started (mock)");
}

export async function stopScheduler(): Promise<void> {
  // TODO: Replace with: return await invoke<void>("stop_scheduler");
  await delay(300);
  console.log("Scheduler stopped (mock)");
}


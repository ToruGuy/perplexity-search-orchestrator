import { Topic, SearchResult } from "./types";

// Mock topics for development
export const mockTopics: Topic[] = [
  {
    id: "1",
    name: "AI News",
    query: "What are the latest developments in AI this week?",
    interval: "daily",
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    last_run: "2024-01-16T10:00:00Z",
    next_run: "2024-01-17T10:00:00Z",
  },
  {
    id: "2",
    name: "Tech Stocks",
    query: "What are the current trends in tech stocks?",
    interval: "hourly",
    active: true,
    created_at: "2024-01-15T08:00:00Z",
    last_run: "2024-01-16T14:00:00Z",
    next_run: "2024-01-16T15:00:00Z",
  },
  {
    id: "3",
    name: "Weekly Research",
    query: "Summarize the top research papers published this week in machine learning",
    interval: "weekly",
    active: false,
    created_at: "2024-01-10T09:00:00Z",
    last_run: "2024-01-15T09:00:00Z",
    next_run: "2024-01-22T09:00:00Z",
  },
];

// Mock search results
export const mockResults: SearchResult[] = [
  {
    id: "r1",
    topic_id: "1",
    query: "What are the latest developments in AI this week?",
    timestamp: "2024-01-16T10:00:00Z",
    status: "success",
    response: "This week in AI, we've seen significant developments including new language models, breakthroughs in computer vision, and important policy discussions. Key highlights include...",
    error: null,
  },
  {
    id: "r2",
    topic_id: "1",
    query: "What are the latest developments in AI this week?",
    timestamp: "2024-01-15T10:00:00Z",
    status: "success",
    response: "Last week's AI developments focused on multimodal AI systems and improvements in reasoning capabilities...",
    error: null,
  },
  {
    id: "r3",
    topic_id: "2",
    query: "What are the current trends in tech stocks?",
    timestamp: "2024-01-16T14:00:00Z",
    status: "success",
    response: "Tech stocks are showing mixed signals this week. AI-related companies continue to see strong performance...",
    error: null,
  },
  {
    id: "r4",
    topic_id: "2",
    query: "What are the current trends in tech stocks?",
    timestamp: "2024-01-16T13:00:00Z",
    status: "error",
    response: null,
    error: "API timeout: Request took longer than 30 seconds",
  },
  {
    id: "r5",
    topic_id: "3",
    query: "Summarize the top research papers published this week in machine learning",
    timestamp: "2024-01-15T09:00:00Z",
    status: "success",
    response: "This week's top ML research papers include advances in transformer architectures, new optimization techniques, and applications in healthcare...",
    error: null,
  },
];

// Helper function to get results for a topic
export function getMockResultsForTopic(topicId: string): SearchResult[] {
  return mockResults.filter(r => r.topic_id === topicId);
}

// Helper function to generate a new mock topic
export function generateMockTopic(name: string, query: string, interval: "hourly" | "daily" | "weekly"): Topic {
  const now = new Date().toISOString();
  return {
    id: Math.random().toString(36).substring(7),
    name,
    query,
    interval,
    active: true,
    created_at: now,
    last_run: null,
    next_run: null,
  };
}


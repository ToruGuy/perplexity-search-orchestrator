"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Topic, SearchResult } from "./types";
import * as api from "./api";
import { onSearchCompleted, onSchedulerStarted, onSchedulerStopped } from "./events";
import { toast } from "sonner";

interface AppContextType {
  topics: Topic[];
  schedulerRunning: boolean;
  loading: boolean;
  refreshTopics: () => Promise<void>;
  setSchedulerRunning: (running: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch topics from backend
  const refreshTopics = useCallback(async () => {
    try {
      const fetchedTopics = await api.getTopics();
      setTopics(fetchedTopics);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: Load topics on mount
  useEffect(() => {
    refreshTopics();
  }, [refreshTopics]);

  // Setup event listeners
  useEffect(() => {
    let unlistenSearch: (() => void) | undefined;
    let unlistenStart: (() => void) | undefined;
    let unlistenStop: (() => void) | undefined;

    // Listen for search completions
    onSearchCompleted((result: SearchResult) => {
      console.log("Search completed:", result);
      
      if (result.status === "success") {
        toast.success(`Search completed for topic: ${result.topic_id.substring(0, 8)}...`);
      } else {
        toast.error(`Search failed: ${result.error || "Unknown error"}`);
      }

      // Refresh topics to update last_run and next_run
      refreshTopics();
    }).then((unlisten) => {
      unlistenSearch = unlisten;
    });

    // Listen for scheduler events
    onSchedulerStarted(() => {
      console.log("Scheduler started");
      setSchedulerRunning(true);
      toast.success("Scheduler started");
    }).then((unlisten) => {
      unlistenStart = unlisten;
    });

    onSchedulerStopped(() => {
      console.log("Scheduler stopped");
      setSchedulerRunning(false);
      toast.info("Scheduler stopped");
    }).then((unlisten) => {
      unlistenStop = unlisten;
    });

    // Cleanup listeners on unmount
    return () => {
      if (unlistenSearch) unlistenSearch();
      if (unlistenStart) unlistenStart();
      if (unlistenStop) unlistenStop();
    };
  }, [refreshTopics]);

  return (
    <AppContext.Provider
      value={{
        topics,
        schedulerRunning,
        loading,
        refreshTopics,
        setSchedulerRunning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}


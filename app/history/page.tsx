"use client"

import { useEffect, useState } from "react"
import { SearchResult, Topic } from "@/lib/types"
import { getResults, getTopics } from "@/lib/api"
import { ResultCard } from "@/components/result-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function HistoryPage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopics()
  }, [])

  useEffect(() => {
    if (topics.length > 0) {
      loadResults()
    }
  }, [selectedTopicId, topics])

  const loadTopics = async () => {
    try {
      const data = await getTopics()
      setTopics(data)
    } catch (error) {
      toast.error("Failed to load topics")
    }
  }

  const loadResults = async () => {
    if (topics.length === 0) return
    
    try {
      setLoading(true)
      if (selectedTopicId === "all") {
        // Load results from all topics
        const allResults: SearchResult[] = []
        for (const topic of topics) {
          const topicResults = await getResults({ topic_id: topic.id, limit: 20 })
          allResults.push(...topicResults)
        }
        // Sort by timestamp descending
        allResults.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setResults(allResults.slice(0, 20))
      } else {
        const data = await getResults({ topic_id: selectedTopicId, limit: 20 })
        setResults(data)
      }
    } catch (error) {
      toast.error("Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  const getTopicName = (topicId: string) => {
    return topics.find((t) => t.id === topicId)?.name || "Unknown"
  }

  if (loading && results.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search History</h1>
        <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No search results yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              topicName={getTopicName(result.topic_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}


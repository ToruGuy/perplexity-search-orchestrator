"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { IntervalBadge } from "@/components/interval-badge"
import { ResultCard } from "@/components/result-card"
import { Topic, SearchResult } from "@/lib/types"
import { getTopics, getResults, triggerSearch, toggleTopic } from "@/lib/api"
import { ArrowLeft, Play, Edit } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [topic, setTopic] = useState<Topic | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const topics = await getTopics()
      const topicData = topics.find((t) => t.id === id)
      if (!topicData) {
        toast.error("Topic not found")
        router.push("/topics")
        return
      }
      setTopic(topicData)
      const resultsData = await getResults({ topic_id: id, limit: 5 })
      setResults(resultsData)
    } catch (error) {
      toast.error("Failed to load topic")
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerSearch = async () => {
    try {
      toast.info("Triggering search...")
      await triggerSearch(id)
      await loadData()
      toast.success("Search completed")
    } catch (error) {
      toast.error("Failed to trigger search")
    }
  }

  const handleToggle = async () => {
    if (!topic) return
    try {
      await toggleTopic(id)
      await loadData()
      toast.success("Topic updated")
    } catch (error) {
      toast.error("Failed to update topic")
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!topic) {
    return null
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href="/topics"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Topics
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{topic.name}</h1>
          <div className="flex gap-2">
            <StatusBadge status={topic.active ? "active" : "paused"} />
            <IntervalBadge interval={topic.interval} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTriggerSearch}>
            <Play className="h-4 w-4 mr-2" />
            Trigger Search
          </Button>
          <Button variant="outline" onClick={handleToggle}>
            {topic.active ? "Pause" : "Resume"}
          </Button>
          <Link href={`/topics/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Query
              </div>
              <div className="text-sm">{topic.query}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </div>
                <div className="text-sm">
                  {format(new Date(topic.created_at), "PPp")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Last Run
                </div>
                <div className="text-sm">
                  {topic.last_run
                    ? format(new Date(topic.last_run), "PPp")
                    : "Never"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Next Run
                </div>
                <div className="text-sm">
                  {topic.next_run
                    ? format(new Date(topic.next_run), "PPp")
                    : "-"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results yet
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
                <Link href="/history">
                  <Button variant="outline" className="w-full">
                    View All Results
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


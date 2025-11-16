"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchResult, Topic } from "@/lib/types"
import { getResult, getTopics } from "@/lib/api"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResultDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [result, setResult] = useState<SearchResult | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResult()
  }, [id])

  const loadResult = async () => {
    try {
      setLoading(true)
      const resultData = await getResult(id)
      setResult(resultData)

      // Load topic info
      const topics = await getTopics()
      const topicData = topics.find((t) => t.id === resultData.topic_id)
      setTopic(topicData || null)
    } catch (error) {
      toast.error("Failed to load result")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6">
        <p>Result not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href="/history"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to History
      </Link>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Search Result</h1>
            {topic && (
              <p className="text-muted-foreground">
                Topic: <span className="font-medium">{topic.name}</span>
              </p>
            )}
          </div>
          <Badge
            variant={result.status === "success" ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {result.status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {result.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Query</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{result.query}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            {result.status === "success" && result.response ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {result.response}
                </pre>
              </div>
            ) : result.error ? (
              <div className="text-destructive">
                <p className="font-medium mb-2">Error:</p>
                <pre className="whitespace-pre-wrap text-sm bg-destructive/10 p-4 rounded-md">
                  {result.error}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground">No response available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Timestamp:</span>
              <span className="text-sm">
                {format(new Date(result.timestamp), "PPpp")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="text-sm capitalize">{result.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchResult } from "@/lib/types"
import { format } from "date-fns"
import { CheckCircle2, XCircle } from "lucide-react"

interface ResultCardProps {
  result: SearchResult
  topicName?: string
}

export function ResultCard({ result, topicName }: ResultCardProps) {
  const preview = result.response
    ? result.response.substring(0, 150) + "..."
    : result.error || "No content"

  return (
    <Link href={`/results/${result.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-base line-clamp-2">
              {result.query}
            </CardTitle>
            <Badge
              variant={result.status === "success" ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {result.status === "success" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {result.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {format(new Date(result.timestamp), "PPp")}
            </div>
            {topicName && (
              <div className="text-sm text-muted-foreground">
                Topic: {topicName}
              </div>
            )}
            <p className="text-sm line-clamp-3">{preview}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { IntervalBadge } from "@/components/interval-badge"
import { Topic } from "@/lib/types"
import { Pause, Edit, Trash2, Play as PlayIcon } from "lucide-react"
import { format } from "date-fns"

interface TopicCardProps {
  topic: Topic
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TopicCard({ topic, onToggle, onDelete }: TopicCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{topic.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {topic.query}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={topic.active ? "active" : "paused"} />
            <IntervalBadge interval={topic.interval} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {topic.last_run ? (
              <div>Last run: {format(new Date(topic.last_run), "PPp")}</div>
            ) : (
              <div>Never run</div>
            )}
            {topic.next_run && (
              <div>Next run: {format(new Date(topic.next_run), "PPp")}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle?.(topic.id)}
            >
              {topic.active ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Link to={`/topics/${topic.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(topic.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


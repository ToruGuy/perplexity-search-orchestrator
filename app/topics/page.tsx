"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import { IntervalBadge } from "@/components/interval-badge"
import { Topic } from "@/lib/types"
import { getTopics, toggleTopic, deleteTopic, triggerSearch } from "@/lib/api"
import { Plus, Play } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      setLoading(true)
      const data = await getTopics()
      setTopics(data)
    } catch (error) {
      toast.error("Failed to load topics")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleTopic(id)
      await loadTopics()
      toast.success("Topic updated")
    } catch (error) {
      toast.error("Failed to update topic")
    }
  }

  const handleDeleteClick = (id: string) => {
    setTopicToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!topicToDelete) return
    try {
      await deleteTopic(topicToDelete)
      await loadTopics()
      toast.success("Topic deleted")
      setDeleteDialogOpen(false)
      setTopicToDelete(null)
    } catch (error) {
      toast.error("Failed to delete topic")
    }
  }

  const handleTriggerSearch = async (id: string) => {
    try {
      toast.info("Triggering search...")
      await triggerSearch(id)
      await loadTopics()
      toast.success("Search completed")
    } catch (error) {
      toast.error("Failed to trigger search")
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Link href="/topics/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No topics yet</p>
          <Link href="/topics/new">
            <Button>Create your first topic</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">
                    <Link href={`/topics/${topic.id}`} className="hover:underline">
                      {topic.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{topic.query}</TableCell>
                  <TableCell>
                    <IntervalBadge interval={topic.interval} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={topic.active ? "active" : "paused"} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {topic.last_run ? format(new Date(topic.last_run), "PPp") : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {topic.next_run ? format(new Date(topic.next_run), "PPp") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerSearch(topic.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(topic.id)}
                      >
                        {topic.active ? "Pause" : "Resume"}
                      </Button>
                      <Link href={`/topics/${topic.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(topic.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this topic? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


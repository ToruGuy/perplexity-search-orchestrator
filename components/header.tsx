"use client"

import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useApp } from "@/lib/app-context"
import * as api from "@/lib/api"
import { toast } from "sonner"

export function Header() {
  const { schedulerRunning, setSchedulerRunning } = useApp()
  const [loading, setLoading] = useState(false)

  const handleToggleScheduler = async () => {
    setLoading(true)
    try {
      if (schedulerRunning) {
        await api.stopScheduler()
        setSchedulerRunning(false)
      } else {
        await api.startScheduler()
        setSchedulerRunning(true)
      }
    } catch (error) {
      console.error("Failed to toggle scheduler:", error)
      toast.error(`Failed to ${schedulerRunning ? "stop" : "start"} scheduler`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Perplexity Search Orchestrator</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={schedulerRunning ? "success" : "secondary"}>
            {schedulerRunning ? "Running" : "Stopped"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleScheduler}
            disabled={loading}
          >
            {schedulerRunning ? (
              <>
                <Square className="h-4 w-4" />
                {loading ? "Stopping..." : "Stop"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {loading ? "Starting..." : "Start"}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}


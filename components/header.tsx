"use client"

import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function Header() {
  const [schedulerRunning, setSchedulerRunning] = useState(false)

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
            onClick={() => setSchedulerRunning(!schedulerRunning)}
          >
            {schedulerRunning ? (
              <>
                <Square className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}


import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CalendarDays } from "lucide-react"
import { Interval } from "@/lib/types"

interface IntervalBadgeProps {
  interval: Interval
}

export function IntervalBadge({ interval }: IntervalBadgeProps) {
  const config = {
    hourly: {
      icon: Clock,
      label: "Hourly",
      variant: "default" as const,
    },
    daily: {
      icon: Calendar,
      label: "Daily",
      variant: "secondary" as const,
    },
    weekly: {
      icon: CalendarDays,
      label: "Weekly",
      variant: "outline" as const,
    },
  }

  const { icon: Icon, label, variant } = config[interval]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}


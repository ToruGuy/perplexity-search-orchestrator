import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, PauseCircle } from "lucide-react"

interface StatusBadgeProps {
  status: "active" | "paused" | "error"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Active",
    },
    paused: {
      variant: "secondary" as const,
      icon: PauseCircle,
      label: "Paused",
    },
    error: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Error",
    },
  }

  const { variant, icon: Icon, label } = config[status]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}


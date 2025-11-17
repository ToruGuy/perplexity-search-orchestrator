import { Link, useLocation } from "react-router-dom"
import { Search, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Topics", icon: Search },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Nav() {
  const location = useLocation()

  return (
    <nav className="w-64 border-r bg-card flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <div className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon
          const isActive = item.href === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
              to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
      </div>
    </nav>
  )
}


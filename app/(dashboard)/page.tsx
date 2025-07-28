import { Badge } from "@/components/ui/badge"
import { TodoFeed } from "@/components/landing/todo-feed"
import { ProgressSummary } from "@/components/landing/progress-summary"

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Today&apos;s Focus
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Zero decisions needed - just follow the list
          </p>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Execution Mode
          </Badge>
        </div>

        {/* Real Progress Summary */}
        <ProgressSummary />

        {/* Real Todo Feed */}
        <TodoFeed />

        {/* Two-Tier Philosophy Reminder */}
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Landing Page Philosophy:</strong> Absolute simplicity for zero cognitive load
          </p>
          <p className="text-xs text-muted-foreground">
            Complex planning happens in the configuration area • Execution happens here
          </p>
        </div>
      </div>
    </div>
  )
} 
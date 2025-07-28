import { Badge } from "@/components/ui/badge"
import { TodoFeed } from "@/components/landing/todo-feed"
import { ProgressSummary } from "@/components/landing/progress-summary"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Daily Scheduler</h1>
              <Badge variant="secondary" className="text-xs">
                Execution Mode
              </Badge>
            </div>
            <nav className="flex items-center gap-4">
              <a 
                href="/config" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Planning Mode
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Today&apos;s Focus
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Zero decisions needed - just follow the list
            </p>
          </div>

          {/* Real Progress Summary */}
          <ProgressSummary />

          {/* Real Todo Feed */}
          <TodoFeed />

          {/* Two-Tier Philosophy Reminder */}
          <div className="text-center space-y-2 py-4">
            <p className="text-sm text-muted-foreground font-semibold">
              The Daily Scheduler Philosophy:
            </p>
            <p className="text-sm text-muted-foreground">
              Plan once on Sunday, execute effortlessly all week.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

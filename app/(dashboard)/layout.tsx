import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Settings, Home, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Daily Scheduler</span>
              </div>
            </div>

            {/* Two-Tier Navigation */}
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Landing
                </Button>
              </Link>
              
              <Link href="/config">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </Button>
              </Link>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* User menu will be added in Phase 2 */}
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              <p>Daily schedule planner to lessen decision fatigue and streamline your day</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Two-Tier Design:</span>
              <Card className="px-3 py-1">
                <CardContent className="p-0 text-xs">
                  Landing = Execution
                </CardContent>
              </Card>
              <Card className="px-3 py-1">
                <CardContent className="p-0 text-xs">
                  Config = Planning
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
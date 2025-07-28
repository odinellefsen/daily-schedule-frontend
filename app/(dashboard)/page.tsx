import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Settings, Plus } from "lucide-react"
import Link from "next/link"

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

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State - Phase 1 Placeholder */}
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Ready for Action</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your todo feed will appear here. Start by setting up your meals and recipes in the configuration area.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Link href="/config">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </Link>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phase Implementation Status */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">🚧 Implementation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Phase 1: Foundation & Dependencies</span>
              <Badge variant="default">✅ Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phase 2: Authentication & API Setup</span>
              <Badge variant="secondary">📋 Next</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phase 3: Landing Page Components</span>
              <Badge variant="outline">⏳ Pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phase 4: Configuration Area</span>
              <Badge variant="outline">⏳ Pending</Badge>
            </div>
          </CardContent>
        </Card>

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
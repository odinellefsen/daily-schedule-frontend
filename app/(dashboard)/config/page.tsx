import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Calendar, BookOpen, Database, ListTodo, Home } from "lucide-react"
import Link from "next/link"

export default function ConfigurationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Configuration Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deep control for meal planning, recipe management, and weekly scheduling
          </p>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Planning Mode
          </Badge>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Landing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="meals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meals" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meal Planning
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Recipe Library
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Food Database
            </TabsTrigger>
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Todo Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Meal Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Meal Planning Hub</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Plan your weekly meals, create recipe snapshots, and generate cooking schedules. 
                  This is where the magic happens - 20 minutes on Sunday saves hours during the week.
                </p>
                <Badge variant="outline">Coming in Phase 4</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recipe Library
                </CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center space-y-4">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Recipe Management</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Build your recipe collection with versioning support. Each recipe becomes a template 
                  that gets snapshotted when used in meal planning.
                </p>
                <Badge variant="outline">Coming in Phase 4</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="food" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Food Database
                </CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center space-y-4">
                <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Nutritional Foundation</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Build your food database progressively. Start simple with text ingredients, 
                  add nutritional precision over time as needed.
                </p>
                <Badge variant="outline">Coming in Phase 4</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Todo Management
                </CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center space-y-4">
                <ListTodo className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Advanced Todo Control</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Manage all todos, create meal-related tasks, and configure scheduling. 
                  Most todos come from dragging meal steps, but you can create standalone ones too.
                </p>
                <Badge variant="outline">Coming in Phase 4</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Architecture Overview */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Event-Driven Architecture</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Meal creation = 3 events (complete snapshot)</li>
                  <li>• Recipe updates bump version numbers</li>
                  <li>• Todo completion syncs meal progress</li>
                  <li>• Cross-domain coordination via events</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Two-Tier Design</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Sunday: 20 minutes planning here</li>
                  <li>• Monday-Friday: Execute on landing page</li>
                  <li>• Zero decisions during execution</li>
                  <li>• Deep control during planning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
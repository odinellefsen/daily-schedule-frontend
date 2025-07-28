'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Clock, 
  Settings, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { TodoItem } from './todo-item'
import { QuickTodoForm } from './quick-todo-form'
import { useLandingStore } from '@/lib/stores/landing-store'

export function TodoFeed() {
  const { 
    todos, 
    loading, 
    error, 
    fetchTodos, 
    clearError,
    lastFetched 
  } = useLandingStore()

  useEffect(() => {
    // Fetch todos on component mount
    fetchTodos()

    // Set up auto-refresh every 5 minutes to keep data fresh
    const interval = setInterval(() => {
      fetchTodos()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchTodos])

  const handleRefresh = () => {
    clearError()
    fetchTodos()
  }

  // Separate todos by completion status and urgency
  const incompleteTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  
  // Sort incomplete todos by urgency (overdue first, then now, then upcoming)
  const sortedIncompleteTodos = incompleteTodos.sort((a, b) => {
    const urgencyOrder = { overdue: 0, now: 1, upcoming: 2, later: 3 }
    return urgencyOrder[a.urgency || 'later'] - urgencyOrder[b.urgency || 'later']
  })

  // Loading state
  if (loading && todos.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-6">
          <div className="space-y-3">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Ready for Action</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your todo feed will appear here. Start by planning your meals and recipes 
                in the configuration area, or add standalone tasks.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/config">
              <Button className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Plan Your Week
              </Button>
            </Link>
            <QuickTodoForm />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Two-Tier Philosophy:</strong></p>
            <p>Plan once on Sunday → Execute effortlessly all week</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state - show todos
  return (
    <div className="space-y-4">
      {/* Header with refresh indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(lastFetched).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Incomplete todos (priority section) */}
      {sortedIncompleteTodos.length > 0 && (
        <div className="space-y-3">
          {sortedIncompleteTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {/* Completed todos (collapsible section) */}
      {completedTodos.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Completed Today ({completedTodos.length})
              </span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            
            <div className="space-y-2">
              {completedTodos.slice(0, 3).map((todo) => (
                <div 
                  key={todo.id} 
                  className="text-xs text-muted-foreground flex items-center gap-2 py-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="line-through">{todo.description}</span>
                  {todo.context?.type === 'meal' && (
                    <span className="text-blue-500">• Meal prep</span>
                  )}
                </div>
              ))}
              
              {completedTodos.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ... and {completedTodos.length - 3} more completed tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All tasks completed celebration */}
      {incompleteTodos.length === 0 && completedTodos.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  🎉 All Tasks Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Fantastic work! You&apos;ve completed everything on your list.
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Link href="/config">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan Tomorrow
                  </Button>
                </Link>
                <QuickTodoForm 
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Tasks
                    </Button>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
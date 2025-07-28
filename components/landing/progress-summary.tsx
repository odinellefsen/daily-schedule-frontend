'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp } from 'lucide-react'
import { useLandingStore } from '@/lib/stores/landing-store'
import { cn } from '@/lib/utils'

export function ProgressSummary() {
  const { todos, counts, loading } = useLandingStore()

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const completionPercentage = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0
    
    // Calculate productivity metrics
    const urgentTodos = todos.filter(t => !t.completed && (t.urgency === 'now' || t.urgency === 'overdue'))
    const mealRelatedTodos = todos.filter(t => t.context?.type === 'meal')
    const standaloneCompleted = todos.filter(t => t.completed && t.context?.type === 'standalone')
    
    return {
      completionPercentage,
      urgentCount: urgentTodos.length,
      mealTodosTotal: mealRelatedTodos.length,
      mealTodosCompleted: mealRelatedTodos.filter(t => t.completed).length,
      standaloneCompleted: standaloneCompleted.length,
      canStartNow: todos.filter(t => !t.completed && t.canStartNow).length
    }
  }, [todos, counts])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getMotivationalMessage = (percentage: number, overdue: number) => {
    if (overdue > 0) return `${overdue} task${overdue > 1 ? 's' : ''} need immediate attention`
    if (percentage === 100) return "🎉 All tasks completed! You&apos;re crushing it!"
    if (percentage >= 75) return "Almost there! Keep up the great work"
    if (percentage >= 50) return "Good progress! You're halfway done"
    if (percentage >= 25) return "Getting started! Every task counts"
    return "Ready to tackle the day? Let's begin!"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-2 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Daily Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{Math.round(metrics.completionPercentage)}%</span>
          </div>
                     <Progress 
             value={metrics.completionPercentage} 
             className="h-3"
           />
          <p className="text-xs text-muted-foreground">
            {getMotivationalMessage(metrics.completionPercentage, counts.overdue)}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {counts.completed}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
            {counts.completed > 0 && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{counts.completed}
              </Badge>
            )}
          </div>

          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {counts.remaining}
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
            {metrics.canStartNow > 0 && (
              <Badge variant="outline" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {metrics.canStartNow} ready
              </Badge>
            )}
          </div>

          <div className="text-center space-y-1">
            <div 
              className={cn(
                "text-2xl font-bold",
                counts.overdue > 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-gray-400 dark:text-gray-600"
              )}
            >
              {counts.overdue}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
            {counts.overdue > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Secondary Stats */}
        {(metrics.mealTodosTotal > 0 || metrics.urgentCount > 0) && (
          <div className="pt-4 border-t space-y-3">
            <div className="text-xs font-medium text-muted-foreground">Today&apos;s Focus</div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              {metrics.mealTodosTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Meal prep:</span>
                  <Badge variant="outline" className="text-xs">
                    {metrics.mealTodosCompleted}/{metrics.mealTodosTotal}
                  </Badge>
                </div>
              )}
              
              {metrics.urgentCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Urgent:</span>
                  <Badge 
                    variant={metrics.urgentCount > 0 ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {metrics.urgentCount}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        {counts.total === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks scheduled yet.</p>
            <p className="text-xs">Head to configuration to plan your day!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Check, 
  Clock, 
  Trash2, 
  AlertCircle, 
  Calendar,
  Timer,
  Loader2
} from 'lucide-react'
import { Todo } from '@/lib/types/api'
import { useLandingStore } from '@/lib/stores/landing-store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { completeTodo, removeTodo } = useLandingStore()
  const [isCompleting, setIsCompleting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get urgency styling
  const getUrgencyColors = (urgency: Todo['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return {
          card: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          text: 'text-red-700 dark:text-red-300'
        }
      case 'now':
        return {
          card: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          text: 'text-blue-700 dark:text-blue-300'
        }
      case 'upcoming':
        return {
          card: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          text: 'text-orange-700 dark:text-orange-300'
        }
      default:
        return {
          card: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          text: 'text-gray-700 dark:text-gray-300'
        }
    }
  }

  const handleComplete = async () => {
    if (todo.completed || isCompleting) return
    
    setIsCompleting(true)
    setError(null)
    
    try {
      await completeTodo(todo.id)
    } catch (error) {
      setError('Failed to complete todo. Please try again.')
      console.error('Failed to complete todo:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleRemove = async () => {
    if (isRemoving) return
    
    setIsRemoving(true)
    setError(null)
    
    try {
      await removeTodo(todo.id)
    } catch (error) {
      setError('Failed to remove todo. Please try again.')
      console.error('Failed to remove todo:', error)
      setIsRemoving(false) // Keep the component visible on error
    }
  }

  const urgencyColors = getUrgencyColors(todo.urgency)
  const scheduledTime = todo.scheduledFor ? new Date(todo.scheduledFor) : null

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        todo.completed && 'opacity-60',
        !todo.completed && urgencyColors.card,
        isRemoving && 'opacity-50 pointer-events-none'
      )}
    >
      <CardContent className="p-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start gap-3">
          {/* Completion Checkbox */}
          <div className="flex items-center pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={handleComplete}
              disabled={todo.completed || isCompleting}
              className="h-5 w-5"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with urgency and context */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn('text-xs', urgencyColors.badge)}
              >
                {todo.urgency === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                {todo.urgency === 'now' && <Timer className="h-3 w-3 mr-1" />}
                {todo.urgency === 'upcoming' && <Clock className="h-3 w-3 mr-1" />}
                {todo.urgency}
              </Badge>

              {todo.context?.type === 'meal' && (
                <Badge variant="secondary" className="text-xs">
                  Step {todo.context.stepNumber}
                </Badge>
              )}

              {todo.context?.estimatedDuration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {todo.context.estimatedDuration}m
                </div>
              )}

              {scheduledTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(scheduledTime, 'h:mm a')}
                </div>
              )}
            </div>

            {/* Todo Description */}
            <p 
              className={cn(
                'text-sm font-medium leading-relaxed',
                todo.completed && 'line-through text-muted-foreground',
                !todo.completed && urgencyColors.text
              )}
            >
              {todo.description}
            </p>

            {/* Context Information */}
            {todo.context?.mealName && (
              <p className="text-xs text-muted-foreground">
                Part of: {todo.context.mealName}
              </p>
            )}

            {todo.isOverdue && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                ⚠ This task is overdue
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {!todo.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleComplete}
                disabled={isCompleting}
                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
                title="Mark as complete"
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={isRemoving}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
              title="Remove todo"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
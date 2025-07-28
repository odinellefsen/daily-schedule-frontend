'use client'

import { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Circle,
  GripVertical,
  Calendar,
  Users,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/config-store'
import { MealWithDetails, MealStep } from '@/lib/types/api'

interface DraggableMealStepProps {
  step: MealStep
  stepNumber: number
  mealName: string
  isCompleted: boolean
  onToggleComplete: (stepId: string, completed: boolean) => void
}

function DraggableMealStep({ 
  step, 
  stepNumber, 
  mealName, 
  isCompleted,
  onToggleComplete 
}: DraggableMealStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: step.id,
    data: {
      type: 'meal-step',
      step,
      mealName,
      stepNumber,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200 cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : 'hover:shadow-md',
        isCompleted ? 'bg-muted/50' : ''
      )}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex flex-col items-center gap-2 mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete(step.id, !isCompleted)
              }}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Step Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={cn(
                "font-medium text-sm",
                isCompleted && "line-through text-muted-foreground"
              )}>
                Step {stepNumber}: {step.instruction}
              </h4>
              {step.estimatedDurationMinutes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {step.estimatedDurationMinutes}m
                </div>
              )}
            </div>

            {step.assignedToDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Scheduled for {format(new Date(step.assignedToDate), 'MMM d')}
              </div>
            )}

            {step.todoId && (
              <Badge variant="outline" className="text-xs">
                Already in Todo List
              </Badge>
            )}

            {/* Drag Instruction */}
            {!step.todoId && !isDragging && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-3 w-3" />
                Drag to Todo List to schedule this step
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MealDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meal: MealWithDetails | null
}

export function MealDetailModal({ open, onOpenChange, meal }: MealDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { fetchMeal, fetchWeeklyMeals } = useConfigStore()

  // Refresh meal details when modal opens
  useEffect(() => {
    if (open && meal?.id) {
      fetchMeal(meal.id)
    }
  }, [open, meal?.id, fetchMeal])

  const handleToggleStepComplete = async (stepId: string, completed: boolean) => {
    if (!meal) return
    
    setIsUpdating(true)
    try {
      // TODO: Implement API call to update meal step completion
      // await apiClient.updateMealStep(stepId, { isStepCompleted: completed })
      
      // Refresh meal and weekly view
      await fetchMeal(meal.id)
      await fetchWeeklyMeals()
    } catch (error) {
      console.error('Failed to update step:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!meal) return null

  const completedSteps = meal.steps?.filter(s => s.isStepCompleted).length || 0
  const totalSteps = meal.steps?.length || 0
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const draggableSteps = meal.steps?.filter(s => !s.isStepCompleted) || []
  const completedStepsData = meal.steps?.filter(s => s.isStepCompleted) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {meal.mealName}
          </DialogTitle>
          <DialogDescription>
            {meal.scheduledToBeEatenAt && (
              <span>Scheduled for {format(new Date(meal.scheduledToBeEatenAt), 'PPP')}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Cooking Progress</h3>
              <span className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} steps completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            
            {meal.hasMealBeenConsumed && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Meal Completed
              </Badge>
            )}
          </div>

          {/* Recipe Information */}
          {meal.recipes && meal.recipes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Recipes ({meal.recipes.length})</h3>
              <div className="space-y-2">
                {meal.recipes.map((recipe, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{recipe.recipeName}</span>
                    {recipe.scalingFactor !== 1 && (
                      <Badge variant="outline">×{recipe.scalingFactor}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draggable Steps */}
          {draggableSteps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Remaining Steps</h3>
                <div className="text-xs text-muted-foreground">
                  Drag steps to your Todo List to schedule them
                </div>
              </div>
              
              <Alert>
                <GripVertical className="h-4 w-4" />
                <AlertDescription>
                  You can drag cooking steps to your Todo List to schedule them for specific days. 
                  This bridges your meal planning with daily execution!
                </AlertDescription>
              </Alert>

              <div className="space-y-3 group">
                {draggableSteps.map((step, index) => (
                  <DraggableMealStep
                    key={step.id}
                    step={step}
                    stepNumber={meal.steps?.findIndex(s => s.id === step.id) + 1 || index + 1}
                    mealName={meal.mealName}
                    isCompleted={false}
                    onToggleComplete={handleToggleStepComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Steps */}
          {completedStepsData.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-green-700 dark:text-green-400">
                Completed Steps ({completedStepsData.length})
              </h3>
              <div className="space-y-2">
                {completedStepsData.map((step, index) => (
                  <Card key={step.id} className="bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm line-through text-muted-foreground">
                          Step {meal.steps?.findIndex(s => s.id === step.id) + 1}: {step.instruction}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalSteps === 0 && (
            <div className="text-center py-8 space-y-4">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <div>
                <h3 className="text-lg font-medium">No Cooking Steps</h3>
                <p className="text-muted-foreground">
                  This meal doesn&apos;t have any cooking steps yet.
                </p>
              </div>
            </div>
          )}

          {/* All Steps Complete */}
          {totalSteps > 0 && completedSteps === totalSteps && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  All Steps Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Your meal is ready to be enjoyed.
                </p>
              </div>
            </div>
          )}
        </div>

        {isUpdating && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Updating...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
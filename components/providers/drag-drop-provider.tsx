'use client'

import { ReactNode } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { GripVertical, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useLandingStore } from '@/lib/stores/landing-store'
import { useConfigStore } from '@/lib/stores/config-store'
import { MealStep } from '@/lib/types/api'
import { toast } from 'sonner'

interface DragDropProviderProps {
  children: ReactNode
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [activeItem, setActiveItem] = useState<{
    type: string
    step: MealStep
    mealName: string
    stepNumber: number
  } | null>(null)

  const { fetchTodos } = useLandingStore()
  const { fetchWeeklyMeals } = useConfigStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'meal-step') {
      setActiveItem(active.data.current as {
        type: string
        step: MealStep
        mealName: string
        stepNumber: number
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveItem(null)

    if (!over) return

    // Handle meal step dropped on todo area
    if (
      active.data.current?.type === 'meal-step' && 
      over.data.current?.type === 'todo-drop-zone'
    ) {
      const stepData = active.data.current
      const dropZoneData = over.data.current

      try {
        // Create todo from meal step
        const todoDescription = `${stepData.mealName}: ${stepData.step.instruction}`
        
        await apiClient.createTodo({
          description: todoDescription,
          scheduledFor: dropZoneData.date || new Date().toISOString().split('T')[0],
        })

        // TODO: Update meal step to mark it as assigned to a todo
        // await apiClient.updateMealStep(stepData.step.id, { 
        //   todoId: createdTodo.id,
        //   assignedToDate: dropZoneData.date 
        // })

        // Refresh both stores
        await Promise.all([
          fetchTodos(),
          fetchWeeklyMeals()
        ])

        toast.success(`Cooking step added to your todo list!`, {
          description: `"${stepData.step.instruction}" scheduled for ${dropZoneData.dateLabel || 'today'}`
        })

      } catch (error) {
        console.error('Failed to create todo from meal step:', error)
        toast.error('Failed to add cooking step to todo list', {
          description: 'Please try again or add the task manually'
        })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay>
        {activeItem && (
          <Card className="w-80 shadow-lg opacity-90 rotate-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-sm">
                    Step {activeItem.stepNumber}: {activeItem.step.instruction}
                  </h4>
                  <div className="text-xs text-muted-foreground">
                    From: {activeItem.mealName}
                  </div>
                  {activeItem.step.estimatedDurationMinutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activeItem.step.estimatedDurationMinutes}m
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  )
} 
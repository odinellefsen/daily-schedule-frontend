'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { useConfigStore } from '@/lib/stores/config-store'
import { MealWithDetails } from '@/lib/types/api'
import { cn } from '@/lib/utils'
import { MealCreationModal } from './meal-creation-modal'
import { MealDetailModal } from './meal-detail-modal'

interface MealCardProps {
  meal: MealWithDetails
  onEdit: (meal: MealWithDetails) => void
}

function MealCard({ meal, onEdit }: MealCardProps) {
  const completedSteps = meal.steps?.filter(s => s.isStepCompleted).length || 0
  const totalSteps = meal.steps?.length || 0
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onEdit(meal)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium line-clamp-2 flex-1">{meal.mealName}</h4>
            {meal.hasMealBeenConsumed && (
              <CheckCircle2 className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {meal.steps?.some(s => s.estimatedDurationMinutes) && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {meal.steps.reduce((total, s) => total + (s.estimatedDurationMinutes || 0), 0)}m
              </div>
            )}
            
            {meal.recipes && meal.recipes.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {meal.recipes.length} Recipe{meal.recipes.length > 1 ? 's' : ''}
              </Badge>
            )}
            
            {meal.scheduledToBeEatenAt && (
              <span className="text-xs">
                {format(new Date(meal.scheduledToBeEatenAt), 'h:mm a')}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {totalSteps > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-muted-foreground">{completedSteps}/{totalSteps}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyMealPlanner() {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealWithDetails | null>(null)
  const { 
    weeklyMeals, 
    mealsLoading, 
    mealsError, 
    fetchWeeklyMeals,
    clearMealsError 
  } = useConfigStore()

  useEffect(() => {
    fetchWeeklyMeals()
  }, [fetchWeeklyMeals, currentWeek])

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7))
  }

  const handleRefresh = () => {
    clearMealsError()
    fetchWeeklyMeals()
  }

  const handleAddMeal = (date: Date) => {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  const handleEditMeal = (meal: MealWithDetails) => {
    setSelectedMeal(meal)
    setShowDetailModal(true)
  }

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  // Group meals by date
  const mealsByDate = (weeklyMeals || []).reduce((acc: Record<string, MealWithDetails[]>, meal: MealWithDetails) => {
    if (meal.scheduledToBeEatenAt) {
      const dateKey = format(new Date(meal.scheduledToBeEatenAt), 'yyyy-MM-dd')
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(meal)
    }
    return acc
  }, {})

  if (mealsLoading && !weeklyMeals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 animate-pulse" />
            Weekly Meal Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Week navigation skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            
            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-24 w-full" />
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
          <Calendar className="h-5 w-5" />
          Weekly Meal Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {mealsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{mealsError}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousWeek}
            disabled={mealsLoading}
          >
            ← Previous
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold">
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </h3>
            <p className="text-xs text-muted-foreground">
              Week of {format(currentWeek, 'MMMM d')}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextWeek}
            disabled={mealsLoading}
          >
            Next →
          </Button>
        </div>

        {/* Daily Meal Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayMeals = mealsByDate[dateKey] || []
            const isToday = isSameDay(date, new Date())

            return (
              <div key={dateKey} className="space-y-3">
                {/* Day Header */}
                <div className={cn(
                  "text-center py-2 rounded-lg",
                  isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <div className="text-sm font-medium">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold">
                    {format(date, 'd')}
                  </div>
                </div>

                {/* Meals for the day */}
                <div className="space-y-2 min-h-[120px]">
                  {dayMeals.length > 0 ? (
                    dayMeals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onEdit={handleEditMeal}
                      />
                    ))
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-full min-h-[120px] border-dashed border-2 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50"
                      onClick={() => handleAddMeal(date)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Plan Meal</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Week Summary */}
        {weeklyMeals && weeklyMeals.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {weeklyMeals.filter(m => m.steps?.every(s => s.isStepCompleted)).length}
                </div>
                <div className="text-muted-foreground">Meals Ready</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyMeals.length}
                </div>
                <div className="text-muted-foreground">Total Planned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {weeklyMeals.filter(m => m.hasMealBeenConsumed).length}
                </div>
                <div className="text-muted-foreground">Consumed</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!weeklyMeals || weeklyMeals.length === 0) && !mealsLoading && (
          <div className="text-center py-8 space-y-4">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-medium">No meals planned</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start planning your week by adding meals to specific days. This will help generate your todo list automatically.
              </p>
            </div>
            <Button onClick={() => handleAddMeal(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              Plan Your First Meal
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Meal Creation Modal */}
      <MealCreationModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        defaultDate={selectedDate}
      />
      
      {/* Meal Detail Modal */}
      <MealDetailModal 
        open={showDetailModal} 
        onOpenChange={setShowDetailModal}
        meal={selectedMeal}
      />
    </Card>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChefHat, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useConfigStore } from '@/lib/stores/config-store'
import { Recipe } from '@/lib/types/api'

// Form validation schema
const mealCreationSchema = z.object({
  mealName: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  scheduledToBeEatenAt: z.date().optional(),
  recipes: z.array(z.object({
    recipeId: z.string(),
    recipeName: z.string(),
    scalingFactor: z.number().min(0.1).max(10),
  })).min(1, 'Select at least one recipe'),
})

type MealCreationForm = z.infer<typeof mealCreationSchema>

interface MealCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
}

type FormStep = 'basic' | 'recipes' | 'review'

export function MealCreationModal({ open, onOpenChange, defaultDate }: MealCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdMeal, setCreatedMeal] = useState<{ id: string; mealName: string } | null>(null)
  const [recipeSearch, setRecipeSearch] = useState('')
  
  const { recipes, fetchRecipes, fetchWeeklyMeals } = useConfigStore()

  const form = useForm<MealCreationForm>({
    resolver: zodResolver(mealCreationSchema),
    defaultValues: {
      mealName: '',
      scheduledToBeEatenAt: defaultDate,
      recipes: [],
    },
  })

  const { fields: selectedRecipes, append: addRecipe, remove: removeRecipe } = useFieldArray({
    control: form.control,
    name: 'recipes',
  })

  useEffect(() => {
    if (open) {
      fetchRecipes()
      if (defaultDate) {
        form.setValue('scheduledToBeEatenAt', defaultDate)
      }
    }
  }, [open, fetchRecipes, defaultDate, form])

  const resetForm = () => {
    setCurrentStep('basic')
    setCreatedMeal(null)
    setError(null)
    setRecipeSearch('')
    form.reset({
      mealName: '',
      scheduledToBeEatenAt: defaultDate,
      recipes: [],
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleBasicNext = (data: Pick<MealCreationForm, 'mealName' | 'scheduledToBeEatenAt'>) => {
    setCurrentStep('recipes')
  }

  const handleRecipesNext = () => {
    setCurrentStep('review')
  }

  const handleSubmit = async (data: MealCreationForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const meal = await apiClient.createMeal({
        mealName: data.mealName,
        scheduledToBeEatenAt: data.scheduledToBeEatenAt?.toISOString(),
        recipes: data.recipes.map(r => ({
          recipeId: r.recipeId,
          scalingFactor: r.scalingFactor,
        })),
      })

      setCreatedMeal(meal.meal)

      // Refresh the meals list
      await fetchWeeklyMeals()

      // Success - show confirmation and close after delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error) {
      console.error('Failed to create meal:', error)
      setError('Failed to create meal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddRecipe = (recipe: Recipe) => {
    const alreadyAdded = selectedRecipes.some(r => r.recipeId === recipe.id)
    if (alreadyAdded) return

    addRecipe({
      recipeId: recipe.id,
      recipeName: recipe.nameOfTheRecipe,
      scalingFactor: 1,
    })
  }

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(recipe => 
    recipe.nameOfTheRecipe.toLowerCase().includes(recipeSearch.toLowerCase()) &&
    !selectedRecipes.some(r => r.recipeId === recipe.id)
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic': return 'Meal Details'
      case 'recipes': return 'Select Recipes'
      case 'review': return 'Review & Create'
      default: return 'Create Meal'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic': return 'Basic information about your planned meal'
      case 'recipes': return 'Choose recipes to include in this meal'
      case 'review': return 'Review your meal plan before creating'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {(['basic', 'recipes', 'review'] as FormStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : (['basic', 'recipes'].indexOf(currentStep) > ['basic', 'recipes'].indexOf(step) ||
                       currentStep === 'review')
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {(['basic', 'recipes'].indexOf(currentStep) > ['basic', 'recipes'].indexOf(step) ||
                  (currentStep === 'review' && step !== 'review')) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    'w-24 h-0.5 mx-2',
                    (['basic', 'recipes'].indexOf(currentStep) > index ||
                     currentStep === 'review')
                      ? 'bg-green-500'
                      : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'basic' && (
            <form onSubmit={form.handleSubmit(handleBasicNext)} className="space-y-4">
              <div>
                <Label htmlFor="mealName">Meal Name *</Label>
                <Input
                  id="mealName"
                  placeholder="e.g., Sunday Family Dinner"
                  {...form.register('mealName')}
                />
                {form.formState.errors.mealName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.mealName.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Scheduled Date (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.watch('scheduledToBeEatenAt') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('scheduledToBeEatenAt') 
                        ? format(form.watch('scheduledToBeEatenAt')!, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch('scheduledToBeEatenAt')}
                      onSelect={(date) => form.setValue('scheduledToBeEatenAt', date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </form>
          )}

          {currentStep === 'recipes' && (
            <div className="space-y-6">
              {/* Selected Recipes */}
              {selectedRecipes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Recipes ({selectedRecipes.length})</Label>
                  <div className="space-y-3 mt-2">
                    {selectedRecipes.map((selectedRecipe, index) => (
                      <Card key={selectedRecipe.recipeId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{selectedRecipe.recipeName}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Scaling:</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max="10"
                                  value={selectedRecipe.scalingFactor}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 1
                                    form.setValue(`recipes.${index}.scalingFactor`, value)
                                  }}
                                  className="w-20 text-center"
                                />
                                <span className="text-xs text-muted-foreground">×</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRecipe(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipe Search & Selection */}
              <div>
                <Label className="text-sm font-medium">Add Recipes</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 max-h-60 overflow-y-auto">
                  {filteredRecipes.map((recipe) => (
                    <Card 
                      key={recipe.id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => handleAddRecipe(recipe)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {recipe.nameOfTheRecipe}
                          </h4>
                          {recipe.generalDescriptionOfTheRecipe && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {recipe.generalDescriptionOfTheRecipe}
                            </p>
                          )}
                          {recipe.whenIsItConsumed && recipe.whenIsItConsumed.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {recipe.whenIsItConsumed.slice(0, 2).map((timing) => (
                                <Badge key={timing} variant="outline" className="text-xs">
                                  {timing}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredRecipes.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      {recipeSearch ? (
                        <p className="text-sm">No recipes found for &quot;{recipeSearch}&quot;</p>
                      ) : (
                        <p className="text-sm">No more recipes available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {form.formState.errors.recipes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.recipes.message}
                </p>
              )}
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              {createdMeal ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Meal Created Successfully!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      &quot;{createdMeal.mealName}&quot; has been added to your meal plan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Meal Summary */}
                  <div>
                    <h3 className="font-semibold">{form.watch('mealName')}</h3>
                    {form.watch('scheduledToBeEatenAt') && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Scheduled for {format(form.watch('scheduledToBeEatenAt')!, 'PPP')}
                      </p>
                    )}
                  </div>

                  {/* Recipes Summary */}
                  <div>
                    <h4 className="font-medium">Recipes ({selectedRecipes.length})</h4>
                    <div className="space-y-2 mt-2">
                      {selectedRecipes.map((recipe, index) => (
                        <div key={recipe.recipeId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{recipe.recipeName}</span>
                            {recipe.scalingFactor !== 1 && (
                              <span className="text-sm text-muted-foreground ml-2">
                                (×{recipe.scalingFactor})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {currentStep !== 'basic' && !createdMeal && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentStep === 'recipes') setCurrentStep('basic')
                  else if (currentStep === 'review') setCurrentStep('recipes')
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {createdMeal ? 'Close' : 'Cancel'}
            </Button>

            {!createdMeal && (
              <>
                {currentStep === 'basic' && (
                  <Button onClick={form.handleSubmit(handleBasicNext)}>
                    Next: Recipes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {currentStep === 'recipes' && (
                  <Button 
                    onClick={handleRecipesNext}
                    disabled={selectedRecipes.length === 0}
                  >
                    Review Meal
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {currentStep === 'review' && (
                  <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ChefHat className="mr-2 h-4 w-4" />
                        Create Meal
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
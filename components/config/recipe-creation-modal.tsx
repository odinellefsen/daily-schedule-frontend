'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useConfigStore } from '@/lib/stores/config-store'

// Form validation schemas
const recipeBasicSchema = z.object({
  nameOfTheRecipe: z.string().min(1, 'Recipe name is required').max(100, 'Name too long'),
  generalDescriptionOfTheRecipe: z.string().optional(),
  whenIsItConsumed: z.array(z.string()).min(1, 'Select at least one meal timing'),
})

const recipeStepsSchema = z.object({
  steps: z.array(z.object({
    instruction: z.string().min(1, 'Step instruction is required'),
    estimatedDuration: z.number().min(1).max(480).optional(),
  })).min(1, 'Add at least one step'),
})

const recipeIngredientsSchema = z.object({
  ingredients: z.array(z.object({
    ingredientText: z.string().min(1, 'Ingredient is required'),
  })).min(1, 'Add at least one ingredient'),
})

type RecipeBasicForm = z.infer<typeof recipeBasicSchema>
type RecipeStepsForm = z.infer<typeof recipeStepsSchema>
type RecipeIngredientsForm = z.infer<typeof recipeIngredientsSchema>

// Meal timing options
const MEAL_TIMINGS = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'DESSERT', label: 'Dessert' },
]

interface RecipeCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormStep = 'basic' | 'steps' | 'ingredients' | 'review'

export function RecipeCreationModal({ open, onOpenChange }: RecipeCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdRecipe, setCreatedRecipe] = useState<{ id: string; nameOfTheRecipe: string } | null>(null)
  
  const { fetchRecipes } = useConfigStore()

  // Form states for each step
  const [basicData, setBasicData] = useState<RecipeBasicForm | null>(null)
  const [stepsData, setStepsData] = useState<RecipeStepsForm | null>(null)
  const [ingredientsData, setIngredientsData] = useState<RecipeIngredientsForm | null>(null)

  // Basic info form
  const basicForm = useForm<RecipeBasicForm>({
    resolver: zodResolver(recipeBasicSchema),
    defaultValues: {
      nameOfTheRecipe: '',
      generalDescriptionOfTheRecipe: '',
      whenIsItConsumed: [],
    },
  })

  // Steps form
  const stepsForm = useForm<RecipeStepsForm>({
    resolver: zodResolver(recipeStepsSchema),
    defaultValues: {
      steps: [{ instruction: '', estimatedDuration: undefined }],
    },
  })

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: stepsForm.control,
    name: 'steps',
  })

  // Ingredients form
  const ingredientsForm = useForm<RecipeIngredientsForm>({
    resolver: zodResolver(recipeIngredientsSchema),
    defaultValues: {
      ingredients: [{ ingredientText: '' }],
    },
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: ingredientsForm.control,
    name: 'ingredients',
  })

  const resetForms = () => {
    setCurrentStep('basic')
    setBasicData(null)
    setStepsData(null)
    setIngredientsData(null)
    setCreatedRecipe(null)
    setError(null)
    basicForm.reset()
    stepsForm.reset({ steps: [{ instruction: '', estimatedDuration: undefined }] })
    ingredientsForm.reset({ ingredients: [{ ingredientText: '' }] })
  }

  const handleClose = () => {
    resetForms()
    onOpenChange(false)
  }

  const handleBasicNext = (data: RecipeBasicForm) => {
    setBasicData(data)
    setCurrentStep('steps')
  }

  const handleStepsNext = (data: RecipeStepsForm) => {
    setStepsData(data)
    setCurrentStep('ingredients')
  }

  const handleIngredientsNext = (data: RecipeIngredientsForm) => {
    setIngredientsData(data)
    setCurrentStep('review')
  }

  const handleSubmit = async () => {
    if (!basicData || !stepsData || !ingredientsData) {
      setError('Missing form data. Please complete all steps.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create the recipe
      const recipe = await apiClient.createRecipe({
        nameOfTheRecipe: basicData.nameOfTheRecipe,
        generalDescriptionOfTheRecipe: basicData.generalDescriptionOfTheRecipe,
        whenIsItConsumed: basicData.whenIsItConsumed,
      })

      setCreatedRecipe(recipe)

      // Step 2: Add steps
      const stepInstructions = stepsData.steps.map(step => step.instruction)
      await apiClient.createRecipeSteps({
        recipeId: recipe.id,
        instructions: stepInstructions,
      })

      // Step 3: Add ingredients
      const ingredientTexts = ingredientsData.ingredients.map(ing => ing.ingredientText)
      await apiClient.createRecipeIngredients({
        recipeId: recipe.id,
        ingredients: ingredientTexts,
      })

      // Refresh the recipes list
      await fetchRecipes()

      // Success - show confirmation and close after delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error) {
      console.error('Failed to create recipe:', error)
      setError('Failed to create recipe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic': return 'Recipe Details'
      case 'steps': return 'Cooking Steps'
      case 'ingredients': return 'Ingredients'
      case 'review': return 'Review & Create'
      default: return 'Create Recipe'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic': return 'Basic information about your recipe'
      case 'steps': return 'Step-by-step cooking instructions'
      case 'ingredients': return 'All ingredients needed for this recipe'
      case 'review': return 'Review your recipe before creating'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {(['basic', 'steps', 'ingredients', 'review'] as FormStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : (['basic', 'steps', 'ingredients'].indexOf(currentStep) > ['basic', 'steps', 'ingredients'].indexOf(step) ||
                       (currentStep === 'review' && step !== 'review'))
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {(['basic', 'steps', 'ingredients'].indexOf(currentStep) > ['basic', 'steps', 'ingredients'].indexOf(step) ||
                  (currentStep === 'review' && step !== 'review')) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-2',
                    (['basic', 'steps', 'ingredients'].indexOf(currentStep) > index ||
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
            <form onSubmit={basicForm.handleSubmit(handleBasicNext)} className="space-y-4">
              <div>
                <Label htmlFor="nameOfTheRecipe">Recipe Name *</Label>
                <Input
                  id="nameOfTheRecipe"
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  {...basicForm.register('nameOfTheRecipe')}
                />
                {basicForm.formState.errors.nameOfTheRecipe && (
                  <p className="text-sm text-destructive mt-1">
                    {basicForm.formState.errors.nameOfTheRecipe.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="generalDescriptionOfTheRecipe">Description</Label>
                <Textarea
                  id="generalDescriptionOfTheRecipe"
                  placeholder="Brief description of your recipe..."
                  {...basicForm.register('generalDescriptionOfTheRecipe')}
                />
              </div>

              <div>
                <Label>When is this consumed? *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {MEAL_TIMINGS.map((timing) => (
                    <div key={timing.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={timing.value}
                        checked={basicForm.watch('whenIsItConsumed').includes(timing.value)}
                        onCheckedChange={(checked) => {
                          const current = basicForm.getValues('whenIsItConsumed')
                          if (checked) {
                            basicForm.setValue('whenIsItConsumed', [...current, timing.value])
                          } else {
                            basicForm.setValue('whenIsItConsumed', current.filter(t => t !== timing.value))
                          }
                        }}
                      />
                      <Label htmlFor={timing.value} className="text-sm">
                        {timing.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {basicForm.formState.errors.whenIsItConsumed && (
                  <p className="text-sm text-destructive mt-1">
                    {basicForm.formState.errors.whenIsItConsumed.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {currentStep === 'steps' && (
            <form onSubmit={stepsForm.handleSubmit(handleStepsNext)} className="space-y-4">
              <div className="space-y-4">
                {stepFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Step {index + 1}</Label>
                      {stepFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Textarea
                      placeholder="Describe this cooking step..."
                      {...stepsForm.register(`steps.${index}.instruction`)}
                    />
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Minutes"
                        className="w-24"
                        {...stepsForm.register(`steps.${index}.estimatedDuration`, { valueAsNumber: true })}
                      />
                      <span className="text-sm text-muted-foreground">minutes (optional)</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => appendStep({ instruction: '', estimatedDuration: undefined })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Step
              </Button>
            </form>
          )}

          {currentStep === 'ingredients' && (
            <form onSubmit={ingredientsForm.handleSubmit(handleIngredientsNext)} className="space-y-4">
              <div className="space-y-3">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., 2 cups all-purpose flour"
                      {...ingredientsForm.register(`ingredients.${index}.ingredientText`)}
                      className="flex-1"
                    />
                    {ingredientFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => appendIngredient({ ingredientText: '' })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Ingredient
              </Button>
            </form>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              {createdRecipe ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Recipe Created Successfully!
                    </h3>
                                         <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                       &quot;{createdRecipe.nameOfTheRecipe}&quot; has been added to your recipe library.
                     </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Recipe Summary */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{basicData?.nameOfTheRecipe}</h3>
                      {basicData?.generalDescriptionOfTheRecipe && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {basicData.generalDescriptionOfTheRecipe}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {basicData?.whenIsItConsumed.map((timing) => (
                          <Badge key={timing} variant="secondary" className="text-xs">
                            {timing}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Steps ({stepsData?.steps.length})</h4>
                      <div className="space-y-2 mt-2">
                        {stepsData?.steps.map((step, index) => (
                          <div key={index} className="text-sm border-l-2 border-muted pl-3">
                            <span className="font-medium">Step {index + 1}:</span> {step.instruction}
                            {step.estimatedDuration && (
                              <span className="text-muted-foreground ml-2">
                                ({step.estimatedDuration} min)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Ingredients ({ingredientsData?.ingredients.length})</h4>
                      <ul className="space-y-1 mt-2">
                        {ingredientsData?.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                            {ingredient.ingredientText}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {currentStep !== 'basic' && !createdRecipe && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentStep === 'steps') setCurrentStep('basic')
                  else if (currentStep === 'ingredients') setCurrentStep('steps')
                  else if (currentStep === 'review') setCurrentStep('ingredients')
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {createdRecipe ? 'Close' : 'Cancel'}
            </Button>

            {!createdRecipe && (
              <>
                {currentStep === 'basic' && (
                  <Button onClick={basicForm.handleSubmit(handleBasicNext)}>
                    Next: Steps
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {currentStep === 'steps' && (
                  <Button onClick={stepsForm.handleSubmit(handleStepsNext)}>
                    Next: Ingredients
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {currentStep === 'ingredients' && (
                  <Button onClick={ingredientsForm.handleSubmit(handleIngredientsNext)}>
                    Review Recipe
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {currentStep === 'review' && (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ChefHat className="mr-2 h-4 w-4" />
                        Create Recipe
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
'use client'

import { useState } from 'react'
import { useForm, useFieldArray, FieldPath } from 'react-hook-form'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Database, 
  Plus, 
  Trash2, 
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useConfigStore } from '@/lib/stores/config-store'
import { UnitOfMeasurementEnum } from '@/lib/types/api'

// Form validation schemas
const foodItemBasicSchema = z.object({
  name: z.string().min(1, 'Food item name is required').max(100, 'Name too long'),
  categories: z.string().min(1, 'Add at least one category'),
})

const foodItemUnitsSchema = z.object({
  unitOfMeasurement: z.nativeEnum(UnitOfMeasurementEnum),
  unitDescription: z.string().optional(),
  calories: z.number().min(0).max(9999),
  proteinInGrams: z.number().min(0).max(999).optional(),
  carbohydratesInGrams: z.number().min(0).max(999).optional(),
  fatInGrams: z.number().min(0).max(999).optional(),
  fiberInGrams: z.number().min(0).max(999).optional(),
  sugarInGrams: z.number().min(0).max(999).optional(),
})

type FoodItemBasicForm = z.infer<typeof foodItemBasicSchema>
type FoodItemUnitsForm = z.infer<typeof foodItemUnitsSchema>

interface FoodItemCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormStep = 'basic' | 'units' | 'review'

export function FoodItemCreationModal({ open, onOpenChange }: FoodItemCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdFoodItem, setCreatedFoodItem] = useState<{ id: string; name: string } | null>(null)
  
  const { fetchFoodItems } = useConfigStore()

  // Form states for each step
  const [basicData, setBasicData] = useState<FoodItemBasicForm | null>(null)
  const [unitsData, setUnitsData] = useState<FoodItemUnitsForm[]>([])

  // Basic info form
  const basicForm = useForm<FoodItemBasicForm>({
    resolver: zodResolver(foodItemBasicSchema),
    defaultValues: {
      name: '',
      categories: '',
    },
  })

  // Units form
  const unitsForm = useForm<FoodItemUnitsForm>({
    resolver: zodResolver(foodItemUnitsSchema),
    defaultValues: {
      unitOfMeasurement: UnitOfMeasurementEnum.GRAM,
      unitDescription: '',
      calories: 0,
      proteinInGrams: 0,
      carbohydratesInGrams: 0,
      fatInGrams: 0,
      fiberInGrams: 0,
      sugarInGrams: 0,
    },
  })

  const resetForms = () => {
    setCurrentStep('basic')
    setIsSubmitting(false)
    setError(null)
    setCreatedFoodItem(null)
    setBasicData(null)
    setUnitsData([])
    basicForm.reset()
    unitsForm.reset()
  }

  const handleClose = () => {
    resetForms()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!basicData || unitsData.length === 0) {
      setError('Missing form data. Please complete all steps.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create the food item
      const foodItem = await apiClient.createFoodItem({
        name: basicData.name,
        categoryHierarchy: basicData.categories.split(',').map(cat => cat.trim()),
      })

      setCreatedFoodItem(foodItem)

      // Step 2: Add nutritional units
      for (const unit of unitsData) {
        await apiClient.createFoodItemUnit({
          foodItemId: foodItem.id,
          unitOfMeasurement: unit.unitOfMeasurement,
          unitDescription: unit.unitDescription || undefined,
          calories: unit.calories,
          proteinInGrams: unit.proteinInGrams || undefined,
          carbohydratesInGrams: unit.carbohydratesInGrams || undefined,
          fatInGrams: unit.fatInGrams || undefined,
          fiberInGrams: unit.fiberInGrams || undefined,
          sugarInGrams: unit.sugarInGrams || undefined,
        })
      }

      // Refresh the food items list
      await fetchFoodItems()

      // Success - show confirmation and close after delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error) {
      console.error('Failed to create food item:', error)
      setError('Failed to create food item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic': return 'Food Item Details'
      case 'units': return 'Nutritional Units'
      case 'review': return 'Review & Create'
      default: return 'Create Food Item'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic': return 'Enter basic information about the food item'
      case 'units': return 'Add nutritional information for different units'
      case 'review': return 'Review your food item and create it'
      default: return 'Create a new food item'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress indicators */}
        <div className="flex items-center gap-2 py-4">
          {(['basic', 'units', 'review'] as const).map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                currentStep === step ? "border-primary bg-primary text-primary-foreground" :
                  (index < (['basic', 'units', 'review'] as const).indexOf(currentStep)) ? "border-green-500 bg-green-500 text-white" :
                    "border-muted-foreground/30 text-muted-foreground"
              )}>
                {index < (['basic', 'units', 'review'] as const).indexOf(currentStep) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={cn(
                  "w-8 h-0.5",
                  index < (['basic', 'units', 'review'] as const).indexOf(currentStep) ? "bg-green-500" : "bg-muted-foreground/30"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 'basic' && (
            <form onSubmit={basicForm.handleSubmit((data) => {
              setBasicData(data)
              setCurrentStep('units')
            })} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Food Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chicken Breast, Brown Rice, Avocado"
                  {...basicForm.register('name')}
                />
                {basicForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{basicForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categories *</Label>
                <Input
                  placeholder="e.g., Protein, Poultry, Organic"
                  {...basicForm.register('categories')}
                />
                {basicForm.formState.errors.categories && (
                  <p className="text-sm text-destructive">{basicForm.formState.errors.categories.message}</p>
                )}
              </div>
            </form>
          )}

          {currentStep === 'units' && (
            <form onSubmit={unitsForm.handleSubmit((data) => {
              setUnitsData([...unitsData, data])
              setCurrentStep('review')
            })} className="space-y-4">
              <div className="space-y-4">
                <Label>Nutritional Units *</Label>
                {unitsData.map((unit, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Unit {index + 1}</h4>
                      {unitsData.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUnitsData(unitsData.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Unit of Measurement</Label>
                        <Select 
                          onValueChange={(value) => {
                            const newUnits = [...unitsData];
                            newUnits[index] = { ...newUnits[index], unitOfMeasurement: value as UnitOfMeasurementEnum };
                            setUnitsData(newUnits);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UnitOfMeasurementEnum).map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Input
                          placeholder="e.g., per 100g serving"
                          {...unitsForm.register(`unitDescription`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Calories *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...unitsForm.register(`calories`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Protein (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...unitsForm.register(`proteinInGrams`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Carbs (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...unitsForm.register(`carbohydratesInGrams`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fat (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...unitsForm.register(`fatInGrams`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fiber (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...unitsForm.register(`fiberInGrams`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sugar (g)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          {...unitsForm.register(`sugarInGrams`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnitsData([...unitsData, unitsForm.getValues()])}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Unit
                </Button>
              </div>
            </form>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              {createdFoodItem ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Food Item Created Successfully!</h3>
                  <p className="text-muted-foreground">
                    {createdFoodItem.name} has been added to your food database.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Review Food Item</h3>
                  
                  {basicData && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <p><strong>Name:</strong> {basicData.name}</p>
                      <p><strong>Categories:</strong> {basicData.categories}</p>
                    </div>
                  )}

                  {unitsData.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Nutritional Units ({unitsData.length})</h4>
                      <div className="space-y-2">
                        {unitsData.map((unit, index) => (
                          <div key={index} className="text-sm">
                            <strong>{unit.unitOfMeasurement}</strong>
                            {unit.unitDescription && ` (${unit.unitDescription})`}: 
                            {unit.calories} cal, {unit.proteinInGrams || 0}g protein, {unit.carbohydratesInGrams || 0}g carbs, {unit.fatInGrams || 0}g fat
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep === 'basic' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => basicForm.handleSubmit((data) => {
                setBasicData(data)
                setCurrentStep('units')
              })()} className="gap-2">
                Next: Units
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {currentStep === 'units' && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('basic')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => unitsForm.handleSubmit((data) => {
                setUnitsData([...unitsData, data])
                setCurrentStep('review')
              })()} className="gap-2">
                Next: Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {currentStep === 'review' && !createdFoodItem && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('units')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Food Item'
                )}
              </Button>
            </>
          )}

          {createdFoodItem && (
            <Button onClick={handleClose} className="gap-2">
              <Check className="h-4 w-4" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
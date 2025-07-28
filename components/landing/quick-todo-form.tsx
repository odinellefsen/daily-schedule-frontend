'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Calendar as CalendarIcon, Clock, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useLandingStore } from '@/lib/stores/landing-store'

// Form validation schema
const quickTodoSchema = z.object({
  description: z.string().min(1, 'Please enter a task description').max(200, 'Description too long'),
  scheduledFor: z.date().optional(),
})

type QuickTodoForm = z.infer<typeof quickTodoSchema>

interface QuickTodoFormProps {
  trigger?: React.ReactNode
}

export function QuickTodoForm({ trigger }: QuickTodoFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { fetchTodos } = useLandingStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuickTodoForm>({
    resolver: zodResolver(quickTodoSchema),
    defaultValues: {
      description: '',
      scheduledFor: undefined,
    },
  })

  const scheduledFor = watch('scheduledFor')

  const onSubmit = async (data: QuickTodoForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await apiClient.createTodo({
        description: data.description,
        scheduledFor: data.scheduledFor?.toISOString(),
      })

      // Refresh the todo list
      await fetchTodos()
      
      // Reset form and close dialog
      reset()
      setOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
      setError('Failed to create task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setError(null)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="w-full sm:w-auto">
      <Plus className="h-4 w-4 mr-2" />
      Add Quick Task
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Quick Task</DialogTitle>
          <DialogDescription>
            Create a standalone todo that you can complete right away or schedule for later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Input
              id="description"
              placeholder="e.g., Take out trash, Call dentist, Buy groceries..."
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Optional Scheduling */}
          <div className="space-y-2">
            <Label>Schedule for (optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !scheduledFor && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledFor ? format(scheduledFor, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledFor}
                    onSelect={(date) => setValue('scheduledFor', date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {scheduledFor && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue('scheduledFor', undefined)}
                  disabled={isSubmitting}
                  title="Clear date"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>💡 Quick Tip:</strong></p>
          <p>• Tasks without dates appear in your general todo list</p>
          <p>• Scheduled tasks appear based on urgency and timing</p>
          <p>• Meal-related tasks come from your weekly planning</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else if (result?.ok) {
        // Refresh the session to get the latest data
        await getSession()
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Daily Scheduler</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to access your daily planning tools
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Having trouble? Contact support
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Development Mode:</strong></p>
                <p>• Ensure your Hono backend is running on port 3000</p>
                <p>• Check that /api/auth/login endpoint is available</p>
                <p>• Verify CORS configuration allows requests from this domain</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 
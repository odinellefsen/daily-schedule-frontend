'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Log to your error reporting service here
    // e.g., Sentry, LogRocket, etc.
    
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isAuthError = this.state.error?.message?.includes('401') || 
                         this.state.error?.message?.includes('403') ||
                         this.state.error?.message?.includes('auth')

      const isNetworkError = this.state.error?.message?.includes('fetch') ||
                            this.state.error?.message?.includes('network') ||
                            this.state.error?.message?.includes('NetworkError')

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                {isAuthError 
                  ? "Authentication error occurred"
                  : isNetworkError 
                  ? "Network connection error"
                  : "An unexpected error occurred"}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Details</CardTitle>
                <CardDescription>
                  {isAuthError && "Please sign in again to continue"}
                  {isNetworkError && "Please check your internet connection"}
                  {!isAuthError && !isNetworkError && "We're working to fix this issue"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Message */}
                <Alert variant="destructive">
                  <AlertDescription className="text-sm font-mono">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {isAuthError ? (
                    <Link href="/auth/login" className="w-full">
                      <Button className="w-full">
                        Sign In Again
                      </Button>
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={this.handleReset}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={this.handleReload}
                      >
                        Reload Page
                      </Button>
                    </div>
                  )}
                  
                  <Link href="/" className="w-full">
                    <Button variant="ghost" className="w-full flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>
                  </Link>
                </div>

                {/* Development Error Details */}
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                      Development Error Info
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {this.state.error?.stack}
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>

            {/* Support Information */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Unhandled error:', error, errorInfo)
    
    // You can integrate with error reporting here
    // e.g., throw error to trigger the nearest error boundary
    throw error
  }
} 
import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-destructive">Something went wrong</h1>
          <p className="mb-6 text-muted-foreground max-w-md">
            The application encountered an unexpected error. Don&apos;t worry, your Elo is safe!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)]"
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

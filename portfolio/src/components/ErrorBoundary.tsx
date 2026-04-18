"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo: errorInfo.componentStack,
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            
            <p className="text-zinc-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this component. The error has been logged for investigation.
            </p>

            {this.props.showDetails && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-zinc-300 cursor-pointer hover:text-white transition-colors mb-2">
                  Technical Details
                </summary>
                <div className="bg-zinc-950/50 border border-zinc-700 rounded-lg p-4 text-sm text-red-300 font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs whitespace-pre-wrap">
                        {this.state.errorInfo}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lightweight error boundary for smaller components
export function SimpleErrorBoundary({ children, message = "Something went wrong" }: { 
  children: ReactNode; 
  message?: string;
}) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm font-medium">{message}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
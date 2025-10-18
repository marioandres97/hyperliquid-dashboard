'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from './logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="max-w-md w-full p-6 rounded-xl border border-red-500/30 bg-red-950/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-200">Something went wrong</h2>
                <p className="text-sm text-red-300/70">We encountered an unexpected error</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-4 p-3 rounded-lg bg-slate-950/50 border border-red-500/20">
                <p className="text-sm text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundary for module components
export const ModuleErrorBoundary: React.FC<{ children: ReactNode; moduleName: string }> = ({
  children,
  moduleName,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 rounded-xl border border-red-500/30 bg-red-950/10">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-semibold text-red-200">{moduleName} Error</h3>
          </div>
          <p className="text-sm text-red-300/70 mb-3">
            This module encountered an error and couldn't load.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors"
          >
            Reload
          </button>
        </div>
      }
      onError={(error) => {
        logger.error(`Module error in ${moduleName}`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#064E3B] via-[#0D1B17] to-[#0A0E14]">
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 
                className="text-2xl font-semibold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.03em'
                }}
              >
                Something went wrong
              </h2>
              
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                An unexpected error occurred. Don't worry, your data is safe. 
                Try refreshing the page or return to the homepage.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-left">
                  <p className="text-xs text-gray-500 mb-2 font-mono">Error Details:</p>
                  <p className="text-xs text-red-400 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-300 touch-target"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 touch-target"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

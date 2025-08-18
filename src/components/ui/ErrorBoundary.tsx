import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to external service (would be implemented in production)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would send to error tracking service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error logged:', errorData);
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(existingErrors.slice(-10))); // Keep last 10 errors
    } catch (e) {
      console.error('Failed to store error in localStorage:', e);
    }
  };
  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const subject = encodeURIComponent('Website Error Report');
    const body = encodeURIComponent(`
Error Details:
- Message: ${this.state.error?.message}
- Page: ${window.location.href}
- Time: ${new Date().toLocaleString()}
- Browser: ${navigator.userAgent}

Please describe what you were doing when this error occurred:

    `);
    window.open(`mailto:support@apexauto.com?subject=${subject}&body=${body}`);
  };
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-matte-black flex items-center justify-center p-4">
          <div className="bg-dark-graphite border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            
            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-matte-black border border-gray-700 rounded-sm text-left">
                <h3 className="text-red-400 font-bold mb-2">Error Details:</h3>
                <p className="text-gray-300 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>RELOAD PAGE</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>GO HOME</span>
              </button>
              
              <button
                onClick={this.handleReportError}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>REPORT ERROR</span>
              </button>
            </div>
            
            <p className="text-gray-500 text-xs mt-4">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
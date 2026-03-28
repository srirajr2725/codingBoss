import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // We log the error but allow the app to continue
    console.warn("Spline Runtime Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI if provided, otherwise null
      return this.props.fallback || null;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.toString()}</p>
          <button
            onClick={this.handleReset}
            className="mt-4 bg-[#9500FF] text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

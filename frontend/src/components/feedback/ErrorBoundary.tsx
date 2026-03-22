import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
          <div className="text-5xl">!</div>
          <h2 className="text-xl font-semibold text-[var(--text-h1)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            An unexpected error occurred while loading this page. You can try
            again or go back to the home page.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--component-primary)] border border-[var(--border)] text-[var(--text-h1)] hover:brightness-110 transition-all"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:brightness-110 transition-all"
            >
              Go home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import StatusPage, { getStatusConfig } from "./StatusPage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const config = getStatusConfig(500)!;

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

  render() {
    if (this.state.hasError) {
      return <StatusPage {...config} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

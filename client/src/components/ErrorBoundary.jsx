import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

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

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
                        <FiAlertTriangle className="h-8 w-8" />
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white">
                        Something went wrong
                    </h2>
                    
                    <p className="mt-2 max-w-md text-sm text-gray-400">
                        {this.state.error?.message?.includes("Failed to fetch dynamically imported module")
                            ? "A network or server update occurred while loading this page. Please refresh to load the latest version."
                            : this.state.error?.message || "An unexpected error occurred while loading this view."}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Reload Page
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

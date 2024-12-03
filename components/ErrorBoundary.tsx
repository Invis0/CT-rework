import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-gray-900">
                    <div className="bg-red-900/20 text-red-500 p-4 rounded-lg">
                        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                        <p className="text-sm">{this.state.error?.message}</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-gray-900">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 
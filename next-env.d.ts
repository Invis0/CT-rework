/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'react/jsx-runtime';
declare module 'framer-motion';
declare module 'next/router';
declare module 'next/link';
declare module 'lucide-react';
declare module '@vercel/analytics/react';
declare module 'recharts';

declare namespace React {
    interface ReactNode {
        children?: ReactNode | undefined;
        type?: any;
        props?: any;
    }
    
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // Add any custom attributes here if needed
    }
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

interface Window {
    ethereum?: any;
} 
/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'react' {
    interface ReactNode {
        children?: ReactNode | undefined;
        type?: any;
        props?: any;
    }
}

declare module 'react/jsx-runtime';
declare module 'framer-motion';
declare module 'next/router';
declare module 'next/link';
declare module 'lucide-react';
declare module '@vercel/analytics/react';
declare module 'recharts';

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

interface Window {
    ethereum?: any;
} 
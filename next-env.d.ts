/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace React {
    type ReactNode = 
        | string
        | number
        | boolean
        | null
        | undefined
        | React.ReactElement
        | React.ReactFragment
        | React.ReactPortal;
}

declare module 'react' {
    export * from 'react/index';
    export type { ReactNode } from 'react';
}

declare module 'react/jsx-runtime';
declare module 'framer-motion';
declare module 'next/router';
declare module 'next/link';
declare module 'lucide-react';
declare module '@vercel/analytics/react';
declare module 'recharts';

declare module 'clsx';
declare module 'tailwind-merge';

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

interface Window {
    ethereum?: any;
} 
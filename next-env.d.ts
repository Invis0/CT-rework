/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'clsx';
declare module 'tailwind-merge';

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

    interface ReactElement {
        type: any;
        props: any;
        key: any;
    }
}

declare module 'react' {
    export = React;
    export as namespace React;
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
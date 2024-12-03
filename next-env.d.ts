/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'react' {
    export * from 'react/index';
    export const useState: any;
    export const useEffect: any;
    export const useCallback: any;
    export const useContext: any;
    export const createContext: any;
    export const useRef: any;
    export const useMemo: any;
    export type ReactNode = any;
    export interface ChangeEvent<T = Element> {
        target: T;
        currentTarget: T;
    }
}

declare namespace JSX {
    interface Element {}
    interface IntrinsicElements {
        [elemName: string]: any;
    }
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

interface Window {
    ethereum?: any;
} 
/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'react' {
    export type ReactNode = 
        | string
        | number
        | boolean
        | null
        | undefined
        | React.ReactElement
        | React.ReactFragment
        | React.ReactPortal
        | React.PromiseLikeOfReactNode;

    export const useState: any;
    export const useEffect: any;
    export const useCallback: any;
    export const useMemo: any;
    export const useRef: any;
    export const createContext: any;
    export const useContext: any;
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
/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module 'react' {
    export * from 'react/index';
    export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
    export const useEffect: (effect: () => void | (() => void), deps?: ReadonlyArray<any>) => void;
    export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>) => T;
    export const useContext: <T>(context: React.Context<T>) => T;
    export const createContext: <T>(defaultValue: T) => React.Context<T>;
    export const useRef: <T>(initialValue: T) => { current: T };
    export const useMemo: <T>(factory: () => T, deps: ReadonlyArray<any>) => T;
    
    export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
        type: T;
        props: P;
        key: Key | null;
    }
    
    export type ReactNode =
        | ReactElement
        | string
        | number
        | ReactFragment
        | ReactPortal
        | boolean
        | null
        | undefined;

    export interface JSXElementConstructor<P> {
        (props: P): ReactElement<P, any> | null;
    }

    export type Key = string | number;
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
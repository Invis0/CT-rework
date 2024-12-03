import type { ReactNode } from 'react';

export interface WalletProps {
    wallet: WalletData;
    onRefresh?: () => void;
    className?: string;
}
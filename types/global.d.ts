export interface TokenMetric {
    symbol: string;
    token_address: string;
    num_swaps: number;
    total_buy_usd: number;
    total_sell_usd: number;
    total_pnl_usd: number;
    roi_percentage: number;
    avg_position_size: number;
    last_trade_time: string;
}

export interface WalletAnalytics {
    avg_hold_time_hours: number;
    avg_swaps_per_token: number;
    avg_buy_size: number;
    risk_metrics: {
        max_drawdown: number;
        sharpe_ratio: number;
        volatility: number;
        risk_rating: 'Low' | 'Medium' | 'High';
    };
    is_copyworthy: boolean;
    copyworthy_reasons: string[];
}

export interface WalletData {
    address: string;
    total_pnl_usd: number;
    winrate: number;
    total_trades: number;
    roi_percentage: number;
    avg_trade_size: number;
    total_volume: number;
    last_updated: string;
    consistency_score: number;
    token_metrics: TokenMetric[];
    risk_metrics: {
        max_drawdown: number;
        sharpe_ratio: number;
        sortino_ratio: number;
        risk_rating: 'Low' | 'Medium' | 'High';
        volatility: number;
    };
    total_score: number;
    roi_score: number;
    volume_score: number;
    risk_score: number;
    max_drawdown: number;
    last_trade_time: string;
    total_volume_24h?: number;
    total_pnl_24h?: number;
    analytics?: WalletAnalytics;
}

export interface WalletProps {
    wallet: WalletData;
    onRefresh?: () => void;
    className?: string;
} 
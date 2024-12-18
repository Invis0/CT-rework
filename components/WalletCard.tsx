import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Activity, DollarSign, 
    BarChart2, Eye, RefreshCw,
    ExternalLink, ChevronDown, Wallet,
    Award, Target, BarChart, Clock,
    Shield
} from 'lucide-react';
import Link from 'next/link';

interface CieloToken {
    num_swaps: number;
    total_buy_usd: number;
    total_sell_usd: number;
    total_pnl_usd: number;
    roi_percentage: number;
    token_symbol: string;
    token_name: string;
    is_honeypot: boolean;
}

interface TokenMetric {
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

interface RiskMetric {
    max_drawdown: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    risk_rating: 'Low' | 'Medium' | 'High';
    volatility: number;
}

interface WalletData {
    address: string;
    total_pnl_usd: number;
    winrate: number;
    total_trades: number;
    roi_percentage: number;
    avg_trade_size: number;
    total_volume: number;
    last_updated: string;
    consistency_score: number;
    token_metrics: Array<{
        symbol: string;
        token_address: string;
        num_swaps: number;
        total_buy_usd: number;
        total_sell_usd: number;
        total_pnl_usd: number;
        roi_percentage: number;
        avg_position_size: number;
        last_trade_time: string;
    }>;
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
    additional_metrics?: CieloToken[];
}

interface CieloData {
    total_pnl_usd: number;
    total_unrealized_pnl_usd: number;
    winrate: number;
    total_tokens_traded: number;
    total_roi_percentage: number;
    total_unrealized_roi_percentage: number;
    combined_pnl_usd: number;
    combined_roi_percentage: number;
    tokens: Array<{
        num_swaps: number;
        total_buy_usd: number;
        total_buy_amount: number;
        total_sell_usd: number;
        total_sell_amount: number;
        average_buy_price: number;
        average_sell_price: number;
        total_pnl_usd: number;
        unrealized_pnl_usd: number;
        token_price_usd: number;
        roi_percentage: number;
        unrealized_roi_percentage: number;
        token_address: string;
        token_symbol: string;
        token_name: string;
        chain: string;
        first_trade: number;
        last_trade: number;
        is_honeypot: boolean;
        chart_link: string;
    }>;
    paging: {
        total_pages: number;
        total_rows: number;
        total_rows_in_page: number;
    };
}

interface WalletProps {
    wallet: WalletData;
    onRefresh?: () => void;
}

export default function WalletCard({ wallet, onRefresh }: WalletProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cieloData, setCieloData] = useState<CieloData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchCieloData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${wallet.address}`);
            if (!response.ok) throw new Error('Failed to fetch Cielo data');
            const result = await response.json();
            if (result.success && result.data) {
                setCieloData(result.data);
                if (onRefresh) {
                    onRefresh();
                }
            }
        } catch (error) {
            console.error('Error fetching Cielo data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded && !cieloData && !loading) {
            fetchCieloData();
        }
    }, [isExpanded]);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchCieloData();
        } catch (error) {
            console.error('Error refreshing wallet:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Helper functions from previous implementation
    const getPerformanceColor = (value: number, thresholds: [number, number]) => {
        if (value >= thresholds[1]) return 'text-green-500';
        if (value >= thresholds[0]) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getBadgeColor = (value: number, thresholds: [number, number]) => {
        if (value >= thresholds[1]) return 'bg-green-500/20 text-green-400';
        if (value >= thresholds[0]) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getTokenData = () => {
        if (cieloData?.tokens && cieloData.tokens.length > 0) {
            return cieloData.tokens;
        }
        return wallet.token_metrics;
    };
    const getRiskColor = (rating: string | undefined) => {
        switch(rating) {
            case 'Low':
                return 'text-green-500';
            case 'Medium':
                return 'text-yellow-500';
            case 'High':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all shadow-lg overflow-hidden hover:shadow-xl"
        >
            <div className="p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-blue-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">
                                {wallet.address.substring(0, 8)}...{wallet.address.substring(36)}
                            </h3>
                            {((cieloData?.winrate || wallet.winrate) >= 70 && (cieloData?.total_roi_percentage || wallet.roi_percentage) >= 50) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    <Award size={12} />
                                    <span>Top Performer</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={`text-2xl font-bold ${getPerformanceColor(wallet.roi_percentage, [20, 50])}`}>
                                {wallet.roi_percentage.toFixed(1)}% ROI
                            </p>
                            <a
                                href={`https://solscan.io/account/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                View on Explorer ↗
                            </a>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all hover:scale-105"
                            title="Refresh data"
                        >
                            <RefreshCw 
                                className={`text-blue-400 ${refreshing ? 'animate-spin' : ''}`} 
                                size={20} 
                            />
                        </button>
                        <Link href={`/wallet/${wallet.address}`}>
                            <button 
                                className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all hover:scale-105"
                                title="View Details"
                            >
                                <Eye className="text-blue-400" size={20} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Activity size={16} />
                            <span className="text-sm">Win Rate</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            {(wallet.winrate).toFixed(1)}%
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                            getBadgeColor(wallet.winrate, [50, 70])
                        }`}>
                            {wallet.winrate >= 70 ? 'Excellent' : 
                             wallet.winrate >= 50 ? 'Good' : 'Poor'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <BarChart size={16} />
                            <span className="text-sm">Total Volume</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            {formatCurrency(wallet.total_volume)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                            getBadgeColor(wallet.total_volume / 10000, [50, 100])
                        }`}>
                            {wallet.total_volume >= 1000000 ? 'High' : wallet.total_volume >= 100000 ? 'Medium' : 'Low'}
                        </span>
                    </div>
                </div>

                {/* Risk Metrics */}
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Risk Level</span>
                        <span className={getRiskColor(wallet.risk_metrics?.risk_rating)}>
                            {wallet.risk_metrics?.risk_rating || 'Analyzing...'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className={`font-medium ${
                            (wallet.risk_metrics?.max_drawdown || 0) <= 20 ? 'text-green-400' : 
                            (wallet.risk_metrics?.max_drawdown || 0) <= 40 ? 'text-yellow-400' : 
                            'text-red-400'
                        }`}>
                            {wallet.risk_metrics?.max_drawdown?.toFixed(2) || '0.00'}%
                        </span>
                    </div>

                    {wallet.last_trade_time && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-400">Last Trade</span>
                            <span className="text-white">
                                {formatTimeAgo(wallet.last_trade_time)}
                            </span>
                        </div>
                    )}
                    
                    {wallet.avg_trade_size && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-400">Avg Trade Size</span>
                            <span className="text-white">
                                ${wallet.avg_trade_size.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-3 gap-2 bg-gray-700/30 rounded-lg p-3">
                    <div className="text-center">
                        <div className="text-xs text-gray-400">ROI Score</div>
                        <div className={`text-${wallet.roi_score >= 75 ? 'green' : wallet.roi_score >= 50 ? 'yellow' : 'red'}-400`}>
                            {wallet.roi_score?.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">Consistency</div>
                        <div className={`text-${wallet.consistency_score >= 75 ? 'green' : wallet.consistency_score >= 50 ? 'yellow' : 'red'}-400`}>
                            {wallet.consistency_score?.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">Volume Score</div>
                        <div className={`text-${wallet.volume_score >= 75 ? 'green' : wallet.volume_score >= 50 ? 'yellow' : 'red'}-400`}>
                            {wallet.volume_score?.toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-700 space-y-4"
                    >
                        {/* Token Performance */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <BarChart size={16} className="text-blue-400" />
                                Token Performance
                            </h4>
                            <div className="space-y-2">
                                {(cieloData?.tokens || wallet.token_metrics || [])
                                    .sort((a: TokenMetric | CieloToken, b: TokenMetric | CieloToken) => {
                                        const aPnl = 'total_pnl_usd' in a ? a.total_pnl_usd : 0;
                                        const bPnl = 'total_pnl_usd' in b ? b.total_pnl_usd : 0;
                                        return bPnl - aPnl;
                                    })
                                    .slice(0, 5)
                                    .map((token: TokenMetric | CieloToken, index: number) => (
                                        <div 
                                            key={index}
                                            className="flex justify-between items-center bg-gray-700/30 rounded-lg p-3"
                                        >
                                            <div>
                                                <span className="text-white font-medium">
                                                    {'token_symbol' in token ? token.token_symbol : token.symbol}
                                                </span>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {token.num_swaps} trades
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`${token.total_pnl_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    ${token.total_pnl_usd.toLocaleString()}
                                                </div>
                                                <div className={`text-xs ${token.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {token.roi_percentage.toFixed(1)}% ROI
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Trade Analysis */}
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Activity size={16} className="text-blue-400" />
                                Trade Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400">Avg Buy Size</span>
                                    <p className="text-base text-white">
                                        ${((cieloData?.tokens || []).reduce((acc: number, t: CieloToken) => acc + t.total_buy_usd, 0) / 
                                          (cieloData?.tokens || []).length || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Avg Sell Size</span>
                                    <p className="text-base text-white">
                                        ${((cieloData?.tokens || []).reduce((acc, t) => acc + t.total_sell_usd, 0) / 
                                          (cieloData?.tokens || []).length || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Win Rate</span>
                                    <p className="text-base text-white">
                                        {cieloData?.winrate.toFixed(1) || wallet.winrate.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Total Tokens</span>
                                    <p className="text-base text-white">
                                        {cieloData?.total_tokens_traded || wallet.token_metrics?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Risk Metrics */}
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Shield size={16} className="text-blue-400" />
                                Risk Profile
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400">Risk Rating</span>
                                    <p className={`text-base ${getRiskColor(wallet.risk_metrics?.risk_rating)}`}>
                                        {wallet.risk_metrics?.risk_rating || 'Medium'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Max Drawdown</span>
                                    <p className={`text-base ${
                                        (wallet.risk_metrics?.max_drawdown || 0) <= 20 ? 'text-green-400' : 
                                        (wallet.risk_metrics?.max_drawdown || 0) <= 40 ? 'text-yellow-400' : 
                                        'text-red-400'
                                    }`}>
                                        {wallet.risk_metrics?.max_drawdown?.toFixed(2) || '0'}%
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Sharpe Ratio</span>
                                    <p className="text-base text-white">
                                        {wallet.risk_metrics?.sharpe_ratio?.toFixed(2) || '0'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Volatility</span>
                                    <p className="text-base text-white">
                                        {wallet.risk_metrics?.volatility?.toFixed(2) || '0'}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Performance Scores */}
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Target size={16} className="text-blue-400" />
                                Performance Scores
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400">ROI Score</span>
                                    <p className={`text-base ${wallet.roi_score >= 75 ? 'text-green-400' : 
                                        wallet.roi_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {wallet.roi_score?.toFixed(1) || '0'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Consistency</span>
                                    <p className={`text-base ${wallet.consistency_score >= 75 ? 'text-green-400' : 
                                        wallet.consistency_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {wallet.consistency_score?.toFixed(1) || '0'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">Volume Score</span>
                                    <p className={`text-base ${wallet.volume_score >= 75 ? 'text-green-400' : 
                                        wallet.volume_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {wallet.volume_score?.toFixed(1) || '0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex gap-2">
                            <a
                                href={`https://solscan.io/account/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                <ExternalLink size={16} />
                                View on Explorer
                            </a>
                            {cieloData?.tokens[0]?.chart_link && (
                                <a
                                    href={cieloData.tokens[0].chart_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    <BarChart2 size={16} />
                                    View Chart
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-400 text-sm flex items-center justify-center gap-1"
            >
                {isExpanded ? 'Show Less' : 'Show More'}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>
        </motion.div>
    );
}
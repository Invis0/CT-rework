import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search as SearchIcon, AlertCircle, DollarSign,
    Activity, TrendingUp, BarChart2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { WalletData, WalletAnalytics, TokenMetric } from '../components/WalletCard';

interface CieloResponse {
    total_volume_24h?: number;
    total_pnl_24h?: number;
    tokens: TokenMetric[];
    success: boolean;
    data: {
        total_volume_24h: number;
        total_pnl_24h: number;
        tokens: TokenMetric[];
        winrate: number;
        total_tokens_traded: number;
        total_roi_percentage: number;
        total_volume: number;
        total_pnl_usd: number;
        analytics?: WalletAnalytics;
    };
}

export default function SearchWallet() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [cieloData, setCieloData] = useState<CieloResponse | null>(null);

    const searchWallet = async () => {
        if (!address) {
            setError('Please enter a wallet address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const dbResponse = await fetch(`https://api-production-0673.up.railway.app/wallets/${address}`);
            
            if (!dbResponse.ok) {
                const cieloResponse = await fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${address}`);
                
                if (!cieloResponse.ok) {
                    throw new Error('Wallet not found in any data source');
                }

                const cieloData = await cieloResponse.json();
                
                if (!cieloData.success) {
                    throw new Error('Failed to fetch wallet data from Cielo');
                }

                const transformedData: WalletData = {
                    address: address,
                    total_pnl_usd: cieloData.data.total_pnl_usd || 0,
                    winrate: cieloData.data.winrate || 0,
                    total_trades: cieloData.data.total_tokens_traded || 0,
                    roi_percentage: cieloData.data.total_roi_percentage || 0,
                    avg_trade_size: cieloData.data.avg_trade_size || 0,
                    total_volume: cieloData.data.total_volume || 0,
                    last_updated: new Date().toISOString(),
                    consistency_score: 0,
                    roi_score: 0,
                    volume_score: 0,
                    risk_score: 0,
                    max_drawdown: 0,
                    last_trade_time: new Date().toISOString(),
                    token_metrics: cieloData.data.tokens?.map((token: any) => ({
                        symbol: token.token_symbol,
                        token_address: token.token_address,
                        num_swaps: token.num_swaps,
                        total_buy_usd: token.total_buy_usd,
                        total_sell_usd: token.total_sell_usd,
                        total_pnl_usd: token.total_pnl_usd,
                        roi_percentage: token.roi_percentage,
                        avg_position_size: token.average_buy_price * token.total_buy_amount,
                        last_trade_time: new Date(token.last_trade * 1000).toISOString()
                    })) || [],
                    risk_metrics: {
                        max_drawdown: cieloData.data.analytics?.risk_metrics?.max_drawdown || 0,
                        sharpe_ratio: cieloData.data.analytics?.risk_metrics?.sharpe_ratio || 0,
                        sortino_ratio: 0,
                        risk_rating: cieloData.data.analytics?.risk_metrics?.risk_rating || 'Medium',
                        volatility: cieloData.data.analytics?.risk_metrics?.volatility || 0
                    },
                    total_score: 0,
                    analytics: cieloData.data.analytics
                };

                setWalletData(transformedData);
                setCieloData(cieloData.data);
                return;
            }

            const dbData = await dbResponse.json();
            const cieloResponse = await fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${address}`);
            let cieloResult = null;

            if (cieloResponse.ok) {
                const cieloData = await cieloResponse.json();
                if (cieloData.success) {
                    cieloResult = cieloData.data;
                    setCieloData(cieloData.data);
                }
            }

            setWalletData({
                ...dbData,
                ...(cieloResult && {
                    total_volume_24h: cieloResult.total_volume_24h,
                    total_pnl_24h: cieloResult.total_pnl_24h,
                    analytics: cieloResult.analytics
                })
            });
            
        } catch (error) {
            console.error('Search error:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Search Wallet</h1>

                    {/* Search Input */}
                    <div className="flex gap-4 mb-8">
                        <input
                            type="text"
                            placeholder="Enter wallet address..."
                            value={address}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={searchWallet}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            <SearchIcon size={20} />
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {walletData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Overview Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total PNL"
                                    value={`$${walletData.total_pnl_usd?.toLocaleString() ?? '0'}`}
                                    trend={walletData.total_pnl_usd > 0}
                                    icon={<DollarSign className="text-green-400" />}
                                />
                                <StatCard
                                    title="Win Rate"
                                    value={`${walletData.winrate?.toFixed(1) ?? '0'}%`}
                                    trend={walletData.winrate > 50}
                                    icon={<Activity className="text-blue-400" />}
                                    subtitle={`${walletData.total_trades} trades`}
                                />
                                <StatCard
                                    title="ROI"
                                    value={`${walletData.roi_percentage?.toFixed(2) ?? '0'}%`}
                                    trend={walletData.roi_percentage > 0}
                                    icon={<TrendingUp className="text-yellow-400" />}
                                />
                                <StatCard
                                    title="Total Volume"
                                    value={`$${walletData.total_volume?.toLocaleString() ?? '0'}`}
                                    icon={<BarChart2 className="text-purple-400" />}
                                />
                            </div>

                            {/* Risk Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Risk Profile</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-400">Risk Rating</span>
                                            <p className={`text-lg font-semibold ${getRiskColor(walletData.analytics?.risk_metrics?.risk_rating)}`}>
                                                {walletData.analytics?.risk_metrics?.risk_rating || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Max Drawdown</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.analytics?.risk_metrics?.max_drawdown?.toFixed(2) || '0'}%
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Sharpe Ratio</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.analytics?.risk_metrics?.sharpe_ratio?.toFixed(2) || '0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Performance Scores</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-400">ROI Score</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.roi_score?.toFixed(1) || '0'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Consistency</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.consistency_score?.toFixed(1) || '0'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Volume Score</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.volume_score?.toFixed(1) || '0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Trading Stats</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-gray-400">Avg Trade Size</span>
                                            <p className="text-lg font-semibold text-white">
                                                ${walletData.avg_trade_size?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Last Trade</span>
                                            <p className="text-lg font-semibold text-white">
                                                {formatTimeAgo(walletData.last_updated)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Total Tokens</span>
                                            <p className="text-lg font-semibold text-white">
                                                {walletData.token_metrics?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Card */}
                            <WalletCard 
                                wallet={walletData}
                                onRefresh={async () => {
                                    try {
                                        const response = await fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${address}`);
                                        if (!response.ok) throw new Error('Failed to refresh data');
                                        const result = await response.json();
                                        if (result.success && walletData) {
                                            setCieloData(result.data);
                                            setWalletData(prev => {
                                                if (!prev) return prev;
                                                return {
                                                    ...prev,
                                                    total_volume_24h: result.data.total_volume_24h,
                                                    total_pnl_24h: result.data.total_pnl_24h,
                                                    analytics: result.data.analytics
                                                } as WalletData;
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Error refreshing wallet:', error);
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    trend?: boolean;
    icon?: ReactNode;
    subtitle?: string;
}

function StatCard({ title, value, trend, icon, subtitle }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            {typeof trend !== 'undefined' && (
                <p className={`text-sm mt-2 ${trend ? 'text-green-400' : 'text-red-400'}`}>
                    {trend ? '↑' : '↓'} {trend ? 'Positive' : 'Negative'}
                </p>
            )}
            {icon && (
                <div className="mt-4">
                    {icon}
                </div>
            )}
            {subtitle && (
                <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
            )}
        </div>
    );
}

function getRiskColor(riskRating?: 'Low' | 'Medium' | 'High' | undefined): string {
    switch (riskRating) {
        case 'Low':
            return 'text-green-400';
        case 'Medium':
            return 'text-yellow-400';
        case 'High':
            return 'text-red-400';
        default:
            return 'text-gray-400';
    }
}

function formatTimeAgo(time: string) {
    const now = new Date();
    const then = new Date(time);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) {
        return `${diff} seconds ago`;
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)} hours ago`;
    } else {
        return `${Math.floor(diff / 86400)} days ago`;
    }
}
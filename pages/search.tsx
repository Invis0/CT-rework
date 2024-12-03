import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

interface CieloResponse {
    total_volume_24h?: number;
    total_pnl_24h?: number;
    tokens: CieloToken[];
    success: boolean;
    data: {
        total_volume_24h: number;
        total_pnl_24h: number;
        tokens: CieloToken[];
        winrate: number;
        total_tokens_traded: number;
        total_roi_percentage: number;
        total_volume: number;
        total_pnl_usd: number;
    };
}

interface WalletResponse {
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

export default function SearchWallet() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletData, setWalletData] = useState<WalletResponse | null>(null);
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

                const transformedData: WalletResponse = {
                    address: address,
                    total_pnl_usd: cieloData.data.total_pnl_usd || 0,
                    winrate: cieloData.data.winrate || 0,
                    total_trades: cieloData.data.total_tokens_traded || 0,
                    roi_percentage: cieloData.data.total_roi_percentage || 0,
                    avg_trade_size: cieloData.data.avg_trade_size || 0,
                    total_volume: cieloData.data.total_volume || 0,
                    last_updated: new Date().toISOString(),
                    consistency_score: 0,
                    token_metrics: cieloData.data.tokens?.map((token: CieloToken) => ({
                        symbol: token.token_symbol,
                        token_address: '',
                        num_swaps: token.num_swaps,
                        total_buy_usd: token.total_buy_usd,
                        total_sell_usd: token.total_sell_usd,
                        total_pnl_usd: token.total_pnl_usd,
                        roi_percentage: token.roi_percentage,
                        avg_position_size: 0,
                        last_trade_time: new Date().toISOString()
                    })) || [],
                    risk_metrics: {
                        max_drawdown: 0,
                        sharpe_ratio: 0,
                        sortino_ratio: 0,
                        risk_rating: 'Medium',
                        volatility: 0
                    },
                    total_score: 0,
                    roi_score: 0,
                    volume_score: 0,
                    risk_score: 0,
                    max_drawdown: 0,
                    last_trade_time: new Date().toISOString(),
                    total_volume_24h: cieloData.data.total_volume_24h,
                    total_pnl_24h: cieloData.data.total_pnl_24h,
                    additional_metrics: cieloData.data.tokens
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
                    additional_metrics: cieloResult.tokens
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
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
                                    value={`$${walletData?.total_pnl_usd?.toLocaleString() ?? '0'}`}
                                    trend={walletData?.total_pnl_usd ? walletData.total_pnl_usd > 0 : undefined}
                                />
                                <StatCard
                                    title="Win Rate"
                                    value={`${walletData?.winrate?.toFixed(1) ?? '0'}%`}
                                    trend={walletData?.winrate ? walletData.winrate > 50 : undefined}
                                />
                                <StatCard
                                    title="Total Trades"
                                    value={walletData?.total_trades?.toString() ?? '0'}
                                />
                                <StatCard
                                    title="ROI"
                                    value={`${walletData?.roi_percentage?.toFixed(2) ?? '0'}%`}
                                    trend={walletData?.roi_percentage ? walletData.roi_percentage > 0 : undefined}
                                />
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
                                                    additional_metrics: result.data.tokens
                                                } as WalletResponse;
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
}

function StatCard({ title, value, trend }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            {typeof trend !== 'undefined' && (
                <p className={`text-sm mt-2 ${trend ? 'text-green-400' : 'text-red-400'}`}>
                    {trend ? '↑' : '↓'} {trend ? 'Positive' : 'Negative'}
                </p>
            )}
        </div>
    );
}
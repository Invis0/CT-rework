import { useState } from 'react';
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

        setLoading(true);
        setError(null);
        
        try {
            const [dbResponse, cieloResponse] = await Promise.all([
                fetch(`https://api-production-0673.up.railway.app/wallets/${address}`),
                fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${address}`)
            ]);

            if (!dbResponse.ok) {
                throw new Error(`Failed to fetch wallet data: ${dbResponse.statusText}`);
            }

            const dbData: WalletResponse = await dbResponse.json();
            let cieloResult: CieloResponse | null = null;

            if (cieloResponse.ok) {
                const cieloData = await cieloResponse.json();
                if (cieloData.success) {
                    cieloResult = cieloData.data;
                    setCieloData(cieloData.data);
                }
            }

            // Combine data with type safety
            const combinedData: WalletResponse = {
                ...dbData,
                ...(cieloResult && {
                    total_volume_24h: cieloResult.total_volume_24h,
                    total_pnl_24h: cieloResult.total_pnl_24h,
                    additional_metrics: cieloResult.tokens
                })
            };

            setWalletData(combinedData);
            
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
            console.error('Search error:', error);
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
                                        if (result.success) {
                                            setCieloData(result.data);
                                            setWalletData(prev => ({
                                                ...prev,
                                                total_volume_24h: result.data.total_volume_24h,
                                                total_pnl_24h: result.data.total_pnl_24h,
                                                additional_metrics: result.data.tokens
                                            }));
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
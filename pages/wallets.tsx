import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WalletCard from '../components/WalletCard';
import Sidebar from '../components/Sidebar';
import FilterPanel, { FilterCriteria } from '../components/FilterPanel';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Use the same WalletData interface as in other files
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
    token_metrics: TokenMetric[];
    risk_metrics: RiskMetric;
    total_score: number;
    roi_score: number;
    volume_score: number;
    risk_score: number;
    max_drawdown: number;
    last_trade_time: string;
    total_volume_24h?: number;
    total_pnl_24h?: number;
    additional_metrics?: Array<{
        num_swaps: number;
        total_buy_usd: number;
        total_sell_usd: number;
        total_pnl_usd: number;
        roi_percentage: number;
        token_symbol: string;
        token_name: string;
        is_honeypot: boolean;
    }>;
}

// Update the FilterPanel props to match the component
interface FilterPanelProps {
    criteria: FilterCriteria;
    onChange: (criteria: FilterCriteria) => void;
}

export default function WalletsPage() {
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        minRoi: 20,
        minWinRate: 50,
        minTrades: 20
    });

    const fetchWallets = async (isRefresh = false) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api-production-0673.up.railway.app/wallets/top?min_roi=${filters.minRoi}&min_win_rate=${filters.minWinRate}&min_trades=${filters.minTrades}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch wallets');
            }

            const data = await response.json();
            // Transform the data to match WalletData interface if necessary
            const transformedData: WalletData[] = data.map((wallet: any) => ({
                address: wallet.wallet_address || wallet.address,
                total_pnl_usd: wallet.total_pnl_usd,
                winrate: wallet.winrate,
                total_trades: wallet.total_trades,
                roi_percentage: wallet.roi_percentage,
                avg_trade_size: wallet.avg_trade_size,
                total_volume: wallet.total_volume,
                last_updated: wallet.last_updated,
                consistency_score: wallet.consistency_score,
                token_metrics: wallet.token_metrics || [],
                risk_metrics: wallet.risk_metrics || {
                    max_drawdown: 0,
                    sharpe_ratio: 0,
                    sortino_ratio: 0,
                    risk_rating: 'Medium',
                    volatility: 0
                },
                total_score: wallet.total_score || 0,
                roi_score: wallet.roi_score || 0,
                volume_score: wallet.volume_score || 0,
                risk_score: wallet.risk_score || 0,
                max_drawdown: wallet.max_drawdown || 0,
                last_trade_time: wallet.last_trade_time || wallet.last_updated,
                total_volume_24h: wallet.total_volume_24h,
                total_pnl_24h: wallet.total_pnl_24h,
                additional_metrics: wallet.additional_metrics
            }));

            setWallets(transformedData);
        } catch (error) {
            console.error('Error fetching wallets:', error);
            setError('Failed to fetch wallets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, [filters]);

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white">Top Wallets</h1>
                    </div>

                    <FilterPanel 
                        criteria={{
                            minRoi: filters.minRoi,
                            minWinRate: filters.minWinRate,
                            minTrades: filters.minTrades,
                            minVolume: 0,
                            minProfit: 0,
                            riskLevel: null,
                            tokenType: null,
                            timeFrame: '7d'
                        }}
                        onChange={(newCriteria) => setFilters({
                            minRoi: newCriteria.minRoi,
                            minWinRate: newCriteria.minWinRate,
                            minTrades: newCriteria.minTrades
                        })}
                    />

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-2 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : wallets.length > 0 ? (
                            wallets.map((wallet) => (
                                <WalletCard 
                                    key={wallet.address} 
                                    wallet={wallet}
                                    onRefresh={() => {
                                        // Implement individual wallet refresh
                                        fetchWallets(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="col-span-2">
                                <Alert variant="destructive">
                                    <AlertTitle>No wallets found</AlertTitle>
                                    <AlertDescription>
                                        Try adjusting your filter criteria.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
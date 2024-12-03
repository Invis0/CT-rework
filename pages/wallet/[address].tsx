import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { 
    ArrowUpRight, ArrowDownRight, Activity,
    DollarSign, TrendingUp,
    ChevronLeft,
    BarChart2, Shield,
    Wallet, RefreshCw, ExternalLink,
    PieChart, LineChart as LineChartIcon, Award, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Cielo API headers
const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://app.cielo.finance/',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZGRyZXNzIjoiMHhiZWQ2NGExN2Q1ZGZlZjI4YWJhNzI0MTFhZWQzNjE0OGM2MWM1ODRjIiwiaXNzIjoiaHR0cHM6Ly9hcGkudW5pd2hhbGVzLmlvLyIsInN1YiI6InVzZXIiLCJwbGFuIjoiYmFzaWMiLCJiYWxhbmNlIjowLCJpYXQiOjE3MzMxNTE3OTIsImV4cCI6MTczMzE2MjU5Mn0.H6rkOlRc9QVmQdCB3vQJSS-W2oI9h5YT0y-pQ39GbEA',
    'API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3MzMxNTE3OTF9.Z7Js5Iod36N6seb1ExekMmIjqGUlkvlOU_6xOZ5KCig',
    'Origin': 'https://app.cielo.finance',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
};

// Chart colors
const COLORS = ['#10B981', '#F43F5E', '#6366F1', '#F59E0B', '#8B5CF6'];

// Add interfaces directly at the top
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

interface WalletAnalytics {
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

interface WalletData {
    daily_pnl: Array<{
        date: string;
        pnl_usd: number;
    }>;
    token_metrics: TokenMetric[];
    tokens: Array<{
        token_symbol: string;
        total_pnl_usd: number;
        total_buy_usd: number;
        total_sell_usd: number;
        num_swaps: number;
        roi_percentage: number;
        is_honeypot: boolean;
    }>;
    risk_metrics: {
        sharpe_ratio: number;
        max_drawdown: number;
        win_loss_ratio: number;
        risk_rating: 'Low' | 'Medium' | 'High';
    };
    total_pnl_usd: number;
    winrate: number;
    successful_trades: number;
    total_tokens_traded: number;
    total_roi_percentage: number;
    total_volume_24h?: number;
    avg_trade_size?: number;
    total_buy_usd: number;
    total_sell_usd: number;
    analytics?: WalletAnalytics;
}

interface StatCardProps {
    title: string;
    value: string;
    icon?: ReactNode;
    trend?: boolean;
    subtitle?: string;
}

// Add proper type for tokenDistributionData
interface TokenDistribution {
    name: string;
    value: number;
    profit: boolean;
}

const API_URL = 'https://api-production-0673.up.railway.app';

export default function WalletDetails() {
    const router = useRouter();
    const { address } = router.query;
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (address) {
            fetchWalletData();
        }
    }, [address, timeframe]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            setError(null);

            // First try to get data from our database
            const dbResponse = await fetch(`${API_URL}/wallets/${address}`);
            let walletInfo = null;

            if (dbResponse.ok) {
                walletInfo = await dbResponse.json();
            }

            // Get Cielo data
            const cieloResponse = await fetch(`${API_URL}/proxy/cielo/${address}`);
            if (!cieloResponse.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const cieloData = await cieloResponse.json();
            if (!cieloData.success) {
                throw new Error('Failed to fetch Cielo data');
            }

            // Combine data
            setWalletData({
                ...(walletInfo || {}),
                ...cieloData.data,
                address: address as string
            });

        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching wallet data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWalletData();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 px-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!walletData) return null;

    // Prepare chart data
    interface DailyPnL {
        date: string;
        pnl_usd: number;
    }

    const dailyPnLData = walletData.daily_pnl?.map((day: DailyPnL) => ({
        date: new Date(day.date).toLocaleDateString(),
        pnl: day.pnl_usd,
    })) || [];

    const tokenDistributionData = walletData.tokens?.map((token: WalletData['tokens'][0]): TokenDistribution => ({
        name: token.token_symbol,
        value: Math.abs(token.total_pnl_usd),
        profit: token.total_pnl_usd > 0,
    })) || [];

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/wallets" 
                                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Wallet className="text-blue-400" size={24} />
                                    <h1 className="text-2xl font-bold text-white">
                                        Wallet Details
                                    </h1>
                                </div>
                                <p className="text-gray-400 mt-1">
                                    {address as string}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
                                Refresh Data
                            </button>
                            <a
                                href={`https://explorer.solana.com/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                            >
                                <ExternalLink size={20} />
                                Explorer
                            </a>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                            subtitle={`${walletData.successful_trades ?? 0} successful trades`}
                        />
                        <StatCard
                            title="Total Trades"
                            value={walletData.total_tokens_traded?.toString() ?? '0'}
                            icon={<BarChart2 className="text-purple-400" />}
                            subtitle="All-time trades"
                        />
                        <StatCard
                            title="ROI"
                            value={`${walletData.total_roi_percentage?.toFixed(2) ?? '0'}%`}
                            trend={walletData.total_roi_percentage > 0}
                            icon={<TrendingUp className="text-yellow-400" />}
                        />
                    </div>

                    {/* Copy Trading Analysis */}
                    {walletData?.analytics?.is_copyworthy && (
                        <div className="bg-green-900/20 rounded-lg p-6 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="text-green-400" size={24} />
                                <h2 className="text-xl font-semibold text-white">
                                    Recommended for Copy Trading
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    {walletData.analytics.copyworthy_reasons.map((reason: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-300">
                                            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                                            <span>{reason}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Avg Position Size</span>
                                            <span className="text-white">
                                                ${walletData.analytics.avg_buy_size.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Avg Hold Time</span>
                                            <span className="text-white">
                                                {formatHoldTime(walletData.analytics.avg_hold_time_hours)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Win Rate</span>
                                            <span className="text-white">
                                                {walletData.winrate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risk Analysis */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="text-blue-400" size={20} />
                                <h2 className="text-lg font-semibold text-white">
                                    Risk Analysis
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Sharpe Ratio</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        {walletData?.analytics?.risk_metrics.sharpe_ratio.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-400">Risk-adjusted return metric</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Max Drawdown</h3>
                                    <p className={`text-2xl font-semibold ${
                                        (walletData?.analytics?.risk_metrics.max_drawdown || 0) <= 20 
                                            ? 'text-green-400' 
                                            : (walletData?.analytics?.risk_metrics.max_drawdown || 0) <= 40 
                                                ? 'text-yellow-400' 
                                                : 'text-red-400'
                                    }`}>
                                        {walletData?.analytics?.risk_metrics.max_drawdown.toFixed(2)}%
                                    </p>
                                    <p className="text-sm text-gray-400">Largest peak-to-trough decline</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Volatility</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        {walletData?.analytics?.risk_metrics.volatility.toFixed(2)}%
                                    </p>
                                    <p className="text-sm text-gray-400">Price movement variation</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Risk Rating</h3>
                                    <p className={`text-2xl font-semibold ${
                                        getRiskColor(walletData?.analytics?.risk_metrics.risk_rating)
                                    }`}>
                                        {walletData?.analytics?.risk_metrics.risk_rating || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-400">Overall risk assessment</p>
                                </div>
                            </div>
                        </div>

                        {/* Trading Behavior */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="text-blue-400" size={20} />
                                <h2 className="text-lg font-semibold text-white">
                                    Trading Behavior
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Avg Hold Time</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        {formatHoldTime(walletData?.analytics?.avg_hold_time_hours || 0)}
                                    </p>
                                    <p className="text-sm text-gray-400">Average position duration</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Avg Swaps/Token</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        {walletData?.analytics?.avg_swaps_per_token.toFixed(1)}
                                    </p>
                                    <p className="text-sm text-gray-400">Trading frequency per token</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Position Size</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        ${walletData?.analytics?.avg_buy_size.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-400">Average trade amount</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-400 mb-1">Success Rate</h3>
                                    <p className="text-2xl font-semibold text-white">
                                        {walletData?.winrate.toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-400">Profitable trades ratio</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Token Performance */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart className="text-blue-400" size={20} />
                                <h2 className="text-lg font-semibold text-white">
                                    Token Performance
                                </h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {walletData?.token_metrics.map((token: TokenMetric, index: number) => (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center bg-gray-700/30 rounded-lg p-4"
                                >
                                    <div>
                                        <span className="text-white font-medium">
                                            {token.symbol}
                                        </span>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {token.num_swaps} trades
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Hold time: {formatHoldTime(getHoldTime(token.last_trade_time))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`${token.total_pnl_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${token.total_pnl_usd.toLocaleString()}
                                        </div>
                                        <div className={`text-sm ${token.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {token.roi_percentage.toFixed(1)}% ROI
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <a
                                                href={`https://photon-sol.tinyastro.io/en/lp/${token.token_address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                                            >
                                                View on Photon <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{title}</div>
                {icon}
            </div>
            <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{value}</p>
                {typeof trend !== 'undefined' && (
                    <div className={`flex items-center ${trend ? 'text-green-400' : 'text-red-400'}`}>
                        {trend ? (
                            <ArrowUpRight size={20} />
                        ) : (
                            <ArrowDownRight size={20} />
                        )}
                    </div>
                )}
            </div>
            {subtitle && (
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
    );
}

// Helper functions
function formatHoldTime(hours: number): string {
    if (hours >= 24) {
        return `${(hours / 24).toFixed(1)}d`;
    }
    if (hours >= 1) {
        return `${hours.toFixed(1)}h`;
    }
    return `${(hours * 60).toFixed(0)}m`;
}

function getHoldTime(lastTradeTime: string): number {
    const now = new Date();
    const lastTrade = new Date(lastTradeTime);
    return (now.getTime() - lastTrade.getTime()) / (1000 * 60 * 60); // Convert to hours
}

function getRiskColor(rating?: 'Low' | 'Medium' | 'High'): string {
    switch (rating) {
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
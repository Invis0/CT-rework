// pages/index.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Wallet, TrendingUp, Award, 
    AlertTriangle, Search, Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletList from '../components/WalletList';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Analytics } from "@vercel/analytics/react";

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedMetrics, setSelectedMetrics] = useState({
        minRoi: 20,
        minWinRate: 50,
        minTrades: 20
    });
    const [initialWallets, setInitialWallets] = useState([]);

    useEffect(() => {
        fetchData();
    }, [selectedMetrics]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [walletsResponse, statsResponse] = await Promise.all([
                fetch(`https://api-production-0673.up.railway.app/wallets/top?` +
                      `min_roi=${selectedMetrics.minRoi}&` +
                      `min_win_rate=${selectedMetrics.minWinRate}&` +
                      `min_trades=${selectedMetrics.minTrades}&` +
                      `page=1&limit=50`),
                fetch(`https://api-production-0673.up.railway.app/stats/overview`)
            ]);

            if (!walletsResponse.ok || !statsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const [walletsData, statsData] = await Promise.all([
                walletsResponse.json(),
                statsResponse.json()
            ]);

            setInitialWallets(walletsData || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center"
                    >
                        <h1 className="text-3xl font-bold text-white">
                            Copy Trading Dashboard
                        </h1>
                        
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search wallets..."
                                    className="w-64 px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Overview */}
                    {stats && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <StatsCard
                                title="Total Wallets"
                                value={stats.total_wallets.toLocaleString()}
                                icon={<Wallet className="text-blue-500" />}
                                change={stats.trends?.[0]?.wallet_count_change || 0}
                            />
                            <StatsCard
                                title="Average ROI"
                                value={`${stats.average_roi.toFixed(2)}%`}
                                icon={<TrendingUp className="text-green-500" />}
                                change={stats.trends?.[0]?.roi_change || 0}
                            />
                            <StatsCard
                                title="Top Performers"
                                value={stats.top_performers.toLocaleString()}
                                icon={<Award className="text-yellow-500" />}
                                change={stats.trends?.[0]?.top_performers_change || 0}
                            />
                            <StatsCard
                                title="Avg Win Rate"
                                value={`${stats.average_winrate.toFixed(1)}%`}
                                icon={<AlertTriangle className="text-purple-500" />}
                                change={stats.trends?.[0]?.winrate_change || 0}
                            />
                        </motion.div>
                    )}

                    {/* Filter Controls */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Filter Criteria</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-gray-300">Minimum ROI %</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minRoi}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minRoi: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300">Minimum Win Rate %</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minWinRate}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minWinRate: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300">Minimum Trades</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minTrades}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minTrades: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Wallet List with Infinite Scroll */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-blue-400" size={40} />
                        </div>
                    ) : (
                        <WalletList 
                            initialWallets={initialWallets} 
                            filterCriteria={selectedMetrics}
                        />
                    )}
                </div>
            </main>
            <Analytics />
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change: number;
}

const StatsCard = ({ title, value, icon, change }: StatsCardProps) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 bg-gray-800 rounded-lg"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}% from last week
                </p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
                {icon}
            </div>
        </div>
    </motion.div>
);
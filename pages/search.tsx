import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SearchWallet() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletData, setWalletData] = useState<any>(null);
    const [cieloData, setCieloData] = useState<any>(null);

    const searchWallet = async () => {
        if (!address) {
            setError('Please enter a wallet address');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Fetch data from both APIs in parallel
            const [dbResponse, cieloResponse] = await Promise.all([
                fetch(`https://api-production-0673.up.railway.app/wallets/${address}`),
                fetch(`https://api-production-0673.up.railway.app/proxy/cielo/${address}`)
            ]);

            if (!dbResponse.ok) throw new Error('Failed to fetch wallet data');
            const dbData = await dbResponse.json();

            let cieloResult;
            if (cieloResponse.ok) {
                const cieloData = await cieloResponse.json();
                if (cieloData.success) {
                    cieloResult = cieloData.data;
                    setCieloData(cieloData.data);
                }
            }

            // Combine data from both sources
            const combinedData = {
                ...dbData,
                ...(cieloResult && {
                    total_volume_24h: cieloResult.total_volume_24h,
                    total_pnl_24h: cieloResult.total_pnl_24h,
                    additional_metrics: cieloResult.tokens
                })
            };

            setWalletData(combinedData);
            
        } catch (error: any) {
            setError(error.message);
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
                            onChange={(e) => setAddress(e.target.value)}
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
                            animate={{ opacity:
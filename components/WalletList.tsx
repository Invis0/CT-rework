import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import WalletCard from './WalletCard';
import { Loader2 } from 'lucide-react';

interface WalletListProps {
    initialWallets: any[];
    filterCriteria: {
        minRoi: number;
        minWinRate: number;
        minTrades: number;
    };
}

export default function WalletList({ initialWallets, filterCriteria }: WalletListProps) {
    const [wallets, setWallets] = useState(initialWallets);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();

    const loadMoreWallets = async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        try {
            const response = await fetch(
                `https://api-production-0673.up.railway.app/wallets/top?` +
                `min_roi=${filterCriteria.minRoi}&` +
                `min_win_rate=${filterCriteria.minWinRate}&` +
                `min_trades=${filterCriteria.minTrades}&` +
                `page=${page + 1}&limit=50`
            );
            
            const newWallets = await response.json();
            
            if (newWallets.length < 50) {
                setHasMore(false);
            }
            
            setWallets(prev => [...prev, ...newWallets]);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading more wallets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (inView) {
            loadMoreWallets();
        }
    }, [inView]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet, index) => (
                    <WalletCard key={wallet.address + index} wallet={wallet} />
                ))}
            </div>
            
            {/* Loading indicator */}
            <div ref={ref} className="flex justify-center py-8">
                {loading && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="animate-spin" />
                        <span>Loading more wallets...</span>
                    </div>
                )}
                {!hasMore && wallets.length > 0 && (
                    <p className="text-gray-400">No more wallets to load</p>
                )}
            </div>
        </div>
    );
} 
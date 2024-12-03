import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Activity, DollarSign, 
    BarChart2, Eye, RefreshCw,
    ExternalLink, ChevronDown, Wallet,
    Award, Shield, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import type { WalletProps } from '../types/global';

export default function WalletCard({ wallet, onRefresh, className }: WalletProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ... rest of your component code
}
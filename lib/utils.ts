import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(time: string): string {
    const now = new Date();
    const then = new Date(time);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export function getRiskColor(rating?: 'Low' | 'Medium' | 'High'): string {
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

export function formatHoldTime(hours: number): string {
    if (hours >= 24) {
        return `${(hours / 24).toFixed(1)}d`;
    }
    if (hours >= 1) {
        return `${hours.toFixed(1)}h`;
    }
    return `${(hours * 60).toFixed(0)}m`;
}
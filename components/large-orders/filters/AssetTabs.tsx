'use client';

import { motion } from 'framer-motion';
import type { CoinFilter } from '@/types/large-orders';

interface AssetTabsProps {
  selectedAsset: CoinFilter;
  onAssetChange: (asset: CoinFilter) => void;
  orderCounts?: Record<string, number>;
}

const ASSETS: { value: CoinFilter; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All Assets', icon: '🌐' },
  { value: 'BTC', label: 'Bitcoin', icon: '₿' },
  { value: 'ETH', label: 'Ethereum', icon: 'Ξ' },
  { value: 'HYPE', label: 'Hyperliquid', icon: '🔥' },
];

export function AssetTabs({ selectedAsset, onAssetChange, orderCounts }: AssetTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ASSETS.map((asset) => {
        const isActive = selectedAsset === asset.value;
        const count = orderCounts?.[asset.value] || 0;

        return (
          <motion.button
            key={asset.value}
            onClick={() => onAssetChange(asset.value)}
            className={`
              relative px-4 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-200
              backdrop-blur-xl border
              ${isActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-gray-900/30 border-white/10 text-gray-400 hover:bg-gray-900/40 hover:border-white/20'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="active-asset-tab"
                className="absolute inset-0 rounded-xl bg-emerald-500/10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-lg">{asset.icon}</span>
              <span>{asset.label}</span>
              {count > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold
                  ${isActive ? 'bg-emerald-500/30' : 'bg-white/10'}
                `}>
                  {count}
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

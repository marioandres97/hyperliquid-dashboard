'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAssetStore, type Asset } from '@/lib/stores/assetStore';
import { ASSET_COLORS } from '@/lib/theme/colors';

const ASSETS: Asset[] = ['BTC', 'ETH', 'HYPE'];

const ASSET_INFO = {
  BTC: { name: 'Bitcoin' },
  ETH: { name: 'Ethereum' },
  HYPE: { name: 'Hyperliquid' },
};

export const AssetToggle: React.FC = () => {
  const currentAsset = useAssetStore((state) => state.currentAsset);
  const setAsset = useAssetStore((state) => state.setAsset);

  return (
    <div
      className="inline-flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg sm:rounded-xl"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      }}
    >
      {ASSETS.map((asset) => {
        const isActive = currentAsset === asset;
        const colors = ASSET_COLORS[asset];

        return (
          <motion.button
            key={asset}
            onClick={() => setAsset(asset)}
            className="relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all overflow-hidden min-h-[44px]"
            style={{
              background: isActive
                ? colors.bg
                : 'transparent',
              border: isActive
                ? `1px solid ${colors.primary}`
                : '1px solid transparent',
              color: isActive ? colors.primary : '#9CA3AF',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive && (
              <motion.div
                layoutId="active-asset-indicator"
                className="absolute inset-0"
                style={{
                  background: colors.glow,
                  borderRadius: '8px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-financial">
              {asset}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AssetToggle;

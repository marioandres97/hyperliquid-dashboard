'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAssetStore, type Asset } from '@/lib/stores/assetStore';
import { ASSET_COLORS } from '@/lib/theme/colors';

const ASSETS: Asset[] = ['BTC', 'ETH', 'HYPE'];

const ASSET_INFO = {
  BTC: { name: 'Bitcoin', symbol: '₿' },
  ETH: { name: 'Ethereum', symbol: 'Ξ' },
  HYPE: { name: 'Hyperliquid', symbol: 'H' },
};

export const AssetToggle: React.FC = () => {
  const currentAsset = useAssetStore((state) => state.currentAsset);
  const setAsset = useAssetStore((state) => state.setAsset);

  return (
    <div
      className="inline-flex items-center gap-2 p-1.5 rounded-xl"
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
            className="relative px-4 py-2 rounded-lg font-semibold text-sm transition-all overflow-hidden"
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
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="text-lg">{ASSET_INFO[asset].symbol}</span>
              <span>{asset}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AssetToggle;

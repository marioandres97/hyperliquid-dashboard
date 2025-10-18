'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Asset = 'BTC' | 'ETH' | 'HYPE';

interface AssetState {
  currentAsset: Asset;
  setAsset: (asset: Asset) => void;
  prefetchedAssets: Set<Asset>;
  markAsPrefetched: (asset: Asset) => void;
  isPrefetched: (asset: Asset) => boolean;
}

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      currentAsset: 'BTC',
      prefetchedAssets: new Set<Asset>(['BTC']), // BTC is default, so it's prefetched
      
      setAsset: (asset: Asset) => {
        set({ currentAsset: asset });
      },
      
      markAsPrefetched: (asset: Asset) => {
        set((state) => {
          const newPrefetched = new Set(state.prefetchedAssets);
          newPrefetched.add(asset);
          return { prefetchedAssets: newPrefetched };
        });
      },
      
      isPrefetched: (asset: Asset) => {
        return get().prefetchedAssets.has(asset);
      },
    }),
    {
      name: 'asset-storage',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Set
      partialize: (state) => ({
        currentAsset: state.currentAsset,
        prefetchedAssets: Array.from(state.prefetchedAssets),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).prefetchedAssets)) {
          state.prefetchedAssets = new Set((state as any).prefetchedAssets);
        }
      },
    }
  )
);

// Price formatting utilities
export const formatPrice = (price: number, asset: Asset): string => {
  switch (asset) {
    case 'BTC':
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'ETH':
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'HYPE':
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  }
};

export const formatVolume = (volume: number, asset: Asset): string => {
  return `${volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${asset}`;
};

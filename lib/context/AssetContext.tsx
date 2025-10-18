'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Asset = 'BTC' | 'ETH' | 'HYPE';

interface AssetContextType {
  currentAsset: Asset;
  setAsset: (asset: Asset) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

interface AssetProviderProps {
  children: ReactNode;
  defaultAsset?: Asset;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ 
  children, 
  defaultAsset = 'BTC' 
}) => {
  const [currentAsset, setCurrentAsset] = useState<Asset>(defaultAsset);

  const setAsset = (asset: Asset) => {
    setCurrentAsset(asset);
  };

  return (
    <AssetContext.Provider value={{ currentAsset, setAsset }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAsset = (): AssetContextType => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
};

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

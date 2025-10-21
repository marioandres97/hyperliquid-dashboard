/**
 * TypeScript types for Whale Trade Tracking System
 */

export type WhaleTradeSide = 'BUY' | 'SELL';

export enum WhaleTradeCategory {
  MEGA_WHALE = 'MEGA_WHALE',
  WHALE = 'WHALE',
  INSTITUTION = 'INSTITUTION',
  LARGE = 'LARGE',
}

export interface WhaleTrade {
  id: string;
  asset: string;
  side: WhaleTradeSide;
  price: number;
  size: number;
  notionalValue: number;
  category: WhaleTradeCategory;
  exchange: string;
  tradeId?: string | null;
  timestamp: Date | string;
  priceImpact?: number | null;
  metadata?: any;
  createdAt: Date | string;
}

export interface CreateWhaleTradeInput {
  asset: string;
  side: WhaleTradeSide;
  price: number;
  size: number;
  notionalValue: number;
  category: WhaleTradeCategory;
  exchange?: string;
  tradeId?: string;
  timestamp?: Date;
  priceImpact?: number;
  metadata?: any;
}

export interface UpdateWhaleTradeInput {
  priceImpact?: number;
  metadata?: any;
}

export interface WhaleTradeFilters {
  asset?: string;
  category?: WhaleTradeCategory;
  side?: WhaleTradeSide;
  minNotionalValue?: number;
  maxNotionalValue?: number;
  startDate?: Date;
  endDate?: Date;
  hours?: number;
  limit?: number;
  skip?: number;
}

export interface WhaleTradeStats {
  totalTrades: number;
  totalVolume: number;
  avgTradeSize: number;
  buyCount: number;
  sellCount: number;
  byCategory: Record<WhaleTradeCategory, number>;
  byAsset: Record<string, number>;
}

export interface WhaleThresholds {
  BTC: number;
  ETH: number;
  SOL: number;
  DEFAULT: number;
}

export interface CategoryThresholds {
  MEGA_WHALE: number;
  WHALE: number;
  INSTITUTION: number;
  LARGE: number;
}

export interface ThresholdInfo {
  assetThresholds: WhaleThresholds;
  categoryThresholds: CategoryThresholds;
  categories: WhaleTradeCategory[];
}

export interface TrackTradeInput {
  asset: string;
  side: WhaleTradeSide;
  price: number;
  size: number;
  timestamp?: Date;
  tradeId?: string;
  priceImpact?: number;
  metadata?: any;
}

export interface TrackTradeResult {
  isWhaleTrade: boolean;
  category?: WhaleTradeCategory;
  notionalValue: number;
  threshold: number;
  stored: boolean;
  tradeId?: string;
}

export interface WhaleTradeTrackerConfig {
  enabled: boolean;
  autoStart: boolean;
  batchSize: number;
  flushInterval: number;
  retentionDays: number;
}

export interface WhaleTradeTrackerStatus {
  enabled: boolean;
  running: boolean;
  trackedCount: number;
  lastTrackTime?: Date | string;
  uptime?: number;
  errors?: number;
}

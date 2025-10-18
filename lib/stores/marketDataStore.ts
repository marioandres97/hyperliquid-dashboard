'use client';

import { create } from 'zustand';

interface MarketData {
  coin: string;
  price: number;
  volume24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface OrderBookData {
  coin: string;
  bids: Array<{ price: number; volume: number }>;
  asks: Array<{ price: number; volume: number }>;
  midPrice: number;
  spread: number;
  timestamp: number;
}

interface TradesData {
  coin: string;
  trades: Array<{
    id: number;
    timestamp: number;
    price: number;
    size: number;
    side: 'BUY' | 'SELL';
  }>;
  stats: {
    buyVolume: number;
    sellVolume: number;
    totalVolume: number;
  };
  timestamp: number;
}

interface MarketDataState {
  marketData: Map<string, MarketData>;
  orderBooks: Map<string, OrderBookData>;
  trades: Map<string, TradesData>;
  
  setMarketData: (coin: string, data: MarketData) => void;
  setOrderBook: (coin: string, data: OrderBookData) => void;
  setTrades: (coin: string, data: TradesData) => void;
  
  getMarketData: (coin: string) => MarketData | undefined;
  getOrderBook: (coin: string) => OrderBookData | undefined;
  getTrades: (coin: string) => TradesData | undefined;
  
  clearStaleData: (maxAge: number) => void;
}

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  marketData: new Map(),
  orderBooks: new Map(),
  trades: new Map(),
  
  setMarketData: (coin: string, data: MarketData) => {
    set((state) => {
      const newMarketData = new Map(state.marketData);
      newMarketData.set(coin, data);
      return { marketData: newMarketData };
    });
  },
  
  setOrderBook: (coin: string, data: OrderBookData) => {
    set((state) => {
      const newOrderBooks = new Map(state.orderBooks);
      newOrderBooks.set(coin, data);
      return { orderBooks: newOrderBooks };
    });
  },
  
  setTrades: (coin: string, data: TradesData) => {
    set((state) => {
      const newTrades = new Map(state.trades);
      newTrades.set(coin, data);
      return { trades: newTrades };
    });
  },
  
  getMarketData: (coin: string) => {
    return get().marketData.get(coin);
  },
  
  getOrderBook: (coin: string) => {
    return get().orderBooks.get(coin);
  },
  
  getTrades: (coin: string) => {
    return get().trades.get(coin);
  },
  
  clearStaleData: (maxAge: number) => {
    const now = Date.now();
    
    set((state) => {
      const newMarketData = new Map(state.marketData);
      const newOrderBooks = new Map(state.orderBooks);
      const newTrades = new Map(state.trades);
      
      // Clear stale market data
      for (const [coin, data] of newMarketData.entries()) {
        if (now - data.timestamp > maxAge) {
          newMarketData.delete(coin);
        }
      }
      
      // Clear stale order books
      for (const [coin, data] of newOrderBooks.entries()) {
        if (now - data.timestamp > maxAge) {
          newOrderBooks.delete(coin);
        }
      }
      
      // Clear stale trades
      for (const [coin, data] of newTrades.entries()) {
        if (now - data.timestamp > maxAge) {
          newTrades.delete(coin);
        }
      }
      
      return {
        marketData: newMarketData,
        orderBooks: newOrderBooks,
        trades: newTrades,
      };
    });
  },
}));

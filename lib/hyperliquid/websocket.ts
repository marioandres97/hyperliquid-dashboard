'use client';

import * as hl from '@nktkas/hyperliquid';

export interface OrderBookLevel {
  px: string; // price as string
  sz: string; // size as string
  n: number;  // number of orders
}

export interface OrderBookSnapshot {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]]; // [bids, asks]
  timestamp: number;
}

export interface Trade {
  coin: string;
  side: 'A' | 'B'; // A = ask (sell), B = bid (buy)
  px: string;
  sz: string;
  time: number;
  tid: number;
}

export interface AllMids {
  [coin: string]: string;
}

export type WebSocketCallback<T> = (data: T) => void;

export class HyperliquidWebSocket {
  private transport: hl.WebSocketTransport;
  private subscriptions: Map<string, WebSocketCallback<any>> = new Map();
  private wsClient: hl.SubscriptionClient | null = null;
  private isConnected = false;

  constructor() {
    this.transport = new hl.WebSocketTransport({
      isTestnet: process.env.HYPERLIQUID_TESTNET === 'true',
    });
  }

  async connect() {
    try {
      this.wsClient = new hl.SubscriptionClient({
        transport: this.transport,
      });
      this.isConnected = true;
      console.log('Hyperliquid WebSocket client initialized');
    } catch (error) {
      console.error('Failed to initialize Hyperliquid WebSocket:', error);
      this.isConnected = false;
    }
  }

  subscribeToOrderBook(coin: string, callback: WebSocketCallback<OrderBookSnapshot>) {
    if (!this.wsClient) {
      console.error('WebSocket not connected. Call connect() first.');
      return;
    }

    const key = `l2Book-${coin}`;
    this.subscriptions.set(key, callback);

    try {
      this.wsClient.l2Book({ coin }, (data: any) => {
        const snapshot: OrderBookSnapshot = {
          coin,
          levels: data.levels,
          timestamp: data.time || Date.now(),
        };
        callback(snapshot);
      });
    } catch (error) {
      console.error(`Error subscribing to order book for ${coin}:`, error);
    }
  }

  subscribeToTrades(coin: string, callback: WebSocketCallback<Trade[]>) {
    if (!this.wsClient) {
      console.error('WebSocket not connected. Call connect() first.');
      return;
    }

    const key = `trades-${coin}`;
    this.subscriptions.set(key, callback);

    try {
      this.wsClient.trades({ coin }, (data: any) => {
        callback(data as Trade[]);
      });
    } catch (error) {
      console.error(`Error subscribing to trades for ${coin}:`, error);
    }
  }

  subscribeToAllMids(callback: WebSocketCallback<AllMids>) {
    if (!this.wsClient) {
      console.error('WebSocket not connected. Call connect() first.');
      return;
    }

    const key = 'allMids';
    this.subscriptions.set(key, callback);

    try {
      this.wsClient.allMids({}, (data: any) => {
        callback(data as AllMids);
      });
    } catch (error) {
      console.error('Error subscribing to allMids:', error);
    }
  }

  unsubscribe(key: string) {
    this.subscriptions.delete(key);
    // Note: The SDK handles unsubscription internally
  }

  disconnect() {
    if (this.wsClient) {
      this.subscriptions.clear();
      this.transport.close();
      this.wsClient = null;
      this.isConnected = false;
      console.log('Hyperliquid WebSocket disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let wsClientInstance: HyperliquidWebSocket | null = null;

export const getWSClient = (): HyperliquidWebSocket => {
  if (!wsClientInstance) {
    wsClientInstance = new HyperliquidWebSocket();
  }
  return wsClientInstance;
};
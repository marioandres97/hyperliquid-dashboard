'use client';

import { WebSocketManager } from '@/lib/hyperliquid/WebSocketManager';
import type { Trade } from '@/lib/hyperliquid/WebSocketManager';
import type { ConnectionState } from '@/types/large-orders';

export class HyperliquidWebSocket {
  private wsManager: WebSocketManager;
  private connectionListeners: Set<(state: ConnectionState) => void> = new Set();
  private subscriptionKeys: Map<string, string> = new Map();
  private lastHealthUpdate: ConnectionState = {
    connected: false,
    quality: 'disconnected',
    lastUpdate: 0,
  };

  constructor() {
    this.wsManager = WebSocketManager.getInstance();
    this.setupHealthMonitoring();
  }

  /**
   * Setup health monitoring for connection status
   */
  private setupHealthMonitoring() {
    this.wsManager.on('health', (health: any) => {
      this.lastHealthUpdate = {
        connected: health.connected,
        quality: health.quality,
        lastUpdate: health.lastUpdate,
      };
      
      this.connectionListeners.forEach(listener => {
        listener(this.lastHealthUpdate);
      });
    });
  }

  /**
   * Subscribe to trades for a specific coin
   */
  async subscribeTrades(coin: string, handler: (trades: Trade[]) => void): Promise<() => void> {
    try {
      // Ensure connection
      if (!this.wsManager.getConnectionStatus()) {
        await this.wsManager.connect();
      }

      const key = await this.wsManager.subscribe('trades', coin, handler);
      this.subscriptionKeys.set(coin, key);

      // Return cleanup function
      return () => {
        this.wsManager.unsubscribe(key);
        this.subscriptionKeys.delete(coin);
      };
    } catch (error) {
      console.error(`Failed to subscribe to trades for ${coin}:`, error);
      return () => {}; // No-op cleanup
    }
  }

  /**
   * Subscribe to multiple coins
   */
  async subscribeMultipleCoins(
    coins: string[],
    handler: (coin: string, trades: Trade[]) => void
  ): Promise<() => void> {
    const unsubscribers: Array<() => void> = [];

    for (const coin of coins) {
      const unsub = await this.subscribeTrades(coin, (trades) => {
        handler(coin, trades);
      });
      unsubscribers.push(unsub);
    }

    // Return cleanup function that unsubscribes all
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Add connection state listener
   */
  onConnectionChange(listener: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(listener);
    
    // Immediately call with current state
    listener(this.lastHealthUpdate);
    
    // Return cleanup function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.lastHealthUpdate;
  }

  /**
   * Reconnect WebSocket
   */
  reconnect(): void {
    // The WebSocketManager doesn't expose reconnect directly, but we can disconnect and connect
    this.wsManager.disconnect();
    this.wsManager.connect();
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.wsManager.disconnect();
  }
}

// Singleton instance
let instance: HyperliquidWebSocket | null = null;

export function getHyperliquidWebSocket(): HyperliquidWebSocket {
  if (!instance) {
    instance = new HyperliquidWebSocket();
  }
  return instance;
}

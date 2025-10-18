'use client';

import * as hl from '@nktkas/hyperliquid';
import EventEmitter from 'events';

export interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

export interface OrderBookSnapshot {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]];
  timestamp: number;
}

export interface Trade {
  coin: string;
  side: 'A' | 'B';
  px: string;
  sz: string;
  time: number;
  tid: number;
}

export interface AllMids {
  [coin: string]: string;
}

type SubscriptionType = 'l2Book' | 'trades' | 'allMids';

interface SubscriptionConfig {
  type: SubscriptionType;
  coin?: string;
  handler: (data: any) => void;
}

export class WebSocketManager extends EventEmitter {
  private static instance: WebSocketManager | null = null;
  private transport: hl.WebSocketTransport;
  private wsClient: hl.SubscriptionClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, SubscriptionConfig> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: number = 0;
  private connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected' = 'disconnected';

  private constructor() {
    super();
    this.setMaxListeners(50); // Allow many subscribers
    this.transport = new hl.WebSocketTransport({
      isTestnet: process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET === 'true',
    });

    // Start health monitoring
    this.startHealthMonitoring();
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastCheck = now - this.lastHealthCheck;

      if (this.isConnected) {
        if (timeSinceLastCheck < 5000) {
          this.connectionQuality = 'excellent';
        } else if (timeSinceLastCheck < 15000) {
          this.connectionQuality = 'good';
        } else if (timeSinceLastCheck < 30000) {
          this.connectionQuality = 'poor';
        } else {
          this.connectionQuality = 'disconnected';
          // Consider reconnecting if no data for 30 seconds
          if (this.isConnected) {
            console.warn('No data received for 30 seconds, reconnecting...');
            this.reconnect();
          }
        }
      } else {
        this.connectionQuality = 'disconnected';
      }

      this.emit('health', {
        connected: this.isConnected,
        quality: this.connectionQuality,
        lastUpdate: this.lastHealthCheck,
      });
    }, 5000); // Check every 5 seconds
  }

  private updateHealthCheck() {
    this.lastHealthCheck = Date.now();
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.wsClient) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.wsClient = new hl.SubscriptionClient({
        transport: this.transport,
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateHealthCheck();

      console.log('WebSocket Manager connected successfully');
      this.emit('connected');

      // Resubscribe to all previous subscriptions
      await this.resubscribeAll();
    } catch (error) {
      console.error('Failed to connect WebSocket Manager:', error);
      this.isConnected = false;
      this.emit('error', error);
      
      // Attempt reconnection with exponential backoff
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30 seconds
    this.reconnectAttempts++;

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  private async reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    console.log('Attempting to reconnect...');
    this.emit('reconnecting', this.reconnectAttempts);

    // Clean up existing connection
    if (this.wsClient) {
      try {
        this.transport.close();
      } catch (error) {
        console.error('Error closing existing connection:', error);
      }
      this.wsClient = null;
      this.isConnected = false;
    }

    // Create new transport and connect
    this.transport = new hl.WebSocketTransport({
      isTestnet: process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET === 'true',
    });

    await this.connect();
  }

  private async resubscribeAll() {
    for (const [key, config] of this.subscriptions.entries()) {
      try {
        await this.subscribe(config.type, config.coin, config.handler);
      } catch (error) {
        console.error(`Failed to resubscribe to ${key}:`, error);
      }
    }
  }

  async subscribe(
    type: SubscriptionType,
    coin: string | undefined,
    handler: (data: any) => void
  ): Promise<string> {
    if (!this.wsClient) {
      await this.connect();
    }

    if (!this.wsClient) {
      throw new Error('Failed to establish WebSocket connection');
    }

    const key = coin ? `${type}-${coin}` : type;

    // Store subscription config for reconnection
    this.subscriptions.set(key, { type, coin, handler });

    try {
      switch (type) {
        case 'l2Book':
          if (!coin) throw new Error('Coin required for l2Book subscription');
          this.wsClient.l2Book({ coin }, (data: any) => {
            this.updateHealthCheck();
            const snapshot: OrderBookSnapshot = {
              coin,
              levels: data.levels,
              timestamp: data.time || Date.now(),
            };
            handler(snapshot);
            this.emit(`l2Book:${coin}`, snapshot);
          });
          break;

        case 'trades':
          if (!coin) throw new Error('Coin required for trades subscription');
          this.wsClient.trades({ coin }, (data: any) => {
            this.updateHealthCheck();
            handler(data);
            this.emit(`trades:${coin}`, data);
          });
          break;

        case 'allMids':
          this.wsClient.allMids({}, (data: any) => {
            this.updateHealthCheck();
            handler(data);
            this.emit('allMids', data);
          });
          break;
      }

      console.log(`Subscribed to ${key}`);
      return key;
    } catch (error) {
      console.error(`Error subscribing to ${key}:`, error);
      this.subscriptions.delete(key);
      throw error;
    }
  }

  unsubscribe(key: string) {
    this.subscriptions.delete(key);
    this.removeAllListeners(key);
    console.log(`Unsubscribed from ${key}`);
  }

  disconnect() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.wsClient) {
      this.subscriptions.clear();
      this.removeAllListeners();
      this.transport.close();
      this.wsClient = null;
      this.isConnected = false;
      console.log('WebSocket Manager disconnected');
      this.emit('disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'disconnected' {
    return this.connectionQuality;
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  getMetrics() {
    return {
      connected: this.isConnected,
      quality: this.connectionQuality,
      reconnectAttempts: this.reconnectAttempts,
      activeSubscriptions: this.subscriptions.size,
      lastHealthCheck: this.lastHealthCheck,
    };
  }
}

// Singleton getter
export const getWebSocketManager = (): WebSocketManager => {
  return WebSocketManager.getInstance();
};

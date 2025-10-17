// Trade collector service for real-time trade data

import { RawTrade, ClassifiedTrade, Coin } from '../types';
import { classifyTrade } from '../utils';

export type TradeCallback = (trade: ClassifiedTrade) => void;

/**
 * Trade collector using WebSocket connection
 */
export class TradeCollector {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, TradeCallback[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private readonly maxReconnectDelay = 30000;
  private reconnectDelay = 1000;

  constructor(private readonly wsUrl: string = 'wss://api.hyperliquid.xyz/ws') {}

  /**
   * Start collecting trades for a coin
   */
  subscribe(coin: Coin, callback: TradeCallback): void {
    const key = `trades:${coin}`;
    const callbacks = this.callbacks.get(key) || [];
    callbacks.push(callback);
    this.callbacks.set(key, callbacks);

    // Connect if not already connected
    if (!this.ws && !this.isConnecting) {
      this.connect();
    } else if (this.ws?.readyState === WebSocket.OPEN) {
      // Already connected, just subscribe
      this.sendSubscription(coin);
    }
  }

  /**
   * Stop collecting trades for a coin
   */
  unsubscribe(coin: Coin, callback?: TradeCallback): void {
    const key = `trades:${coin}`;
    
    if (!callback) {
      // Remove all callbacks for this coin
      this.callbacks.delete(key);
      this.sendUnsubscription(coin);
    } else {
      // Remove specific callback
      const callbacks = this.callbacks.get(key) || [];
      const filtered = callbacks.filter(cb => cb !== callback);
      
      if (filtered.length === 0) {
        this.callbacks.delete(key);
        this.sendUnsubscription(coin);
      } else {
        this.callbacks.set(key, filtered);
      }
    }

    // Disconnect if no more subscriptions
    if (this.callbacks.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Get current connection state
   */
  getState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  /**
   * Establish WebSocket connection
   */
  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('[TradeCollector] WebSocket connected');
        this.isConnecting = false;
        this.reconnectDelay = 1000; // Reset reconnect delay
        
        // Subscribe to all active coins
        this.callbacks.forEach((_, key) => {
          const coin = key.split(':')[1] as Coin;
          this.sendSubscription(coin);
        });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('[TradeCollector] WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[TradeCollector] WebSocket closed');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[TradeCollector] Connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.callbacks.size === 0) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('[TradeCollector] Attempting to reconnect...');
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Send subscription message for a coin
   */
  private sendSubscription(coin: Coin): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      method: 'subscribe',
      subscription: {
        type: 'trades',
        coin,
      },
    };

    this.ws.send(JSON.stringify(message));
    console.log(`[TradeCollector] Subscribed to ${coin} trades`);
  }

  /**
   * Send unsubscription message for a coin
   */
  private sendUnsubscription(coin: Coin): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      method: 'unsubscribe',
      subscription: {
        type: 'trades',
        coin,
      },
    };

    this.ws.send(JSON.stringify(message));
    console.log(`[TradeCollector] Unsubscribed from ${coin} trades`);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle trades channel
      if (message.channel === 'trades' && Array.isArray(message.data)) {
        message.data.forEach((rawTrade: RawTrade) => {
          this.processTrade(rawTrade);
        });
      }
    } catch (error) {
      console.error('[TradeCollector] Message parsing error:', error);
    }
  }

  /**
   * Process and classify a raw trade
   */
  private processTrade(raw: RawTrade): void {
    try {
      const classified = classifyTrade(raw);
      const key = `trades:${classified.coin}`;
      const callbacks = this.callbacks.get(key);

      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(classified);
          } catch (error) {
            console.error('[TradeCollector] Callback error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[TradeCollector] Trade processing error:', error);
    }
  }

  /**
   * Disconnect and cleanup
   */
  private disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[TradeCollector] Disconnected');
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.callbacks.clear();
    this.disconnect();
  }
}

// Singleton instance
let collectorInstance: TradeCollector | null = null;

/**
 * Get the global trade collector instance
 */
export function getTradeCollector(): TradeCollector {
  if (!collectorInstance) {
    collectorInstance = new TradeCollector();
  }
  return collectorInstance;
}

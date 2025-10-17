// Liquidation collector service for real-time liquidation data

import { RawLiquidation, ClassifiedLiquidation, Coin } from '../types';
import { classifyLiquidation } from '../utils';

export type LiquidationCallback = (liquidation: ClassifiedLiquidation) => void;

/**
 * Liquidation collector using WebSocket connection
 */
export class LiquidationCollector {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, LiquidationCallback[]> = new Map();
  private recentLiquidations: ClassifiedLiquidation[] = [];
  private readonly maxRecentLiquidations = 100;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private readonly maxReconnectDelay = 30000;
  private reconnectDelay = 1000;

  constructor(private readonly wsUrl: string = 'wss://api.hyperliquid.xyz/ws') {}

  /**
   * Start collecting liquidations for a coin
   */
  subscribe(coin: Coin, callback: LiquidationCallback): void {
    const key = `liquidations:${coin}`;
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
   * Stop collecting liquidations for a coin
   */
  unsubscribe(coin: Coin, callback?: LiquidationCallback): void {
    const key = `liquidations:${coin}`;
    
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
        console.log('[LiquidationCollector] WebSocket connected');
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
        console.error('[LiquidationCollector] WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[LiquidationCollector] WebSocket closed');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[LiquidationCollector] Connection error:', error);
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
      console.log('[LiquidationCollector] Attempting to reconnect...');
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  /**
   * Send subscription message for a coin
   */
  private sendSubscription(coin: Coin): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Note: Hyperliquid WebSocket API may use different subscription format for liquidations
    // This is a placeholder - adjust based on actual API
    const message = {
      method: 'subscribe',
      subscription: {
        type: 'liquidations',
        coin,
      },
    };

    this.ws.send(JSON.stringify(message));
    console.log(`[LiquidationCollector] Subscribed to ${coin} liquidations`);
  }

  /**
   * Send unsubscription message for a coin
   */
  private sendUnsubscription(coin: Coin): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      method: 'unsubscribe',
      subscription: {
        type: 'liquidations',
        coin,
      },
    };

    this.ws.send(JSON.stringify(message));
    console.log(`[LiquidationCollector] Unsubscribed from ${coin} liquidations`);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle liquidations channel
      // Note: Adjust channel name based on actual Hyperliquid API
      if (
        (message.channel === 'liquidations' || message.channel === 'notification') &&
        Array.isArray(message.data)
      ) {
        message.data.forEach((rawLiquidation: any) => {
          // Filter for liquidation notifications
          if (rawLiquidation.type === 'liquidation' || rawLiquidation.notification === 'liquidation') {
            this.processLiquidation(rawLiquidation);
          }
        });
      }
    } catch (error) {
      console.error('[LiquidationCollector] Message parsing error:', error);
    }
  }

  /**
   * Process and classify a raw liquidation
   */
  private processLiquidation(raw: any): void {
    try {
      // Map raw liquidation to RawLiquidation format
      const rawLiquidation: RawLiquidation = {
        coin: raw.coin,
        side: raw.side,
        price: raw.px || raw.price,
        size: raw.sz || raw.size,
        time: raw.time || Date.now(),
        liqId: raw.liqId || raw.hash || `liq_${Date.now()}`,
      };

      const classified = classifyLiquidation(rawLiquidation, this.recentLiquidations);
      
      // Update recent liquidations for cascade risk assessment
      this.recentLiquidations.push(classified);
      if (this.recentLiquidations.length > this.maxRecentLiquidations) {
        this.recentLiquidations.shift();
      }

      const key = `liquidations:${classified.coin}`;
      const callbacks = this.callbacks.get(key);

      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(classified);
          } catch (error) {
            console.error('[LiquidationCollector] Callback error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[LiquidationCollector] Liquidation processing error:', error);
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

    console.log('[LiquidationCollector] Disconnected');
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.callbacks.clear();
    this.recentLiquidations = [];
    this.disconnect();
  }
}

// Singleton instance
let collectorInstance: LiquidationCollector | null = null;

/**
 * Get the global liquidation collector instance
 */
export function getLiquidationCollector(): LiquidationCollector {
  if (!collectorInstance) {
    collectorInstance = new LiquidationCollector();
  }
  return collectorInstance;
}

'use client';

import * as hl from '@nktkas/hyperliquid';

export class HyperliquidWebSocket {
  private transport: hl.WebSocketTransport;
  private subscriptions: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.transport = new hl.WebSocketTransport({
      isTestnet: false,
    });
  }

  async connect() {
    // WebSocket se conecta automáticamente con el SDK
  }

  subscribeToCandles(coin: string, interval: string, callback: (data: any) => void) {
    const key = `candle-${coin}-${interval}`;
    this.subscriptions.set(key, callback);
    
    // En el SDK de @nktkas/hyperliquid, las suscripciones se manejan diferente
    // Por ahora dejamos preparado para cuando implementemos polling
  }

  unsubscribe(key: string) {
    this.subscriptions.delete(key);
  }

  disconnect() {
    this.subscriptions.clear();
  }
}

export const wsClient = new HyperliquidWebSocket();
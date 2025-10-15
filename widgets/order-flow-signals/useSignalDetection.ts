import { useState, useEffect, useRef } from 'react';
import { Signal, Trade, SignalConfig } from './types';
import { SignalEngine } from './signalEngine';

const DEFAULT_CONFIG: SignalConfig = {
  minConfirmations: 3,
  minConfidence: 75,
  largeOrderThreshold: 200000, // $200k
  aggressiveImbalanceThreshold: 75, // 75%
  cooldownMs: 2 * 60 * 1000, // 2 minutos
};

export function useSignalDetection(coin: string, config: SignalConfig = DEFAULT_CONFIG) {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [tradeCount, setTradeCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const engineRef = useRef<SignalEngine | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

useEffect(() => {
  // Inicializar engine
  engineRef.current = new SignalEngine(config);
  
  // Reset state
  setSignal(null);
  setCurrentPrice(0);
  setTradeCount(0);

  // Conectar WebSocket
  connectWebSocket();

  return () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
}, [coin, config.minConfirmations, config.minConfidence, config.largeOrderThreshold, config.aggressiveImbalanceThreshold, config.cooldownMs]);

  const connectWebSocket = () => {
  // Cerrar conexión anterior si existe
  if (wsRef.current) {
    wsRef.current.close();
    wsRef.current = null;
  }

  try {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for ${coin}`);
      setIsConnected(true);

      // Subscribir a trades de la moneda específica
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: {
          type: 'trades',
          coin: coin
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Procesar trades
        if (data.channel === 'trades' && data.data) {
          data.data.forEach((tradeData: any) => {
            const trade: Trade = {
              price: parseFloat(tradeData.px),
              size: parseFloat(tradeData.sz),
              side: tradeData.side === 'A' ? 'buy' : 'sell',
              timestamp: Date.now(),
              isLarge: parseFloat(tradeData.sz) * parseFloat(tradeData.px) > config.largeOrderThreshold,
              isLiquidation: tradeData.liquidation || false
            };

            engineRef.current?.addTrade(trade);
            setTradeCount(prev => prev + 1);

            // Actualizar precio actual
            setCurrentPrice(trade.price);

            // Detectar señal
            const detectedSignal = engineRef.current?.detectSignal(trade.price, coin);
            if (detectedSignal) {
              setSignal(detectedSignal);
              
              // Auto-clear señal después de 5 minutos
              setTimeout(() => {
                setSignal(null);
              }, 5 * 60 * 1000);
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Solo reconectar si no estamos cambiando de moneda
      if (wsRef.current === ws) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...');
          connectWebSocket();
        }, 3000);
      }
    };
  } catch (error) {
    console.error('Error connecting WebSocket:', error);
    setIsConnected(false);
  }
};

  const dismissSignal = () => {
    setSignal(null);
  };

  return {
    signal,
    isConnected,
    currentPrice,
    tradeCount,
    dismissSignal
  };
}
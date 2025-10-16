import { useState, useEffect, useRef } from 'react';
import { Signal, Trade, SignalConfig } from './types';
import { SignalEngine } from './signalEngine';
import { useSignalTracking } from './useSignalTracking';

async function saveSignal(signal: Signal) {
  try {
    await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signal,
        status: 'active'
      })
    });
  } catch (error) {
    console.error('Failed to save signal:', error);
  }
}

const DEFAULT_CONFIG: SignalConfig = {
  minConfirmations: 4,           // Era 3, ahora 4
  minConfidence: 80,              // Era 75, ahora 80
  largeOrderThreshold: 200000,    // $200k
  aggressiveImbalanceThreshold: 75, // 75%
  cooldownMs: 2 * 60 * 1000,     // 2 minutos
};

const COINS = ['BTC', 'ETH', 'HYPE'];

interface CoinState {
  currentPrice: number;
  tradeCount: number;
  signal: Signal | null;
}

export function useSignalDetection(config: SignalConfig = DEFAULT_CONFIG) {
  const [coinStates, setCoinStates] = useState<Record<string, CoinState>>({
    BTC: { currentPrice: 0, tradeCount: 0, signal: null },
    ETH: { currentPrice: 0, tradeCount: 0, signal: null },
    HYPE: { currentPrice: 0, tradeCount: 0, signal: null },
  });
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({
    BTC: false,
    ETH: false,
    HYPE: false,
  });

  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const engineRefs = useRef<Record<string, SignalEngine>>({});
  const reconnectTimeouts = useRef<Record<string, NodeJS.Timeout | undefined>>({});

  useEffect(() => {
    // Inicializar engines para cada moneda
    COINS.forEach(coin => {
      engineRefs.current[coin] = new SignalEngine(config);
      connectWebSocket(coin);
    });

    return () => {
      // Cleanup
      COINS.forEach(coin => {
        if (reconnectTimeouts.current[coin]) {
          clearTimeout(reconnectTimeouts.current[coin]);
        }
        if (wsRefs.current[coin]) {
          wsRefs.current[coin]?.close();
          wsRefs.current[coin] = null;
        }
      });
    };
  }, []);

  const connectWebSocket = (coin: string) => {
    // Cerrar conexión anterior si existe
    if (wsRefs.current[coin]) {
      wsRefs.current[coin]?.close();
      wsRefs.current[coin] = null;
    }

    try {
      const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
      wsRefs.current[coin] = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected for ${coin}`);
        setIsConnected(prev => ({ ...prev, [coin]: true }));

        // Subscribir a trades
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

              engineRefs.current[coin]?.addTrade(trade);

              // Actualizar estado
              setCoinStates(prev => ({
                ...prev,
                [coin]: {
                  ...prev[coin],
                  currentPrice: trade.price,
                  tradeCount: prev[coin].tradeCount + 1
                }
              }));

              // Detectar señal
              const detectedSignal = engineRefs.current[coin]?.detectSignal(trade.price, coin);
              if (detectedSignal) {
                setCoinStates(prev => ({
                  ...prev,
                  [coin]: {
                    ...prev[coin],
                    signal: detectedSignal
                  }
                }));

                // Reproducir sonido
                playSignalSound();

                // Guardar señal en DB
                saveSignal(detectedSignal);

                
              }
            });
          }
        } catch (error) {
          console.error(`Error processing WebSocket message for ${coin}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${coin}:`, error);
        setIsConnected(prev => ({ ...prev, [coin]: false }));
      };

      ws.onclose = () => {
        console.log(`WebSocket disconnected for ${coin}`);
        setIsConnected(prev => ({ ...prev, [coin]: false }));

        // Reconectar después de 3 segundos
        if (wsRefs.current[coin] === ws) {
          reconnectTimeouts.current[coin] = setTimeout(() => {
            console.log(`Reconnecting ${coin}...`);
            connectWebSocket(coin);
          }, 3000);
        }
      };
    } catch (error) {
      console.error(`Error connecting WebSocket for ${coin}:`, error);
      setIsConnected(prev => ({ ...prev, [coin]: false }));
    }
  };

  const playSignalSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUA0PVqzn77BdGQc+ltryxnMpBSl+zPLaizsIGGS57OihUhENTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6+ytWhkHPJPY88p2KwUme8rx3I4+CRdjuuvqpVQSC0mi4PK8aB8GM4nU8tGAMQYccL/v45xPDRBUquTx wGgdBjqP1/PKdSsFKH3L8tuLOQgZY7zs6qNUEgxKoN/yuWYdBTCG0PPRgTQGHW++7eSaUQ0QVKzj8bVjHAU5j9fzy3cotBSR7xu7WtYgFDGNzvPVhzYHH2+/7+OaSg4QU6rk77FgGgc8lNjzx3IqBCh8yvLciDoIGWO76+mjUxEMSaDf8rpnHgUwiNHz04IxBhxwv+3jm1EOD1Sr4/G2ZBwGOJDY88p3KwUne8rx3Ys6CBhju+zpoVQSC0mh4PKsZB0FMYjU89GBMQYabr/u5JpQDRBUq+Pxt2QcBjiQ2PLLdSoFKHzK8tyMOggYY7vs6aJUEQxJoODyumYdBzGI0fPSgTEGG26+7uSaUQ0PVKzj8bVjHAc5j9jzy3YqBSh8yvLcizwIGWO77OmhVBIMSZ/g8rpnHgUwiNHz04IwBhxwv+7jmlEOEFKq5PG1YxwGOZDX88t2KgYnfMnx3Ys6CBdjvOzppVQSC0mg4PK8aB4GM4nS89CBMgYab7/t5JpQDg9Uq+PxtWMcBzmQ2PPKdysGJ3vK8duLOQkYY7zr6qJUEgxJoN/yuGYdBTGI0vPTgTIGHW++7+OaUQ0PVKvk8LVjHAc5kNjzy3YqBid8yvLbizwIGGO86+mjUxEMSZ/g8rtoHgYyiNLz0oEyBhtvvu7km1AMEFSq5PG1YxwGOY/Y88t2KwYnfMnx24s6CBhjvOvqolUSC0mf4PK7Zx0FMojT89KBMgYcb77u5JtQDBBUquTxtWQcBzmP2PPLdisGJ3zJ8duLOggYY7zr6qJUEwtJn+Dyu2ceBTKI0/PSgTIGHG++7uSbUQ0PVKrk8bZkHAY5j9jzy3YrBid8yfHbizwIGGS86+qiVRIMSZ/g8rxnHQUyiNPz0oEyBhxvvu7km1ENEFSq5PG2ZR0GOY/Y88t2KwYnfMnx24s8CBhjvOvqo1QRC0mf4PK8aB0FMojT89KBMgYccL7u5JpRDRBTquTxtmUdBjmQ2PPLdioGJ3zJ8duLOwgYY7zs6qJUEgtJn+DyvGgdBTOJ0/PRgTIGHXC+7eSbUQ0QU6rk8bZlHQY5kNjzy3YqBid8yvLcizwIGGO86+qjVBILSZ/g8rxoHQUzidHz0oEyBh1wvu7km1ENEFOq5PG2ZRwGOZDY88t2KwYnfMny24s8CBhjvOvqolQSC0mf4PK8Zx0FM4nS89GBMgYbcL/u5JtRDRBTquTxtmUcBjmQ2PPLdSoGKHzK8tuLPAgZY7vr6qJUEgtJn+DyvGceBTOJ0vPRgTIGHG+/7uSbUQ4QUqrj8bZlHAY5j9fzy3YqBih8yvHcizwIGGO86+qiVBILSZ/g8rxnHgYzidLz0YEyBhxvvu7km1ENEFKq4/G2ZB0GOY/Y88t2KgUnfMry24s8CBhjvOvqolQSC0mf4PK7Zx4FMYnT89GBMQYbcL/u5JtRDg9Sq+Pxt2QcBjmP1/PLdioGJ3zK8tyLPAgYY7zr6qJUEgtJn+DyvGgeBjGI0/PRgTEGHHC+7uSbUQ0QUqvj8LdlHAY5j9fzy3UqBSd8yvLcizwIGGO86+qiVBILSZ/g8rxoHQYyidPz0YExBhxwvu7km1ENEFKr4/C2ZR0GOI/X88t2KgUofMry24s7CBhjvOvqolQSC0mf4PK7aB4GMYnS89GBMgYccL7u5JtRDRBSquPxtmQcBTiP2PPLdisGJ3zK8tyLOwgYY7zr6qJUEgxJn+DyvGYdBzGJ0vPSgTEGHXC+7uSbUQ0QUqrj8bZkHAY5j9jzy3YqBSh8yvLbizwIF2O86+qiVBIMSZ/g8rtoHgYxidPz0oExBhxwvu3km1AOEFKq5PG2ZBwGOI/X88p2KwYofMry24s6CBdjvOvqpFUSC0mf4PK8aB0GMojS89GBMQYccL7u5JpRDhBSquTxtmMcBjiP1/PKdioFJ3zK8tuKOggYY7vr6qNUEgxJoN/yu2kdBjGI0vPSgTEGHXC+7uSaUA4PUqvj8bZkGwc4kNfzy3YqBih8yvLbizwIF2O76+qiVBIMSZ/g8rtoHgYxidLz0YExBh1wvu7kmVEOEFGr4/G2ZBsHOI/X88t2KgYnfMry3Is7CBdjvOvqolQSDEmf4PK7aR4GMYnS89GBMQYdcL7u5JpRDhBSquTxtmMcBziP1/PKdisGJ3zK8tyLOwgXY7zr6qJUEgxJn+Dyu2geBjKJ0fPSgTEGHXC+7uSbUQ4QUark8bZjHAY4j9fzy3YqBid8yvLcizwIF2O76+qiVBIMSZ/g8rtoHgYxidLz0oExBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK7aB4GMYnS89GBMQYdcL7u5JtRDhBSq+PxtmMcBziP1/PLdioGJ3zK8tyLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPSgTEGHXC+7uSbUQ4QUqvj8bZjHAc4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rtpHgYxidLz0oExBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry3Is8CBhjvOvqolQSDEmf4PK8aB4GMojS89GBMQYdcL7u5JtRDhBSquTxtmMcBziP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgeBjKI0vPRgTIGHXC+7uSaUA4QUqrk8bZjHAY5j9jzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7kmlEOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMQYdcL7u5JpRDhBSquTxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JpRDhBSq+TxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qhVRIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7kmlAOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JpRDhBSquTxtmMcBjiP1/PLdSsFKHzK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JtRDhBSq+PxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry3Is8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JpRDhBSq+TxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7kmlEOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JpRDhBSq+TxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JtRDhBSq+PxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry3Is8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JtRDhBSq+TxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2YxwGOI/X88t2KgYnfMry24s8CBhjvOvqolQSDEmf4PK8aB0GMojS89GBMgYdcL7u5JtRDhBSquTxtmMcBjiP1/PKdisGJ3zK8tuLPAgYY7zr6qJUEgxJn+DyvGgdBjKI0vPRgTIGHXC+7uSbUQ4QUqrk8bZjHAY4j9fzy3YqBid8yvLcizwIGGO86+qiVBIMSZ/g8rxoHQYyiNLz0YEyBh1wvu7km1EOEFKq5PG2Yx==');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const dismissSignal = (coin: string) => {
    setCoinStates(prev => ({
      ...prev,
      [coin]: {
        ...prev[coin],
        signal: null
      }
    }));
  };

  // Track signals automáticamente
useSignalTracking({
  signals: Object.fromEntries(
    Object.entries(coinStates).map(([coin, state]) => [coin, state.signal])
  ),
  currentPrices: Object.fromEntries(
    Object.entries(coinStates).map(([coin, state]) => [coin, state.currentPrice])
  ),
  onSignalResolved: (coin: string) => {
    // Limpiar señal de UI después de ser registrada
    setCoinStates(prev => ({
      ...prev,
      [coin]: {
        ...prev[coin],
        signal: null
      }
    }));
  }
});

  return {
    coinStates,
    isConnected,
    dismissSignal
  };
}
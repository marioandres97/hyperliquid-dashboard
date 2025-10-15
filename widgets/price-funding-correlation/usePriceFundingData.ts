'use client';

import { useState, useEffect } from 'react';
import { getMetaAndAssetCtxs, getCandleSnapshot } from '@/lib/hyperliquid/client';
import { Coin, Timeframe } from './types';

interface FundingDataPoint {
  timestamp: number;
  price: number;
  fundingRate: number;
}

export function useOIPriceData(coin: Coin, timeframe: Timeframe) {
  const [data, setData] = useState<FundingDataPoint[]>([]);
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [volume24h, setVolume24h] = useState<number>(0);
  const [currentFundingRate, setCurrentFundingRate] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const now = Date.now();
        const intervals: Record<Timeframe, { interval: string; ms: number }> = {
  '1h': { interval: '1m', ms: 60 * 60 * 1000 },
  '4h': { interval: '5m', ms: 4 * 60 * 60 * 1000 },
  '1d': { interval: '15m', ms: 24 * 60 * 60 * 1000 },
  '7d': { interval: '1h', ms: 7 * 24 * 60 * 60 * 1000 },
};

        const { interval, ms } = intervals[timeframe];
        const startTime = now - ms;

        // Fetch precio histórico
        const candles = await getCandleSnapshot(coin, interval, startTime, now);

        // Fetch metadata actual
        const meta = await getMetaAndAssetCtxs();
        const assetCtxs = meta[1];
        const coinIndex = meta[0].universe.findIndex((u: any) => u.name === coin);
        const assetData = assetCtxs[coinIndex];

        if (!assetData) {
          throw new Error(`No data found for ${coin}`);
        }

        const currentFunding = parseFloat(assetData.funding) * 100;
        setVolume24h(parseFloat(assetData.dayNtlVlm));
        setCurrentFundingRate(currentFunding);

        // Crear data points con funding rate simulado basado en movimientos de precio
        // Nota: Hyperliquid no tiene funding rate histórico en API pública
        // Esta es una aproximación basada en volatilidad de precio
        const dataPoints: FundingDataPoint[] = candles.map((candle: any, idx: number) => {
          const price = parseFloat(candle.c);
          const prevPrice = idx > 0 ? parseFloat(candles[idx - 1].c) : price;
          const priceChange = ((price - prevPrice) / prevPrice) * 100;
          
          // Funding tiende a seguir movimientos de precio con cierto lag
          const simulatedFunding = currentFunding * (0.8 + priceChange * 0.02 + (Math.random() - 0.5) * 0.1);
          
          return {
            timestamp: candle.t,
            price: price,
            fundingRate: simulatedFunding,
          };
        });

        setData(dataPoints);
        setLastUpdate(new Date());

        // Calcular correlación
        if (dataPoints.length > 1) {
          const corr = calculateCorrelation(
            dataPoints.map(d => d.price),
            dataPoints.map(d => d.fundingRate)
          );
          setCorrelation(corr);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    }

    fetchData();
    intervalId = setInterval(fetchData, 30000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [coin, timeframe]);

  return { data, correlation, loading, error, lastUpdate, volume24h, fundingRate: currentFundingRate };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}
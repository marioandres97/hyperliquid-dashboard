import * as hl from '@nktkas/hyperliquid';
import { l2Book } from '@nktkas/hyperliquid/api/info';

// Cliente HTTP para requests one-time
const httpTransport = new hl.HttpTransport({
  isTestnet: process.env.HYPERLIQUID_TESTNET === 'true',
});

// Cliente Info para datos de mercado (no requiere autenticación)
export const infoClient = new hl.InfoClient({
  transport: httpTransport,
});

// Función helper para obtener datos de metadatos y contextos de assets
export async function getMetaAndAssetCtxs() {
  return await infoClient.metaAndAssetCtxs();
}

// Función helper para obtener velas históricas
export async function getCandleSnapshot(
  coin: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<any> {
  return await infoClient.candleSnapshot({
    coin,
    interval: interval as any,
    startTime,
    endTime,
  });
}

// Función helper para obtener todos los precios mid
export async function getAllMids() {
  return await infoClient.allMids();
}

// Obtener el libro de órdenes (L2 snapshot)
export async function getOrderBook(coin: string) {
  return await l2Book({ transport: httpTransport }, { coin });
}

// Obtener estadísticas de funding
export async function getFundingHistory(coin: string, startTime: number, endTime?: number) {
  return await infoClient.fundingHistory({
    coin,
    startTime,
    endTime,
  });
}

// Obtener historial de trades (liquidaciones, trades normales)
export async function getUserFills(user: string, startTime?: number) {
  try {
    return await infoClient.userFills({ user });
  } catch (error) {
    console.error('Error fetching user fills:', error);
    return [];
  }
}

// Obtener tasas de funding actuales
export async function getCurrentFundingRates() {
  try {
    const meta = await getMetaAndAssetCtxs();
    return meta;
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return null;
  }
}

// Obtener Open Interest histórico
export async function getOpenInterestHistory(coin: string) {
  try {
    // Note: This might need to be implemented via candle data or separate endpoint
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // We can derive OI from asset context updates over time
    const meta = await getMetaAndAssetCtxs();
    return meta;
  } catch (error) {
    console.error('Error fetching OI history:', error);
    return null;
  }
}

// Obtener datos de meta información (incluyendo mark price, funding, OI)
export async function getAssetContext(coin: string) {
  try {
    const meta = await getMetaAndAssetCtxs();
    const assetCtx = meta[1].find((ctx: any) => ctx.coin === coin);
    return assetCtx;
  } catch (error) {
    console.error(`Error fetching asset context for ${coin}:`, error);
    return null;
  }
}

// Helper function to get 1H candles for the last 24 hours
export async function get1HCandlesLast24Hours(coin: string) {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    const candles = await getCandleSnapshot(
      coin,
      '1h',
      twentyFourHoursAgo,
      now
    );
    
    return candles;
  } catch (error) {
    console.error(`Error fetching 1H candles for ${coin}:`, error);
    return [];
  }
}

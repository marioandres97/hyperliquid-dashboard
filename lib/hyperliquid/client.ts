import * as hl from '@nktkas/hyperliquid';

// Cliente HTTP para requests one-time
const httpTransport = new hl.HttpTransport({
  isTestnet: false,
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
) {
  return await infoClient.candleSnapshot({
    coin,
    interval,
    startTime,
    endTime,
  });
}

// Función helper para obtener todos los precios mid
export async function getAllMids() {
  return await infoClient.allMids();
}

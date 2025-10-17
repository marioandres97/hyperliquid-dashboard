import { Trade } from '@/widgets/order-flow-signals/types';

/**
 * Placeholder for historical data fetching from Hyperliquid API
 * TODO: Implement actual data download in phase 2
 */
export async function downloadHistoricalData(
  coin: string,
  startDate: Date,
  endDate: Date
): Promise<Trade[]> {
  // TODO: Implement download from Hyperliquid API
  // This will be implemented in the backtesting phase
  console.log(`Downloading historical data for ${coin} from ${startDate} to ${endDate}`);
  
  // Return empty array for now
  return [];
}

/**
 * Placeholder for saving historical data locally
 * TODO: Implement local caching in phase 2
 */
export async function saveHistoricalData(
  coin: string,
  data: Trade[]
): Promise<void> {
  // TODO: Implement local storage/caching
  console.log(`Saving ${data.length} trades for ${coin}`);
}

/**
 * Placeholder for loading cached historical data
 * TODO: Implement local cache retrieval in phase 2
 */
export async function loadCachedData(
  coin: string,
  startDate: Date,
  endDate: Date
): Promise<Trade[] | null> {
  // TODO: Implement cache retrieval
  console.log(`Loading cached data for ${coin} from ${startDate} to ${endDate}`);
  
  return null;
}

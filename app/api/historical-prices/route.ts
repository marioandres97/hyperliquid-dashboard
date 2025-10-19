import { NextRequest, NextResponse } from 'next/server';
import { fetch24HourData, fetchMultiCoin24HourData } from '@/lib/hyperliquid/historicalData';

export const dynamic = 'force-dynamic';

/**
 * GET /api/historical-prices?coins=BTC,ETH,HYPE
 * Fetch 24-hour historical data for sparklines
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coinsParam = searchParams.get('coins');

    if (!coinsParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: coins',
        },
        { status: 400 }
      );
    }

    const coins = coinsParam.split(',').map(c => c.trim().toUpperCase());

    // Fetch data for all coins
    const data = await fetchMultiCoin24HourData(coins);

    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

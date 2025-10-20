import { NextRequest, NextResponse } from 'next/server';
import { infoClient } from '@/lib/hyperliquid/client';
import { tradeToLargeOrder } from '@/lib/large-orders/types';
import { isWhaleOrder } from '@/lib/large-orders/whale-detection';
import type { LargeOrder } from '@/types/large-orders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/recent - Fetch recent large orders from Hyperliquid
 * Query params:
 * - limit: number of orders to fetch per coin (default: 100)
 * - coins: comma-separated list of coins (default: BTC,ETH,HYPE)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const coinsParam = searchParams.get('coins') || 'BTC,ETH,HYPE';
    const coins = coinsParam.split(',').map(c => c.trim());

    // Fetch recent trades for each coin
    const allOrders: LargeOrder[] = [];

    for (const coin of coins) {
      try {
        // Fetch recent trades from Hyperliquid
        const trades = await infoClient.recentTrades({ coin });
        
        if (trades && Array.isArray(trades)) {
          // Convert trades to LargeOrder format
          const orders = trades
            .slice(0, limit)
            .map((trade: any) => {
              const order = tradeToLargeOrder(trade, coin);
              return {
                ...order,
                isWhale: isWhaleOrder(order.usdValue),
              };
            });
          
          allOrders.push(...orders);
        }
      } catch (error) {
        console.error(`Error fetching trades for ${coin}:`, error);
        // Continue with other coins even if one fails
      }
    }

    // Sort by timestamp (most recent first)
    allOrders.sort((a, b) => b.timestamp - a.timestamp);

    // Return the most recent orders up to the limit
    const recentOrders = allOrders.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: recentOrders,
      count: recentOrders.length,
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent orders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

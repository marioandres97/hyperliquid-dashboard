import { NextRequest, NextResponse } from 'next/server';
import { whaleTradeRepository, WhaleTradeCategory } from '@/lib/database/repositories/whaleTrade.repository';
import { whaleTradeTracker } from '@/lib/services/whaleTradeTracker';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';

/**
 * GET /api/whale-trades
 * Retrieve whale trades with optional filters
 */
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const asset = searchParams.get('asset');
    const category = searchParams.get('category') as WhaleTradeCategory | null;
    const side = searchParams.get('side') as 'BUY' | 'SELL' | null;
    const minNotionalValue = searchParams.get('minNotionalValue');
    const maxNotionalValue = searchParams.get('maxNotionalValue');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const hours = searchParams.get('hours'); // For recent trades
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    const stats = searchParams.get('stats') === 'true';
    const thresholds = searchParams.get('thresholds') === 'true';

    // Return threshold information if requested
    if (thresholds) {
      return NextResponse.json(
        { 
          success: true,
          data: whaleTradeTracker.getThresholdInfo()
        },
        { headers: rateLimitResult.headers }
      );
    }

    // Return statistics if requested
    if (stats) {
      const filters: any = {};
      if (asset) filters.asset = asset;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);

      const statistics = await whaleTradeRepository.getStats(filters);
      return NextResponse.json(
        { 
          success: true,
          data: statistics
        },
        { headers: rateLimitResult.headers }
      );
    }

    // Get recent trades if hours parameter is provided
    if (hours) {
      const hoursNum = parseInt(hours);
      const limitNum = limit ? parseInt(limit) : 100;
      
      if (isNaN(hoursNum) || hoursNum <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid hours parameter' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }

      const trades = await whaleTradeRepository.getRecent(hoursNum, limitNum);
      return NextResponse.json(
        { 
          success: true,
          data: trades,
          count: trades.length
        },
        { headers: rateLimitResult.headers }
      );
    }

    // Build filters
    const filters: any = {};
    if (asset) {
      // Validate asset format
      if (!/^[A-Z0-9]+$/.test(asset)) {
        return NextResponse.json(
          { success: false, error: 'Invalid asset format' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      filters.asset = asset;
    }

    if (category) {
      // Validate category
      if (!Object.values(WhaleTradeCategory).includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      filters.category = category;
    }

    if (side) {
      // Validate side
      if (side !== 'BUY' && side !== 'SELL') {
        return NextResponse.json(
          { success: false, error: 'Invalid side, must be BUY or SELL' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      filters.side = side;
    }

    if (minNotionalValue) {
      const min = parseFloat(minNotionalValue);
      if (isNaN(min) || min < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid minNotionalValue' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      filters.minNotionalValue = min;
    }

    if (maxNotionalValue) {
      const max = parseFloat(maxNotionalValue);
      if (isNaN(max) || max < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid maxNotionalValue' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      filters.maxNotionalValue = max;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
      if (isNaN(filters.startDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid startDate format' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
      if (isNaN(filters.endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid endDate format' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
    }

    // Build options
    const options: any = {};
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum <= 0 || limitNum > 1000) {
        return NextResponse.json(
          { success: false, error: 'Invalid limit, must be between 1 and 1000' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      options.take = limitNum;
    } else {
      options.take = 100; // Default limit
    }

    if (skip) {
      const skipNum = parseInt(skip);
      if (isNaN(skipNum) || skipNum < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid skip parameter' },
          { status: 400, headers: rateLimitResult.headers }
        );
      }
      options.skip = skipNum;
    }

    // Get whale trades with filters
    const trades = await whaleTradeRepository.findWithFilters(filters, options);
    
    return NextResponse.json(
      { 
        success: true,
        data: trades,
        count: trades.length
      },
      { headers: rateLimitResult.headers }
    );
  });
}

/**
 * POST /api/whale-trades
 * Track a new whale trade
 */
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json();

    // Validate required fields
    if (!body.asset || !body.side || !body.price || !body.size) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: asset, side, price, size' 
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Validate asset format
    if (!/^[A-Z0-9]+$/.test(body.asset)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset format' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Validate side
    if (body.side !== 'BUY' && body.side !== 'SELL') {
      return NextResponse.json(
        { success: false, error: 'Invalid side, must be BUY or SELL' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Validate price and size
    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid price, must be a positive number' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (typeof body.size !== 'number' || body.size <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid size, must be a positive number' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Track the trade
    const result = await whaleTradeTracker.trackTrade({
      asset: body.asset,
      side: body.side,
      price: body.price,
      size: body.size,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
      tradeId: body.tradeId,
      priceImpact: body.priceImpact,
      metadata: body.metadata,
    });

    if (result.stored) {
      return NextResponse.json(
        { 
          success: true,
          data: result
        },
        { status: 201, headers: rateLimitResult.headers }
      );
    } else if (result.isWhaleTrade) {
      // Whale trade but not stored (database issue)
      return NextResponse.json(
        { 
          success: false,
          error: 'Whale trade detected but failed to store',
          data: result
        },
        { status: 500, headers: rateLimitResult.headers }
      );
    } else {
      // Not a whale trade
      return NextResponse.json(
        { 
          success: false,
          error: 'Trade does not meet whale threshold',
          data: result
        },
        { status: 200, headers: rateLimitResult.headers }
      );
    }
  });
}

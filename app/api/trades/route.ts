import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trades - List all trades with filters
 */
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const asset = searchParams.get('asset');
    const status = searchParams.get('status');
    const baseAsset = searchParams.get('baseAsset');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: {
      asset?: string;
      status?: string;
      baseAsset?: string;
      openedAt?: { gte?: Date; lte?: Date };
    } = {};

    if (asset && asset !== 'ALL') {
      where.asset = asset;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (baseAsset && baseAsset !== 'ALL') {
      where.baseAsset = baseAsset;
    }
    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) where.openedAt.gte = new Date(startDate);
      if (endDate) where.openedAt.lte = new Date(endDate);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: {
        openedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trades - Create new trade
 */
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      console.error('Database not configured - DATABASE_URL is missing');
      return NextResponse.json(
        {
          success: false,
          error: 'Database not available',
          message: 'The database is not configured. Please ensure DATABASE_URL is set in your environment variables.',
          code: 'DB_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['asset', 'type', 'entryPrice', 'size', 'openedAt'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        console.error(`Missing required field: ${field}`, body);
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
            message: `The field "${field}" is required to create a trade.`,
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
    }

    // Validate type
    if (!['long', 'short'].includes(body.type)) {
      console.error('Invalid type', { type: body.type });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type',
          message: 'Type must be either long or short',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate baseAsset
    const validBaseAssets = ['USDT', 'USDC', 'USD', 'BTC', 'ETH'];
    const baseAsset = body.baseAsset || 'USDT';
    if (!validBaseAssets.includes(baseAsset)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid baseAsset',
          message: 'Base asset must be one of: USDT, USDC, USD, BTC, ETH',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Parse numeric values
    const entryPrice = parseFloat(body.entryPrice);
    const exitPrice = body.exitPrice ? parseFloat(body.exitPrice) : null;
    const size = parseFloat(body.size);
    const fees = body.fees ? parseFloat(body.fees) : 0;

    // Determine status
    const status = exitPrice !== null && body.closedAt ? 'closed' : 'open';

    // Calculate PnL if trade is closed
    let pnl: number | null = null;
    let pnlPercent: number | null = null;

    if (status === 'closed' && exitPrice !== null) {
      if (body.type === 'long') {
        pnl = (exitPrice - entryPrice) * size - fees;
      } else {
        pnl = (entryPrice - exitPrice) * size - fees;
      }
      pnlPercent = (pnl / (entryPrice * size)) * 100;
    }

    console.log('Creating trade', {
      asset: body.asset,
      type: body.type,
      status,
      pnl: pnl?.toFixed(2),
      pnlPercent: pnlPercent?.toFixed(2)
    });

    // Create trade with better error handling
    let trade;
    try {
      trade = await prisma.trade.create({
        data: {
          asset: body.asset,
          baseAsset,
          type: body.type,
          entryPrice,
          exitPrice,
          size,
          fees,
          openedAt: new Date(body.openedAt),
          closedAt: body.closedAt ? new Date(body.closedAt) : null,
          pnl,
          pnlPercent,
          status,
          notes: body.notes || null,
        },
      });
    } catch (dbError) {
      console.error('Database error creating trade:', dbError);
      
      // Check if it's a connection error
      if (dbError instanceof Error) {
        if (dbError.message.includes('connect') || dbError.message.includes('ECONNREFUSED')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Database connection failed',
              message: 'Unable to connect to the database. Please try again or contact support if the issue persists.',
              code: 'DB_CONNECTION_ERROR',
              details: dbError.message,
            },
            { status: 503 }
          );
        }
      }
      
      // Generic database error
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'An error occurred while saving the trade. Please try again.',
          code: 'DB_ERROR',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      );
    }

    console.log('Trade created successfully', { tradeId: trade.id });

    return NextResponse.json({
      success: true,
      data: trade,
      message: 'Trade created successfully',
    });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

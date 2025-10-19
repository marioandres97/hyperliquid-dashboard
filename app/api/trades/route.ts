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
    const coin = searchParams.get('coin');
    const side = searchParams.get('side');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: {
      coin?: string;
      side?: string;
      entryTime?: { gte?: Date; lte?: Date };
    } = {};

    if (coin && coin !== 'ALL') {
      where.coin = coin;
    }
    if (side && side !== 'ALL') {
      where.side = side;
    }
    if (startDate || endDate) {
      where.entryTime = {};
      if (startDate) where.entryTime.gte = new Date(startDate);
      if (endDate) where.entryTime.lte = new Date(endDate);
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: {
        entryTime: 'desc',
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
          error: 'Database not configured. Please contact administrator.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['coin', 'side', 'entryPrice', 'exitPrice', 'size', 'entryTime', 'exitTime'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        console.error(`Missing required field: ${field}`, body);
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate coin
    if (!['BTC', 'ETH', 'HYPE', 'USDT', 'USDC'].includes(body.coin)) {
      console.error('Invalid coin', { coin: body.coin });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coin. Must be BTC, ETH, HYPE, USDT, or USDC',
        },
        { status: 400 }
      );
    }

    // Validate side
    if (!['LONG', 'SHORT'].includes(body.side)) {
      console.error('Invalid side', { side: body.side });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid side. Must be LONG or SHORT',
        },
        { status: 400 }
      );
    }

    // Calculate PnL
    const entryPrice = parseFloat(body.entryPrice);
    const exitPrice = parseFloat(body.exitPrice);
    const size = parseFloat(body.size);

    let pnl: number;
    if (body.side === 'LONG') {
      pnl = (exitPrice - entryPrice) * size;
    } else {
      pnl = (entryPrice - exitPrice) * size;
    }

    const pnlPercent = (pnl / (entryPrice * size)) * 100;

    console.log('Creating trade', {
      coin: body.coin,
      side: body.side,
      pnl: pnl.toFixed(2),
      pnlPercent: pnlPercent.toFixed(2)
    });

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        coin: body.coin,
        side: body.side,
        entryPrice,
        exitPrice,
        size,
        entryTime: new Date(body.entryTime),
        exitTime: new Date(body.exitTime),
        pnl,
        pnlPercent,
        notes: body.notes || null,
        tags: body.tags || [],
      },
    });

    console.log('Trade created successfully', { tradeId: trade.id });

    return NextResponse.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

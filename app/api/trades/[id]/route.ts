import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/trades/[id] - Update trade
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured',
        },
        { status: 503 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Check if trade exists
    const existingTrade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!existingTrade) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trade not found',
        },
        { status: 404 }
      );
    }

    // Recalculate PnL if prices changed
    let pnl = existingTrade.pnl;
    let pnlPercent = existingTrade.pnlPercent;

    const entryPrice = body.entryPrice !== undefined ? parseFloat(body.entryPrice) : existingTrade.entryPrice;
    const exitPrice = body.exitPrice !== undefined ? parseFloat(body.exitPrice) : existingTrade.exitPrice;
    const size = body.size !== undefined ? parseFloat(body.size) : existingTrade.size;
    const side = body.side || existingTrade.side;

    if (body.entryPrice !== undefined || body.exitPrice !== undefined || body.size !== undefined || body.side !== undefined) {
      if (side === 'LONG') {
        pnl = (exitPrice - entryPrice) * size;
      } else {
        pnl = (entryPrice - exitPrice) * size;
      }
      pnlPercent = (pnl / (entryPrice * size)) * 100;
    }

    // Update trade
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...(body.coin && { coin: body.coin }),
        ...(body.side && { side: body.side }),
        ...(body.entryPrice !== undefined && { entryPrice }),
        ...(body.exitPrice !== undefined && { exitPrice }),
        ...(body.size !== undefined && { size }),
        ...(body.entryTime && { entryTime: new Date(body.entryTime) }),
        ...(body.exitTime && { exitTime: new Date(body.exitTime) }),
        pnl,
        pnlPercent,
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
    });

    return NextResponse.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id] - Delete trade
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured',
        },
        { status: 503 }
      );
    }

    const { id } = await context.params;

    // Check if trade exists
    const existingTrade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!existingTrade) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trade not found',
        },
        { status: 404 }
      );
    }

    // Delete trade
    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

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
    let status = existingTrade.status;

    const entryPrice = body.entryPrice !== undefined ? parseFloat(body.entryPrice) : existingTrade.entryPrice;
    const exitPrice = body.exitPrice !== undefined ? (body.exitPrice ? parseFloat(body.exitPrice) : null) : existingTrade.exitPrice;
    const size = body.size !== undefined ? parseFloat(body.size) : existingTrade.size;
    const fees = body.fees !== undefined ? parseFloat(body.fees) : existingTrade.fees;
    const type = body.type || existingTrade.type;
    const closedAt = body.closedAt !== undefined ? (body.closedAt ? new Date(body.closedAt) : null) : existingTrade.closedAt;

    // Determine status based on whether we have exit price and closed date
    status = (exitPrice !== null && closedAt !== null) ? 'closed' : 'open';

    // Recalculate PnL if trade is closed
    if (status === 'closed' && exitPrice !== null) {
      if (type === 'long') {
        pnl = (exitPrice - entryPrice) * size - fees;
      } else {
        pnl = (entryPrice - exitPrice) * size - fees;
      }
      pnlPercent = (pnl / (entryPrice * size)) * 100;
    } else {
      pnl = null;
      pnlPercent = null;
    }

    // Update trade
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...(body.asset && { asset: body.asset }),
        ...(body.baseAsset && { baseAsset: body.baseAsset }),
        ...(body.type && { type: body.type }),
        ...(body.entryPrice !== undefined && { entryPrice }),
        ...(body.exitPrice !== undefined && { exitPrice }),
        ...(body.size !== undefined && { size }),
        ...(body.fees !== undefined && { fees }),
        ...(body.openedAt && { openedAt: new Date(body.openedAt) }),
        ...(body.closedAt !== undefined && { closedAt }),
        pnl,
        pnlPercent,
        status,
        ...(body.notes !== undefined && { notes: body.notes }),
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

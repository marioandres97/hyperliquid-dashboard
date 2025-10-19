import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts/history - Get alert history
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
    const alertId = searchParams.get('alertId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: { alertId?: string } = {};
    if (alertId) {
      where.alertId = alertId;
    }

    const history = await prisma.alertHistory.findMany({
      where,
      orderBy: {
        triggeredAt: 'desc',
      },
      take: limit,
      include: {
        alert: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching alert history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alert history',
      },
      { status: 500 }
    );
  }
}

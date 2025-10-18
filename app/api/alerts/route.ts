import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import type { CreateAlertInput } from '@/lib/alerts/types';
import { validateAlertInput } from '@/lib/alerts/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts - List all alerts
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
    const enabled = searchParams.get('enabled');

    // Build where clause
    const where: any = {};
    if (enabled !== null) {
      where.enabled = enabled === 'true';
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts - Create new alert
 */
export async function POST(request: NextRequest) {
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

    const body: CreateAlertInput = await request.json();

    // Validate input
    const validationError = validateAlertInput(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    // Create alert
    const alert = await prisma.alert.create({
      data: {
        type: body.type,
        coin: body.coin,
        condition: body.condition || null,
        value: body.value,
        side: body.side || null,
        enabled: true,
        browserNotif: body.browserNotif ?? true,
        emailNotif: body.emailNotif ?? false,
        webhook: body.webhook || null,
        triggered: 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
      },
      { status: 500 }
    );
  }
}

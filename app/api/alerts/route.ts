import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { alertSchema } from '@/types/alerts';
import type { CreateAlertInput } from '@/types/alerts';

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
    const active = searchParams.get('active');
    const triggered = searchParams.get('triggered');

    // Build where clause
    const where: { active?: boolean; triggered?: boolean } = {};
    if (active !== null) {
      where.active = active === 'true';
    }
    if (triggered !== null) {
      where.triggered = triggered === 'true';
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
          error: 'Database not available',
          message: 'The database is not configured. Please ensure DATABASE_URL is set in your environment variables.',
          code: 'DB_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate input using Zod
    const validation = alertSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create alert with new schema
    let alert;
    try {
      alert = await prisma.alert.create({
        data: {
          asset: data.asset.toUpperCase(),
          baseAsset: data.baseAsset,
          type: data.type,
          targetValue: data.targetValue,
          channels: data.channels,
          name: data.name || null,
          notes: data.notes || null,
          active: true,
          triggered: false,
          triggeredCount: 0,
          // Legacy field compatibility
          enabled: true,
          isActive: true,
          browserNotif: data.channels.includes('push'),
          emailNotif: data.channels.includes('email'),
        },
      });
    } catch (dbError) {
      console.error('Database error creating alert:', dbError);
      
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
      
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'An error occurred while saving the alert. Please try again.',
          code: 'DB_ERROR',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert created successfully! 🔔',
    });
  } catch (error) {
    console.error('Error creating alert:', error);
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

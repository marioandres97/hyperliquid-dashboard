import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { notificationSettingsSchema } from '@/types/alerts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/settings - Get notification settings
 */
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
      }, { status: 503 });
    }

    const userId = 'default-user'; // TODO: Get from auth session

    // Get or create settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.notificationSettings.create({
        data: {
          userId,
          pushEnabled: true,
          emailEnabled: false,
          telegramEnabled: false,
          whatsappEnabled: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notification settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/settings - Update notification settings
 */
export async function PUT(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
      }, { status: 503 });
    }

    const body = await request.json();
    const userId = 'default-user'; // TODO: Get from auth session

    // Validate input
    const validation = notificationSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: validation.data,
      create: {
        userId,
        ...validation.data,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification settings',
      },
      { status: 500 }
    );
  }
}

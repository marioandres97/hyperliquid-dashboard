import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { sendTestNotifications } from '@/lib/notifications/sender';
import type { NotificationChannel } from '@/types/alerts';

export const dynamic = 'force-dynamic';

/**
 * POST /api/alerts/test - Send test notification
 */
export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
      }, { status: 503 });
    }

    const body = await request.json();
    const { channels } = body as { channels?: NotificationChannel[] };

    if (!channels || channels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No channels specified',
        },
        { status: 400 }
      );
    }

    const userId = 'default-user'; // TODO: Get from auth session

    // Get notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification settings not found. Please configure your settings first.',
        },
        { status: 404 }
      );
    }

    // Send test notifications
    const results = await sendTestNotifications(channels, {
      email: settings.email,
      telegramChatId: settings.telegramChatId,
      whatsappNumber: settings.whatsappNumber,
      pushEnabled: settings.pushEnabled,
      emailEnabled: settings.emailEnabled,
      telegramEnabled: settings.telegramEnabled,
      whatsappEnabled: settings.whatsappEnabled,
    });

    // Separate successful and failed channels
    const successChannels = results.filter(r => r.success).map(r => r.channel);
    const failedChannels = results.filter(r => !r.success).map(r => ({
      channel: r.channel,
      error: r.error,
    }));

    return NextResponse.json({
      success: true,
      data: {
        results,
        successChannels,
        failedChannels,
      },
      message: `Test sent to ${successChannels.length} channel(s)`,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test notification',
      },
      { status: 500 }
    );
  }
}

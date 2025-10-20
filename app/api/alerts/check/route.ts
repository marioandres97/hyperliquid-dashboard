import { NextRequest, NextResponse } from 'next/server';
import { checkAlerts } from '@/lib/alerts/checker';

export const dynamic = 'force-dynamic';

/**
 * POST /api/alerts/check - Manually trigger alert checking
 * This endpoint can be called by a cron job or manually for testing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Manual alert check triggered');
    
    const stats = await checkAlerts();

    return NextResponse.json({
      success: true,
      data: stats,
      message: `Checked ${stats.checked} alerts, triggered ${stats.triggered}`,
    });
  } catch (error) {
    console.error('Error in manual alert check:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

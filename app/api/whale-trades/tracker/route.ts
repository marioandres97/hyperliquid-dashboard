import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { TRACKER_CONFIG } from '@/config/whale-trades.config';
import { 
  getTrackerState, 
  startTracker, 
  stopTracker, 
  resetTracker 
} from '@/lib/services/whaleTracker.state';

/**
 * GET /api/whale-trades/tracker
 * Get current tracker status
 */
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const trackerState = getTrackerState();
    const uptime = trackerState.startTime 
      ? Date.now() - trackerState.startTime.getTime()
      : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          enabled: trackerState.enabled,
          running: trackerState.running,
          trackedCount: trackerState.trackedCount,
          lastTrackTime: trackerState.lastTrackTime,
          uptime,
          errors: trackerState.errors,
          config: TRACKER_CONFIG,
        },
      },
      { headers: rateLimitResult.headers }
    );
  });
}

/**
 * POST /api/whale-trades/tracker
 * Control tracker (start/stop/reset)
 */
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json();
    const { action } = body;

    if (!action || !['start', 'stop', 'reset'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be one of: start, stop, reset',
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    let result;
    switch (action) {
      case 'start':
        result = startTracker();
        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: result.error,
            },
            { status: 400, headers: rateLimitResult.headers }
          );
        }
        break;

      case 'stop':
        result = stopTracker();
        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: result.error,
            },
            { status: 400, headers: rateLimitResult.headers }
          );
        }
        break;

      case 'reset':
        resetTracker();
        break;
    }

    const trackerState = getTrackerState();
    const uptime = trackerState.startTime 
      ? Date.now() - trackerState.startTime.getTime()
      : 0;

    return NextResponse.json(
      {
        success: true,
        message: `Tracker ${action} successful`,
        data: {
          enabled: trackerState.enabled,
          running: trackerState.running,
          trackedCount: trackerState.trackedCount,
          lastTrackTime: trackerState.lastTrackTime,
          uptime,
          errors: trackerState.errors,
        },
      },
      { headers: rateLimitResult.headers }
    );
  });
}

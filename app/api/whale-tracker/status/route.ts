/**
 * Whale Tracker Status Endpoint
 * 
 * GET /api/whale-tracker/status - Get current whale tracker status and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { whaleTrackerService } from '@/lib/services/whale-tracker.service';
import { config } from '@/lib/core/config';
import { WHALE_THRESHOLDS, CATEGORY_THRESHOLDS } from '@/config/whale-trades.config';

/**
 * GET /api/whale-tracker/status
 * Get current tracker status and configuration
 */
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Get status from whale tracker service
    const status = whaleTrackerService.getStatus();
    
    // Calculate uptime
    const uptime = status.startTime 
      ? Date.now() - new Date(status.startTime).getTime()
      : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          // Service status
          enabled: status.enabled,
          running: status.running,
          
          // Monitoring configuration
          monitoredAssets: status.monitoredAssets,
          
          // Batch processing
          batchInterval: status.batchInterval,
          
          // Tracking metrics
          trackedCount: status.trackedCount,
          lastTrackTime: status.lastTrackTime,
          uptime,
          errors: status.errors,
          
          // Thresholds configuration
          thresholds: {
            assets: WHALE_THRESHOLDS,
            categories: CATEGORY_THRESHOLDS,
          },
          
          // Configuration
          config: {
            enabled: config.whaleTracking.enabled,
            autoStart: config.whaleTracking.autoStart,
            batchInterval: config.whaleTracking.batchInterval,
            retentionDays: config.whaleTracking.retentionDays,
          },
        },
      },
      { 
        status: 200,
        headers: rateLimitResult.headers 
      }
    );
  });
}

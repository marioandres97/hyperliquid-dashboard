import { NextRequest, NextResponse } from 'next/server';
import { getAlerts, getAlertsByCoin, getActiveAlerts, dismissAlert, storeAlert, recordAlert } from '@/lib/redis/services/alertsService';
import type { StoredAlert, AlertType, AlertSeverity } from '@/lib/redis/services/alertsService';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIdentifier(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

// GET: Retrieve alerts
export async function GET(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const coin = searchParams.get('coin');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = searchParams.get('limit');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (activeOnly) {
      const alerts = await getActiveAlerts(limit ? parseInt(limit) : 50);
      return NextResponse.json({ alerts });
    }

    if (coin) {
      // Input validation
      if (!/^[A-Z]+$/.test(coin)) {
        return NextResponse.json(
          { error: 'Invalid coin format' },
          { status: 400 }
        );
      }

      const alerts = await getAlertsByCoin(coin, limit ? parseInt(limit) : 50);
      return NextResponse.json({ alerts });
    }

    const start = startTime ? parseInt(startTime) : undefined;
    const end = endTime ? parseInt(endTime) : undefined;
    const alerts = await getAlerts(start, end, limit ? parseInt(limit) : 100);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST: Store a new alert
export async function POST(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    
    // If full alert object is provided
    if (body.alert) {
      const alert: StoredAlert = body.alert;

      // Input validation
      if (!alert || !alert.coin || !alert.type || !alert.severity) {
        return NextResponse.json(
          { error: 'Invalid alert data' },
          { status: 400 }
        );
      }

      if (!/^[A-Z]+$/.test(alert.coin)) {
        return NextResponse.json(
          { error: 'Invalid coin format' },
          { status: 400 }
        );
      }

      const success = await storeAlert(alert);
      return NextResponse.json({ success });
    }

    // If alert parameters are provided for recording
    const { type, severity, coin, title, message, value, threshold } = body;

    if (!type || !severity || !coin || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required alert parameters' },
        { status: 400 }
      );
    }

    // Input validation
    if (!/^[A-Z]+$/.test(coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400 }
      );
    }

    const validTypes: AlertType[] = ['price', 'volume', 'position', 'trade', 'liquidation', 'funding'];
    const validSeverities: AlertSeverity[] = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid alert type' },
        { status: 400 }
      );
    }

    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid alert severity' },
        { status: 400 }
      );
    }

    const success = await recordAlert({ type, severity, coin, title, message, value, threshold });
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error storing alert:', error);
    return NextResponse.json(
      { error: 'Failed to store alert' },
      { status: 500 }
    );
  }
}

// DELETE: Dismiss an alert
export async function DELETE(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const success = await dismissAlert(alertId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to dismiss alert' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss alert' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import type { UpdateAlertInput } from '@/lib/alerts/types';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/alerts/[id] - Update alert
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
    const body: UpdateAlertInput = await request.json();

    // Check if alert exists
    const existing = await prisma.alert.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    // Update alert
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
        value: body.value !== undefined ? body.value : existing.value,
        browserNotif: body.browserNotif !== undefined ? body.browserNotif : existing.browserNotif,
        emailNotif: body.emailNotif !== undefined ? body.emailNotif : existing.emailNotif,
        webhook: body.webhook !== undefined ? body.webhook : existing.webhook,
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/[id] - Delete alert
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

    // Check if alert exists
    const existing = await prisma.alert.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    // Delete alert (this will cascade delete history)
    await prisma.alert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
      },
      { status: 500 }
    );
  }
}

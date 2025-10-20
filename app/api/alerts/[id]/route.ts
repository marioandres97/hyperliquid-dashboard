import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { updateAlertSchema } from '@/types/alerts';
import type { UpdateAlertInput } from '@/types/alerts';

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
    const body = await request.json();

    // Validate input
    const validation = updateAlertSchema.safeParse(body);
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

    const data = validation.data;

    // Update alert
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        targetValue: data.targetValue !== undefined ? data.targetValue : existing.targetValue,
        channels: data.channels !== undefined ? data.channels : existing.channels,
        name: data.name !== undefined ? data.name : existing.name,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        active: data.active !== undefined ? data.active : existing.active,
        // Update legacy fields for compatibility
        enabled: data.active !== undefined ? data.active : existing.enabled,
        isActive: data.active !== undefined ? data.active : existing.isActive,
        browserNotif: data.channels !== undefined ? data.channels.includes('push') : existing.browserNotif,
        emailNotif: data.channels !== undefined ? data.channels.includes('email') : existing.emailNotif,
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert updated successfully!',
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
      message: 'Alert deleted successfully!',
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

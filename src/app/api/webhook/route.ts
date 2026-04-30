import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json() as { event?: string };

  switch (body.event) {
    case 'miniapp_added':
    case 'miniapp_removed':
    case 'notifications_enabled':
    case 'notifications_disabled':
      break;
  }

  return NextResponse.json({ success: true });
}

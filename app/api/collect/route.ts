import { NextResponse } from 'next/server';
import { runCollection } from '@/lib/collect';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST() {
  try {
    const result = await runCollection(15);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[API/collect]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

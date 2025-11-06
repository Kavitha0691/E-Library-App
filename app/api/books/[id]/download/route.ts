import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Increment download count
    const { data, error } = await supabase
      .from('books')
      .select('downloadCount')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    await supabase
      .from('books')
      .update({ downloadCount: (data.downloadCount || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to record download' },
      { status: 500 }
    );
  }
}

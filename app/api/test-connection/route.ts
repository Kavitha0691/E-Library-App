import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Simple test query
    const { data, error } = await supabase
      .from('books')
      .select('count');

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      count: data
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

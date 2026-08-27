import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password !== 'Nowey2024.9') {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('registrations')
      .delete()
      .neq('id', 0); // delete all rows

    if (error) {
      console.error('清除报名数据失败:', error);
      return NextResponse.json(
        { success: false, error: '清除数据失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '所有报名数据已清除' });
  } catch (e) {
    console.error('clear API error:', e);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

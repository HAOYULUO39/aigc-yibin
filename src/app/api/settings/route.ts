import { getSupabaseClient } from '@/storage/database/supabase-client';
import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'Nowey2024.9';

const DEFAULTS: Record<string, string> = {
  organizers: 'Datawhale / 宜宾市大数据有限责任公司 / 展望数科（成都）科技有限公司 / 智创会',
  event_date: '九月中旬',
  location: '宜宾市大数据产业园',
  qrcode: '/qrcode.jpg',
};

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('site_settings')
      .select('key, value');

    if (error) {
      return NextResponse.json(DEFAULTS);
    }

    const result: Record<string, string> = { ...DEFAULTS };
    if (data) {
      for (const row of data) {
        result[row.key] = row.value;
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { password, key, value } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    if (!key || typeof key !== 'string' || !key.trim()) {
      return NextResponse.json({ success: false, error: '缺少 key' }, { status: 400 });
    }

    if (value === undefined || value === null || typeof value !== 'string' || !value.trim()) {
      return NextResponse.json({ success: false, error: '值不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { error } = await client
      .from('site_settings')
      .upsert({ key: key.trim(), value: value.trim() }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

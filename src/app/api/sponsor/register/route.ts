import { getSupabaseClient } from '@/storage/database/supabase-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, contact, phone, wechat } = body;

    // 校验
    if (!company || !company.trim()) {
      return NextResponse.json({ success: false, error: '请输入公司名称' }, { status: 400 });
    }
    if (!contact || !contact.trim()) {
      return NextResponse.json({ success: false, error: '请输入联系人名字' }, { status: 400 });
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: '请输入有效的手机号码' }, { status: 400 });
    }
    if (!wechat || !wechat.trim()) {
      return NextResponse.json({ success: false, error: '请输入微信号' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查公司是否已提交
    const { data: existing } = await client
      .from('sponsors')
      .select('id')
      .eq('company_name', company.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: '该公司已提交过赞助申请' }, { status: 409 });
    }

    const { error } = await client.from('sponsors').insert({
      company_name: company.trim(),
      contact_name: contact.trim(),
      phone,
      wechat: wechat.trim(),
    });

    if (error) {
      return NextResponse.json({ success: false, error: '提交失败，请稍后再试' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sponsor register error:', err);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

import { getSupabaseClient } from '@/storage/database/supabase-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, role, occupation } = body;

    // 基本校验
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: '请输入有效的名字' }, { status: 400 });
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: '请输入有效的手机号码' }, { status: 400 });
    }
    if (!role || !['学习者', '志愿者'].includes(role)) {
      return NextResponse.json({ success: false, error: '请选择有效的参与形式' }, { status: 400 });
    }
    if (!occupation || !['学生', '创业者', '自由职业者', '企业负责人', '职员'].includes(occupation)) {
      return NextResponse.json({ success: false, error: '请选择有效的职业' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查手机号是否已报名
    const { data: existing, error: checkError } = await client
      .from('registrations')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ success: false, error: '系统错误，请稍后再试' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: false, error: '该手机号已报名，请勿重复提交' }, { status: 409 });
    }

    const { error: insertError } = await client
      .from('registrations')
      .insert({
        name: name.trim(),
        phone,
        role,
        occupation,
      });

    if (insertError) {
      return NextResponse.json({ success: false, error: '报名失败，请稍后再试' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '服务器错误，请稍后再试' }, { status: 500 });
  }
}

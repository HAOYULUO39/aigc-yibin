import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ADMIN_PASSWORD = 'Nowey2024.9';
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const file = formData.get('file') as File | null;

    // 密码验证
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    // 文件验证
    if (!file) {
      return NextResponse.json({ success: false, error: '请选择文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: '仅支持 PNG、JPG 格式' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: '图片大小不能超过 5MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const ext = file.type === 'image/png' ? '.png' : '.jpg';
    const filename = `qrcode-${Date.now()}${ext}`;
    const publicDir = path.join(process.cwd(), 'public');
    
    // 确保 public 目录存在
    await mkdir(publicDir, { recursive: true });

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(publicDir, filename), buffer);

    const qrcodePath = `/${filename}`;

    // 存储路径到数据库
    const client = getSupabaseClient();
    const { error: dbError } = await client
      .from('site_settings')
      .upsert({ key: 'qrcode', value: qrcodePath }, { onConflict: 'key' });

    if (dbError) {
      return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, qrcode: qrcodePath });
  } catch {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

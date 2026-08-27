import { getSupabaseClient } from '@/storage/database/supabase-client';
import { NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';

const ADMIN_PASSWORD = 'Nowey2024.9';

// GET: 获取赞助商列表
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, action } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const client = getSupabaseClient();

    if (action === 'clear') {
      const { error: clearError } = await client.from('sponsors').delete().neq('id', 0);

      if (clearError) {
        return NextResponse.json({ success: false, error: '清除数据失败' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: '所有赞助商数据已清除' });
    }

    if (action === 'download') {
      // 下载 Word
      const { data, error } = await client
        .from('sponsors')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        return NextResponse.json({ success: false, error: '查询数据失败' }, { status: 500 });
      }

      const sponsors = data || [];

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: 'Noto Sans SC', size: 22 },
            },
          },
        },
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'AIGC+宜宾 — 赞助商信息汇总', bold: true, size: 32 }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `导出时间：${new Date().toLocaleString('zh-CN')}`, size: 22, color: '666666' }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `赞助商数量：${sponsors.length}`, size: 22, bold: true }),
                ],
                spacing: { after: 300 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    tableHeader: true,
                    children: [
                      createHeaderCell('序号', 8),
                      createHeaderCell('公司名称', 28),
                      createHeaderCell('联系人', 16),
                      createHeaderCell('电话', 20),
                      createHeaderCell('微信号', 20),
                      createHeaderCell('提交时间', 8),
                    ],
                  }),
                  ...sponsors.map(
                    (s, i) =>
                      new TableRow({
                        children: [
                          createDataCell(String(i + 1), 8),
                          createDataCell(s.company_name, 28),
                          createDataCell(s.contact_name, 16),
                          createDataCell(s.phone, 20),
                          createDataCell(s.wechat, 20),
                          createDataCell(
                            new Date(s.created_at).toLocaleString('zh-CN'),
                            8
                          ),
                        ],
                      })
                  ),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `AIGC+宜宾_赞助商信息_${new Date().toISOString().slice(0, 10)}.docx`;

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    // 默认：返回列表
    const { data, error } = await client
      .from('sponsors')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: '查询数据失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Sponsors admin error:', err);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { fill: '10b981' },
    verticalAlign: 'center',
  });
}

function createDataCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20 })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    borders: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    verticalAlign: 'center',
  });
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const client = getSupabaseClient();

    // 获取所有报名数据（分批获取以防超 1000）
    const allRegistrations: Array<{
      id: number;
      name: string;
      phone: string;
      role: string;
      occupation: string;
      created_at: string;
    }> = [];

    let page = 0;
    const pageSize = 500;
    while (true) {
      const { data, error } = await client
        .from('registrations')
        .select('*')
        .order('id', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        return NextResponse.json({ success: false, error: '查询数据失败' }, { status: 500 });
      }

      if (!data || data.length === 0) break;
      allRegistrations.push(...data);
      if (data.length < pageSize) break;
      page++;
    }

    // 从数据库获取活动日期和地点
    let eventDate = '九月中旬';
    let location = '宜宾市大数据产业园';
    try {
      const { data: settingsData } = await getSupabaseClient()
        .from('site_settings')
        .select('key, value');
      if (settingsData) {
        for (const row of settingsData) {
          if (row.key === 'event_date') eventDate = row.value;
          if (row.key === 'location') location = row.value;
        }
      }
    } catch {}

    // 创建 Word 文档
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Noto Sans SC',
              size: 22, // 11pt
            },
          },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AIGC+宜宾 — 活动报名信息汇总',
                  bold: true,
                  size: 32, // 16pt
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `活动时间：${eventDate}`,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `活动地点：${location}`,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `导出时间：${new Date().toLocaleString('zh-CN')}`,
                  size: 22,
                  color: '666666',
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `报名总人数：${allRegistrations.length}`,
                  size: 22,
                  bold: true,
                }),
              ],
              spacing: { after: 300 },
            }),
            // 数据表格
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // 表头
                new TableRow({
                  tableHeader: true,
                  children: [
                    createHeaderCell('序号', 10),
                    createHeaderCell('名字', 18),
                    createHeaderCell('联系电话', 22),
                    createHeaderCell('参与形式', 16),
                    createHeaderCell('职业', 18),
                    createHeaderCell('报名时间', 16),
                  ],
                }),
                // 数据行
                ...allRegistrations.map(
                  (reg, index) =>
                    new TableRow({
                      children: [
                        createDataCell(String(index + 1), 10),
                        createDataCell(reg.name, 18),
                        createDataCell(reg.phone, 22),
                        createDataCell(reg.role, 16),
                        createDataCell(reg.occupation, 18),
                        createDataCell(
                          new Date(reg.created_at).toLocaleString('zh-CN'),
                          16
                        ),
                      ],
                    })
                ),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '',
                }),
              ],
              spacing: { before: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '联合主办：Datawhale / 宜宾市大数据有限责任公司 / 展望数科（成都）科技有限公司 / 智创会',
                  size: 18,
                  color: '888888',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `AIGC+宜宾_报名信息_${new Date().toISOString().slice(0, 10)}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size: 20,
            color: 'FFFFFF',
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: {
      fill: '10b981',
    },
    verticalAlign: 'center',
  });
}

function createDataCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    borders: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    verticalAlign: 'center',
  });
}

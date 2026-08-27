import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AIGC+宜宾 | AI 训练营 & 黑客松报名',
    template: '%s | AIGC+宜宾',
  },
  description:
    'AIGC+宜宾 — AI小白/AI编程训练营/黑客松比赛。九月中旬，宜宾市大数据产业园。Datawhale联合主办。',
  keywords: ['AIGC', '宜宾', 'AI训练营', '黑客松', '编程', 'Datawhale'],
  openGraph: {
    title: 'AIGC+宜宾 | AI 训练营 & 黑客松报名',
    description:
      'AI小白/AI编程训练营/黑客松比赛。九月中旬，宜宾市大数据产业园。',
    type: 'website',
    locale: 'zh_CN',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#0a0f14] text-[#f9fafb]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

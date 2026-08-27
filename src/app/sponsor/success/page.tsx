'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SponsorSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md text-center animate-scale-in">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#f59e0b]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#f9fafb] mb-3">提交成功！</h1>
        <p className="text-[#9ca3af] text-sm mb-3">
          感谢您的赞助意向，我们将尽快与您联系
        </p>
        <p className="text-[#6b7280] text-xs mb-8">
          如有疑问，请通过活动群联系我们
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-6 py-3 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#059669]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

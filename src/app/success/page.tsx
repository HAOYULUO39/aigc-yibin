'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function SuccessPage() {
  const [qrcode, setQrcode] = useState('/qrcode.jpg');
  const [eventDate, setEventDate] = useState('九月中旬');
  const [location, setLocation] = useState('宜宾市大数据产业园');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.qrcode) setQrcode(data.qrcode);
        if (data.event_date) setEventDate(data.event_date);
        if (data.location) setLocation(data.location);
      })
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#10b981]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md text-center animate-scale-in">
        {/* 成功图标 */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#10b981]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#f9fafb] mb-3">
          报名成功！
        </h1>
        <p className="text-[#9ca3af] text-sm mb-8">
          您的报名信息已成功提交
        </p>

        {/* 二维码区域 */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-6 mb-6">
          <p className="text-sm font-medium text-[#d1d5db] mb-4">
            请加入活动群，获取最新通知
          </p>
          <div className="flex justify-center mb-3">
            <div className="rounded-lg bg-white p-3 inline-block">
              <Image
                src={qrcode}
                alt="活动群二维码"
                width={200}
                height={200}
                className="rounded w-[200px] h-[200px]"
                priority
              />
            </div>
          </div>
          <p className="text-xs text-[#6b7280]">
            请使用微信扫一扫加入活动群
          </p>
        </div>

        {/* 活动信息确认 */}
        <div className="rounded-lg border border-[#1f2937] bg-[#111827]/60 p-4 text-left space-y-2">
          <p className="text-xs text-[#6b7280]">活动信息确认</p>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <p className="text-sm text-[#d1d5db]">
              <span className="text-[#10b981] font-medium">AIGC+宜宾</span>
              &nbsp;·&nbsp;{eventDate}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <p className="text-xs text-[#6b7280]">{location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

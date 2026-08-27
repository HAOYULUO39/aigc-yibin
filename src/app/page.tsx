'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, MapPin, Users, Sparkles, Settings, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    occupation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [organizers, setOrganizers] = useState('');
  const [eventDate, setEventDate] = useState('九月中旬');
  const [location, setLocation] = useState('宜宾市大数据产业园');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.organizers) setOrganizers(data.organizers);
        if (data.event_date) setEventDate(data.event_date);
        if (data.location) setLocation(data.location);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = '请输入您的名字';
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      errs.phone = '请输入有效的手机号码';
    }
    if (!formData.role) {
      errs.role = '请选择参与形式';
    }
    if (!formData.occupation) {
      errs.occupation = '请选择您的职业';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/success');
      } else {
        setErrors({ form: data.error || '提交失败，请稍后再试' });
      }
    } catch {
      setErrors({ form: '网络错误，请检查网络后重试' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-[#1f2937] bg-[#0a0f14] px-4 py-3 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none transition-all duration-300 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/30';

  const labelClasses = 'block text-sm font-medium text-[#d1d5db] mb-2';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#f59e0b]/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* 活动标题区域 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            首场城市创造活动
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f9fafb] mb-2">
            AIGC<span className="text-[#10b981]">+</span>宜宾
          </h1>
          <p className="text-[#9ca3af] text-sm">
            AI小白 / AI编程训练营 / 黑客松比赛
          </p>
        </div>

        {/* 活动信息卡片 */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-5 mb-8 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#f9fafb]">
                {eventDate}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[#d1d5db]">{location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[#6b7280]">
                联合主办：{organizers || '加载中...'}
              </p>
            </div>
          </div>
        </div>

        {/* 报名表单 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-[#f9fafb] mb-1">
            填写报名信息
          </h2>

          {/* 名字 */}
          <div>
            <label className={labelClasses}>1. 名字</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入您的名字"
              className={inputClasses}
              maxLength={50}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* 联系电话 */}
          <div>
            <label className={labelClasses}>2. 联系电话</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号码"
              className={inputClasses}
              maxLength={11}
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>
            )}
          </div>

          {/* 参与形式 */}
          <div>
            <label className={labelClasses}>3. 参与形式</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '学习者', label: '学习者', hint: '报名提交即为成功' },
                { value: '志愿者', label: '志愿者', hint: '申请通过短信通知' },
              ].map((opt) => {
                const isVolunteer = opt.value === '志愿者';
                const selected = formData.role === opt.value;
                const activeBorder = isVolunteer ? 'border-[#f59e0b]' : 'border-[#10b981]';
                const activeBg = isVolunteer ? 'bg-[#f59e0b]/10' : 'bg-[#10b981]/10';
                const activeText = isVolunteer ? 'text-[#f59e0b]' : 'text-[#10b981]';
                const activeRing = isVolunteer ? 'ring-[#f59e0b]/30' : 'ring-[#10b981]/30';

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('role', opt.value)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 text-left ${
                      selected
                        ? `${activeBorder} ${activeBg} ${activeText} ring-1 ${activeRing}`
                        : 'border-[#1f2937] bg-[#0a0f14] text-[#9ca3af] hover:border-[#374151] hover:text-[#d1d5db]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-60">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-red-400 text-xs mt-1.5">{errors.role}</p>
            )}
          </div>

          {/* 职业 */}
          <div>
            <label className={labelClasses}>4. 您的职业是</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '学生', label: '学生' },
                { value: '创业者', label: '创业者' },
                { value: '自由职业者', label: '自由职业者' },
                { value: '企业负责人', label: '企业负责人' },
                { value: '职员', label: '职员' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('occupation', opt.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    formData.occupation === opt.value
                      ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981] ring-1 ring-[#10b981]/30'
                      : 'border-[#1f2937] bg-[#0a0f14] text-[#9ca3af] hover:border-[#374151] hover:text-[#d1d5db]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.occupation && (
              <p className="text-red-400 text-xs mt-1.5">{errors.occupation}</p>
            )}
          </div>

          {/* 赞助商入口 */}
          <div className="pt-2 border-t border-[#1f2937]">
            <Link
              href="/sponsor"
              className="inline-flex items-center gap-2 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 px-4 py-3 text-sm font-medium text-[#f59e0b] transition-all duration-300 hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/50 w-full justify-center"
            >
              <Building2 className="w-4 h-4" />
              我想成为赞助商
            </Link>
          </div>

          {/* 全局错误 */}
          {errors.form && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
              {errors.form}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#10b981] px-6 py-3.5 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#059669] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                提交中...
              </>
            ) : (
              <>
                提交报名
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 底部：管理员入口 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <p className="text-center text-xs text-[#4b5563]">
            提交即表示您同意我们收集以上信息用于活动组织
          </p>
          <span className="text-[#374151]">·</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#10b981] transition-colors"
          >
            <Settings className="w-3 h-3" />
            管理入口
          </Link>
        </div>
      </div>
    </div>
  );
}

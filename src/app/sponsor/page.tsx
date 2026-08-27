'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Info } from 'lucide-react';

export default function SponsorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    phone: '',
    wechat: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.company.trim()) errs.company = '请输入公司完整工商注册名';
    if (!formData.contact.trim()) errs.contact = '请输入联系人名字';
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) errs.phone = '请输入有效的手机号码';
    if (!formData.wechat.trim()) errs.wechat = '请输入微信号';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/sponsor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/sponsor/success');
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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#f59e0b]/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-medium mb-4">
            <Building2 className="w-3.5 h-3.5" />
            赞助商申请
          </div>
          <h1 className="text-2xl font-bold text-[#f9fafb] mb-2">我想成为赞助商</h1>
          <p className="text-[#9ca3af] text-sm">AIGC+宜宾 活动赞助合作</p>
        </div>

        {/* 赞助规则 */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-5 mb-8">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-[#f9fafb]">赞助规则</p>
          </div>
          <div className="space-y-2 text-xs text-[#9ca3af] leading-relaxed">
            <p>· 赞助标准：<span className="text-[#f59e0b] font-medium">2000元</span></p>
            <p>· 赞助单位宣讲环节：17:00-17:20，每个单位 <span className="text-[#f59e0b] font-medium">5分钟</span></p>
            <p>· 提供主视觉和报名页名字露出</p>
            <p>· 主持人口播鸣谢</p>
            <p>· 公众号复盘鸣谢</p>
            <p>· 可自带易拉宝</p>
            <p>· 可开票</p>
          </div>
        </div>

        {/* 表单 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-6 space-y-5"
        >
          <div>
            <label className={labelClasses}>公司名称（完整工商注册名）</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="请输入公司完整工商注册名称"
              className={inputClasses}
              maxLength={100}
            />
            {errors.company && <p className="text-red-400 text-xs mt-1.5">{errors.company}</p>}
          </div>

          <div>
            <label className={labelClasses}>联系人名字</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="请输入联系人名字"
              className={inputClasses}
              maxLength={50}
            />
            {errors.contact && <p className="text-red-400 text-xs mt-1.5">{errors.contact}</p>}
          </div>

          <div>
            <label className={labelClasses}>联系电话</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号码"
              className={inputClasses}
              maxLength={11}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
          </div>

          <div>
            <label className={labelClasses}>微信号</label>
            <input
              type="text"
              value={formData.wechat}
              onChange={(e) => handleChange('wechat', e.target.value)}
              placeholder="请输入微信号"
              className={inputClasses}
              maxLength={50}
            />
            {errors.wechat && <p className="text-red-400 text-xs mt-1.5">{errors.wechat}</p>}
          </div>

          {errors.form && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
              {errors.form}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#f59e0b] px-6 py-3.5 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#d97706] hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                提交中...
              </>
            ) : (
              <>
                提交申请
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

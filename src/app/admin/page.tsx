'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield,
  Download,
  ArrowLeft,
  LogOut,
  Save,
  Edit3,
  Trash2,
  RefreshCw,
  Users,
  Building2,
  Upload,
  Image,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Registration {
  id: number;
  name: string;
  phone: string;
  role: string;
  occupation: string;
  created_at: string;
}

interface Sponsor {
  id: number;
  company: string;
  contact: string;
  phone: string;
  wechat: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 报名数据
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 联合主办方编辑
  const [organizers, setOrganizers] = useState('');
  const [editingOrganizers, setEditingOrganizers] = useState(false);
  const [savingOrganizers, setSavingOrganizers] = useState(false);
  const [organizersMsg, setOrganizersMsg] = useState('');

  // 清除数据
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearing, setClearing] = useState(false);

  // 活动日期和地点编辑
  const [eventDate, setEventDate] = useState('九月中旬');
  const [location, setLocation] = useState('宜宾市大数据产业园');
  const [editingDate, setEditingDate] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [clearError, setClearError] = useState('');

  // 二维码上传
  const [qrcodeUrl, setQrcodeUrl] = useState('/qrcode.jpg');
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrMsg, setQrMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 赞助商
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [downloadingSponsors, setDownloadingSponsors] = useState(false);
  const [showSponsorClear, setShowSponsorClear] = useState(false);
  const [sponsorClearPassword, setSponsorClearPassword] = useState('');
  const [clearingSponsors, setClearingSponsors] = useState(false);
  const [sponsorClearError, setSponsorClearError] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'sponsors'>('registrations');

  const fetchRegistrations = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  }, [password]);

  const fetchSponsors = useCallback(async () => {
    setLoadingSponsors(true);
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSponsors(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSponsors(false);
    }
  }, [password]);

  useEffect(() => {
    if (authenticated) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.organizers) setOrganizers(data.organizers);
          if (data.qrcode) setQrcodeUrl(data.qrcode);
          if (data.event_date) setEventDate(data.event_date);
          if (data.location) setLocation(data.location);
        })
        .catch(() => {});
      fetchRegistrations();
      fetchSponsors();
    }
  }, [authenticated, fetchRegistrations, fetchSponsors]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('请输入管理员密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
      } else {
        setError(data.error || '密码错误');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '下载失败');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AIGC+宜宾_报名信息_${new Date().toISOString().slice(0, 10)}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleSponsorDownload = async () => {
    setDownloadingSponsors(true);
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'download' }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '下载失败');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AIGC+宜宾_赞助商信息_${new Date().toISOString().slice(0, 10)}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('下载失败，请重试');
    } finally {
      setDownloadingSponsors(false);
    }
  };

  const handleSaveOrganizers = async () => {
    if (!organizers.trim()) {
      setOrganizersMsg('联合主办方信息不能为空');
      return;
    }
    setSavingOrganizers(true);
    setOrganizersMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, key: 'organizers', value: organizers.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizersMsg('保存成功');
        setEditingOrganizers(false);
      } else {
        setOrganizersMsg(data.error || '保存失败');
      }
    } catch {
      setOrganizersMsg('网络错误，请重试');
    } finally {
      setSavingOrganizers(false);
    }
  };

  // 保存活动日期
  const saveEventDate = async () => {
    setSavingDate(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'event_date', value: eventDate, password }),
      });
      if (res.ok) {
        setEditingDate(false);
      }
    } catch {}
    setSavingDate(false);
  };

  // 保存活动地点
  const saveLocation = async () => {
    setSavingLocation(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'location', value: location, password }),
      });
      if (res.ok) {
        setEditingLocation(false);
      }
    } catch {}
    setSavingLocation(false);
  };

  const handleClear = async () => {
    if (clearPassword !== 'Nowey2024.9') {
      setClearError('密码错误，无法执行清除操作');
      return;
    }
    setClearing(true);
    setClearError('');
    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: clearPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations([]);
        setShowClearConfirm(false);
        setClearPassword('');
      } else {
        setClearError(data.error || '清除失败');
      }
    } catch {
      setClearError('网络错误，请重试');
    } finally {
      setClearing(false);
    }
  };

  const handleSponsorClear = async () => {
    if (sponsorClearPassword !== 'Nowey2024.9') {
      setSponsorClearError('密码错误，无法执行清除操作');
      return;
    }
    setClearingSponsors(true);
    setSponsorClearError('');
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: sponsorClearPassword, action: 'clear' }),
      });
      const data = await res.json();
      if (data.success) {
        setSponsors([]);
        setShowSponsorClear(false);
        setSponsorClearPassword('');
      } else {
        setSponsorClearError(data.error || '清除失败');
      }
    } catch {
      setSponsorClearError('网络错误，请重试');
    } finally {
      setClearingSponsors(false);
    }
  };

  const handleQrcodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验格式
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setQrMsg('仅支持 PNG、JPG 格式');
      return;
    }

    // 校验大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      setQrMsg('图片大小不能超过 5MB');
      return;
    }

    setUploadingQr(true);
    setQrMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const res = await fetch('/api/admin/upload-qrcode', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setQrcodeUrl(data.qrcode);
        setQrMsg('二维码上传成功');
      } else {
        setQrMsg(data.error || '上传失败');
      }
    } catch {
      setQrMsg('网络错误，请重试');
    } finally {
      setUploadingQr(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setError('');
    setRegistrations([]);
  };

  const roleBadge = (role: string) => {
    if (role === '学习者') {
      return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30';
    }
    return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30';
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#f59e0b]/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 mb-4">
              <Shield className="w-7 h-7 text-[#f59e0b]" />
            </div>
            <h1 className="text-xl font-bold text-[#f9fafb] mb-1">
              管理员登录
            </h1>
            <p className="text-sm text-[#6b7280]">
              请输入管理员密码以查看报名数据
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-6 space-y-4"
          >
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="请输入管理员密码"
                className="w-full rounded-lg border border-[#1f2937] bg-[#0a0f14] px-4 py-3 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none transition-all duration-300 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30"
              />
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
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
                  验证中...
                </>
              ) : (
                '确认登录'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回报名页面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#10b981]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto animate-fade-in-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#10b981]/10 border border-[#10b981]/30">
              <Shield className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#f9fafb]">管理员面板</h1>
              <p className="text-xs text-[#6b7280]">AIGC+宜宾</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              退出
            </button>
            <Link
              href="/"
              className="text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              首页
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {/* 活动信息卡片 */}
          <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#6b7280] mb-1">活动时间</p>
                {editingDate ? (
                  <div className="flex gap-2">
                    <input
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-md px-2 py-1 text-[#d1d5db] text-sm focus:border-[#10b981] focus:outline-none"
                    />
                    <button onClick={saveEventDate} disabled={savingDate} className="text-xs text-[#10b981] hover:text-[#34d399] whitespace-nowrap disabled:opacity-50">
                      {savingDate ? '保存中…' : '保存'}
                    </button>
                    <button onClick={() => { setEditingDate(false); }} className="text-xs text-[#6b7280] hover:text-[#9ca3af] whitespace-nowrap">取消</button>
                  </div>
                ) : (
                  <p className="text-[#d1d5db] cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => setEditingDate(true)} title="点击编辑">
                    {eventDate}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-[#6b7280] mb-1">活动地点</p>
                {editingLocation ? (
                  <div className="flex gap-2">
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-md px-2 py-1 text-[#d1d5db] text-sm focus:border-[#10b981] focus:outline-none"
                    />
                    <button onClick={saveLocation} disabled={savingLocation} className="text-xs text-[#10b981] hover:text-[#34d399] whitespace-nowrap disabled:opacity-50">
                      {savingLocation ? '保存中…' : '保存'}
                    </button>
                    <button onClick={() => { setEditingLocation(false); }} className="text-xs text-[#6b7280] hover:text-[#9ca3af] whitespace-nowrap">取消</button>
                  </div>
                ) : (
                  <p className="text-[#d1d5db] cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => setEditingLocation(true)} title="点击编辑">
                    {location}
                  </p>
                )}
              </div>
            </div>

            {/* 联合主办方 */}
            <div className="mt-4 pt-4 border-t border-[#1f2937]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#6b7280]">联合主办方</p>
                {!editingOrganizers && (
                  <button
                    onClick={() => {
                      setEditingOrganizers(true);
                      setOrganizersMsg('');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    编辑
                  </button>
                )}
              </div>
              {editingOrganizers ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={organizers}
                    onChange={(e) => setOrganizers(e.target.value)}
                    className="w-full rounded-lg border border-[#1f2937] bg-[#0a0f14] px-3 py-2 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveOrganizers}
                      disabled={savingOrganizers}
                      className="flex-1 rounded-lg bg-[#f59e0b] px-3 py-2 text-xs font-semibold text-[#0a0f14] hover:bg-[#d97706] disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {savingOrganizers ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingOrganizers(false);
                        setOrganizersMsg('');
                      }}
                      className="flex-1 rounded-lg border border-[#1f2937] px-3 py-2 text-xs text-[#9ca3af] hover:text-[#d1d5db]"
                    >
                      取消
                    </button>
                  </div>
                  {organizersMsg && (
                    <p className={`text-xs ${organizersMsg === '保存成功' ? 'text-[#10b981]' : 'text-red-400'}`}>
                      {organizersMsg}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#d1d5db]">{organizers || '未设置'}</p>
              )}
            </div>
          </div>

          {/* 二维码管理 */}
          <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-[#10b981]" />
              <span className="text-sm font-medium text-[#f9fafb]">活动群二维码</span>
              <span className="text-xs text-[#6b7280]">（上传后自动替换成功页面二维码）</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-white p-1 flex-shrink-0">
                <img
                  src={qrcodeUrl}
                  alt="当前二维码"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleQrcodeUpload}
                  className="hidden"
                  id="qrcode-upload"
                />
                <label
                  htmlFor="qrcode-upload"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                    uploadingQr
                      ? 'bg-[#1f2937] text-[#6b7280] cursor-not-allowed'
                      : 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20'
                  }`}
                >
                  {uploadingQr ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      选择文件上传
                    </>
                  )}
                </label>
                <p className="text-xs text-[#6b7280] mt-1">支持 PNG / JPG，不超过 5MB</p>
                {qrMsg && (
                  <p className={`text-xs mt-1 ${qrMsg.includes('成功') ? 'text-[#10b981]' : 'text-red-400'}`}>
                    {qrMsg.includes('成功') && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {qrMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 标签页切换 */}
          <div className="flex rounded-lg border border-[#1f2937] bg-[#0a0f14] p-1">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'registrations'
                  ? 'bg-[#10b981] text-[#0a0f14]'
                  : 'text-[#6b7280] hover:text-[#d1d5db]'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1.5" />
              报名信息
            </button>
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'sponsors'
                  ? 'bg-[#f59e0b] text-[#0a0f14]'
                  : 'text-[#6b7280] hover:text-[#d1d5db]'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-1.5" />
              赞助商
            </button>
          </div>

          {/* 报名信息表格 */}
          {activeTab === 'registrations' && (
          <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm font-medium text-[#f9fafb]">
                  报名信息
                </span>
                <span className="text-xs text-[#6b7280]">
                  ({registrations.length} 人)
                </span>
              </div>
              <button
                onClick={fetchRegistrations}
                disabled={loadingData}
                className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-5 w-5 text-[#6b7280]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">暂无报名数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#0a0f14]/50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">#</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">姓名</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">电话</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">角色</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">职业</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-[#6b7280] text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 text-[#f9fafb]">{r.name}</td>
                        <td className="px-4 py-2.5 text-[#d1d5db]">{r.phone}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs border ${roleBadge(r.role)}`}>
                            {r.role}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[#d1d5db]">{r.occupation}</td>
                        <td className="px-4 py-2.5 text-[#6b7280] text-xs">
                          {new Date(r.created_at).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* 赞助商表格 */}
          {activeTab === 'sponsors' && (
          <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-sm font-medium text-[#f9fafb]">赞助商</span>
                <span className="text-xs text-[#6b7280]">({sponsors.length} 家)</span>
              </div>
              <button
                onClick={fetchSponsors}
                disabled={loadingSponsors}
                className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSponsors ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
            {loadingSponsors ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-5 w-5 text-[#6b7280]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
                <Building2 className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">暂无赞助商数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#0a0f14]/50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">#</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">公司名称</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">联系人</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">电话</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">微信号</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6b7280]">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsors.map((s: any, i: number) => (
                      <tr key={s.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                        <td className="px-4 py-2.5 text-[#6b7280] text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 text-[#f9fafb]">{s.company_name}</td>
                        <td className="px-4 py-2.5 text-[#d1d5db]">{s.contact_name}</td>
                        <td className="px-4 py-2.5 text-[#d1d5db]">{s.phone}</td>
                        <td className="px-4 py-2.5 text-[#d1d5db]">{s.wechat}</td>
                        <td className="px-4 py-2.5 text-[#6b7280] text-xs">
                          {new Date(s.created_at).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* 操作按钮区 */}
          <div className="rounded-xl border border-[#1f2937] bg-[#111827]/80 backdrop-blur p-5 space-y-3">
            {activeTab === 'registrations' ? (
              <>
                {/* 下载报名数据 */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full rounded-lg bg-[#10b981] px-6 py-3 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#059669] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      正在生成 Word 文档...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      下载报名信息（Word格式）
                    </>
                  )}
                </button>

                {/* 清除数据 */}
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full rounded-lg border border-red-400/30 bg-transparent px-6 py-3 text-sm font-medium text-red-400 transition-all duration-300 hover:border-red-400/60 hover:bg-red-400/5 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    清除所有报名数据
                  </button>
                ) : (
                  <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 space-y-3">
                    <p className="text-sm text-red-400 font-medium">确认清除所有报名数据？此操作不可撤销。</p>
                    <p className="text-xs text-[#9ca3af]">请再次输入管理员密码以确认：</p>
                    <input
                      type="password"
                      value={clearPassword}
                      onChange={(e) => { setClearPassword(e.target.value); setClearError(''); }}
                      placeholder="再次输入管理员密码"
                      className="w-full rounded-lg border border-red-400/30 bg-[#0a0f14] px-4 py-2.5 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                    />
                    {clearError && <p className="text-red-400 text-xs">{clearError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleClear}
                        disabled={clearing || !clearPassword}
                        className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {clearing ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            清除中...
                          </>
                        ) : ('确认清除')}
                      </button>
                      <button
                        onClick={() => { setShowClearConfirm(false); setClearPassword(''); setClearError(''); }}
                        className="flex-1 rounded-lg border border-[#1f2937] px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#d1d5db] hover:border-[#374151]"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
              {/* 赞助商下载 */}
              <button
                onClick={handleSponsorDownload}
                disabled={downloadingSponsors}
                className="w-full rounded-lg bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#0a0f14] transition-all duration-300 hover:bg-[#d97706] hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {downloadingSponsors ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    正在生成 Word 文档...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    下载赞助商信息（Word格式）
                  </>
                )}
              </button>

                {/* 清除赞助商数据 */}
                {!showSponsorClear ? (
                  <button
                    onClick={() => setShowSponsorClear(true)}
                    className="w-full rounded-lg border border-red-400/30 bg-transparent px-6 py-3 text-sm font-medium text-red-400 transition-all duration-300 hover:border-red-400/60 hover:bg-red-400/5 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    清除所有赞助商数据
                  </button>
                ) : (
                  <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 space-y-3">
                    <p className="text-sm text-red-400 font-medium">确认清除所有赞助商数据？此操作不可撤销。</p>
                    <p className="text-xs text-[#9ca3af]">请再次输入管理员密码以确认：</p>
                    <input
                      type="password"
                      value={sponsorClearPassword}
                      onChange={(e) => { setSponsorClearPassword(e.target.value); setSponsorClearError(''); }}
                      placeholder="再次输入管理员密码"
                      className="w-full rounded-lg border border-red-400/30 bg-[#0a0f14] px-4 py-2.5 text-sm text-[#f9fafb] placeholder-[#6b7280] outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                    />
                    {sponsorClearError && <p className="text-red-400 text-xs">{sponsorClearError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSponsorClear}
                        disabled={clearingSponsors || !sponsorClearPassword}
                        className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {clearingSponsors ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            清除中...
                          </>
                        ) : ('确认清除')}
                      </button>
                      <button
                        onClick={() => { setShowSponsorClear(false); setSponsorClearPassword(''); setSponsorClearError(''); }}
                        className="flex-1 rounded-lg border border-[#1f2937] px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#d1d5db] hover:border-[#374151]"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

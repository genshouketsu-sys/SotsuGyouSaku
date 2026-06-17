import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import axios from 'axios';

function AdminSettingsModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notificationsEnabled: true,
  });
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null); // { type: 'success'|'error', message: string }

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setToast(null);
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      const data = response.data;
      setFormData(prev => ({
        ...prev,
        displayName: data.displayName || '',
        email:       data.email       || '',
        avatarUrl:   data.avatarUrl   || '',
      }));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  if (!isOpen) return null;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setToast(null);
    try {
      // 1. プロフィール更新 / 更新用户资料
      // PUT /api/user/profile（旧: POST /api/user/update-profile）
      await axios.put('/api/user/profile', {
        displayName: formData.displayName,
        email:       formData.email,
        avatarUrl:   formData.avatarUrl,
      });

      // 2. パスワード変更（入力がある場合のみ）/ 修改密码（有输入时才执行）
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showToast('error', t('passwordMismatch') || 'New passwords do not match');
          setLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          showToast('error', t('currentPasswordRequired') || 'Current password is required');
          setLoading(false);
          return;
        }
        // PUT /api/user/password（旧: POST /api/user/update-password）
        await axios.put('/api/user/password', {
          currentPassword: formData.currentPassword,
          newPassword:     formData.newPassword,
        });
      }

      showToast('success', t('settingsSaved') || 'Settings saved successfully');
      // パスワードフィールドをリセット / 重置密码字段
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
      }));
      // プロフィール更新イベントをブロードキャスト / 广播资料更新事件
      window.dispatchEvent(new CustomEvent('wms-profile-updated'));
      // 短いディレイ後にモーダルを閉じる / 短暂延迟后关闭弹窗
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('error', error.response?.data?.message || t('settingsFailed') || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-[#121414] border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden font-['Space_Grotesk'] animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* 装饰光晕 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bcf540]/5 rounded-full blur-[80px] pointer-events-none" />

        {/* ── トースト通知 / Toast 通知 ── */}
        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 relative z-10 ${
            toast.type === 'success'
              ? 'bg-[#bcf540]/10 text-[#bcf540] border border-[#bcf540]/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#bcf540]/10 border border-[#bcf540]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#bcf540]">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('editAdmin')}</h2>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">
                {t('adminSettingsDesc') || 'Profile & Security'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="space-y-6 relative z-10">

          {/* アバターセクション / 头像区域 */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#bcf540]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-16 h-16 rounded-full border-2 border-[#bcf540]/30 overflow-hidden bg-zinc-900 flex items-center justify-center p-[3px] group-hover/avatar:border-[#bcf540] transition-all">
                {formData.avatarUrl ? (
                  <img alt="User avatar" className="w-full h-full rounded-full object-cover" src={formData.avatarUrl} />
                ) : (
                  <span className="material-symbols-outlined text-zinc-700 text-3xl">person</span>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-black text-xs bg-[#bcf540] rounded-full p-1.5 shadow-lg">photo_camera</span>
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/10">Authorized Admin</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Node ID: <span className="font-mono text-[#bcf540]">ND-01-A</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('displayName') || 'Alias'}</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full h-[44px] px-4 bg-zinc-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#bcf540]/50 focus:border-[#bcf540] transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('emailAddress') || 'Email'}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[44px] px-4 bg-zinc-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#bcf540]/50 focus:border-[#bcf540] transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* セキュリティセクション / 安全设置区域 */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bcf540] text-[16px]">verified_user</span>
                {t('securitySettings') || 'Authentication Override'}
              </h3>
              <div className="space-y-4">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder={t('currentPassword') || 'Current Password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full h-[44px] px-4 bg-zinc-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#bcf540]/50 focus:border-[#bcf540] transition-all text-sm font-medium placeholder:text-zinc-800"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder={t('newPassword') || 'New Password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full h-[44px] px-4 bg-zinc-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#bcf540]/50 focus:border-[#bcf540] transition-all text-sm font-medium placeholder:text-zinc-800"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t('confirmPassword') || 'Confirm Password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-[44px] px-4 bg-zinc-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#bcf540]/50 focus:border-[#bcf540] transition-all text-sm font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* 通知設定 / 通知设置 */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('emailAlerts') || 'System Notifications'}</h3>
                <p className="text-[10px] text-zinc-500 font-medium">Auto-dispatch alerts for low-stock thresholds</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bcf540] peer-checked:after:bg-black" />
              </label>
            </div>
          </div>

          {/* アクションボタン / 操作按钮 */}
          <div className="pt-8 flex gap-4 justify-end border-t border-white/5">
            <button
              onClick={onClose}
              disabled={loading}
              className="h-[44px] px-6 rounded-xl text-xs font-bold text-zinc-500 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#bcf540] text-black h-[44px] px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#bcf540]/10 flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save_as</span>
              )}
              {t('saveChanges') || 'Apply Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsModal;

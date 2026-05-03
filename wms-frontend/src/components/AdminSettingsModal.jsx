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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      const data = response.data;
      setFormData(prev => ({
        ...prev,
        displayName: data.displayName || '',
        email: data.email || '',
        avatarUrl: data.avatarUrl || ''
      }));
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Update Profile (Base64 avatar included)
      await axios.post('/api/user/update-profile', {
        displayName: formData.displayName,
        email: formData.email,
        avatarUrl: formData.avatarUrl
      });

      // 2. Update Password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("New passwords do not match!");
          setLoading(false);
          return;
        }
        await axios.post('/api/user/update-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }

      alert("Settings saved successfully!");
      onClose();
      // Trigger a global event to refresh avatar in other components
      window.dispatchEvent(new CustomEvent('wms-profile-updated'));
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1e2020] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden font-['Space_Grotesk']"
        onClick={e => e.stopPropagation()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5ff4a]/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c5ff4a]/20 border border-[#c5ff4a]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#c5ff4a]">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('editAdmin')}</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{t('adminSettingsDesc') || 'Manage profile & security'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-16 h-16 rounded-full border-2 border-[#c5ff4a]/50 overflow-hidden bg-zinc-800 flex items-center justify-center group-hover:opacity-70 transition-opacity">
                {formData.avatarUrl ? (
                  <img alt="User profile" className="w-full h-full object-cover" src={formData.avatarUrl} />
                ) : (
                  <span className="material-symbols-outlined text-zinc-600 text-3xl">person</span>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-sm bg-black/50 rounded-full p-1">edit</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">Super Admin</span>
              </div>
              <p className="text-xs text-zinc-400">Node ID: <span className="font-mono text-zinc-300">ND-01-A</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('displayName') || 'Display Name'}</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('emailAddress') || 'Email Address'}</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] focus:border-transparent transition-all"
              />
            </div>

            {/* Security Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c5ff4a] text-[18px]">lock</span>
                {t('securitySettings') || 'Security Settings'}
              </h3>
              
              <div className="space-y-1">
                <input 
                  type="password" 
                  name="currentPassword"
                  placeholder={t('currentPassword') || 'Current Password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] placeholder-zinc-600 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="password" 
                  name="newPassword"
                  placeholder={t('newPassword') || 'New Password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] placeholder-zinc-600 text-sm"
                />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder={t('confirmPassword') || 'Confirm Password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] placeholder-zinc-600 text-sm"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">{t('emailAlerts') || 'System Email Alerts'}</h3>
                <p className="text-xs text-zinc-500">Receive notifications for low stock</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="notificationsEnabled"
                  checked={formData.notificationsEnabled} 
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5ff4a]"></div>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-3 justify-end border-t border-white/10">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#c5ff4a] text-black px-6 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {t('saveChanges') || 'saveChanges'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsModal;


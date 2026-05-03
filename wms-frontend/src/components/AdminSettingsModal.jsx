import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

function AdminSettingsModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    displayName: 'Admin Node-01',
    email: 'admin.node01@omni-wms.local',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notificationsEnabled: true,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    // Simulate save
    alert("Admin settings saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1e2020] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden font-['Space_Grotesk']"
        onClick={e => e.stopPropagation()}
      >
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
            <div className="relative group cursor-pointer">
              <img 
                alt="User profile" 
                className="w-16 h-16 rounded-full border-2 border-[#c5ff4a]/50 object-cover group-hover:opacity-50 transition-opacity" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYNj53lBGrxai69qsW3mDAsRrXKoTv5SbjVvId_9fOVPJtFyH40YjbExepiZ_oR6R3MJGPLWDceB_9b-_nirk0_NNZZKLxbYWSLT5_o_ZFtRD0ml4qodNXu7nC4KJZNDtJgwnxQW2bi6IAFvdE2Fxz6O3Q2vjDD_3ek-_z3JQto5Vv8ga0-TFrurSkkGTC3p6O5cnj6Gbvy6F2eGeXFCBmR1ct49nJO9UZt72sk1W5jSUpSHA5E6rc0rhFTq2yaOWEhQrQtWz8MxcR" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">edit</span>
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSave}
              className="bg-[#c5ff4a] text-black px-6 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {t('saveChanges') || 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsModal;

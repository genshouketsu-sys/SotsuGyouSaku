import React, { useState, useEffect } from 'react';
import { useTranslation } from './i18n/LanguageContext';

function EditProductModal({ isOpen, onClose, onEdit, initialData }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: null,
    skuCode: '',
    name: '',
    barcode: '',
    stock: 0,
    dailyUsage: 0.0,
    leadTimeDays: 7,
    safetyStock: 10
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        skuCode: initialData.skuCode || '',
        name: initialData.name || '',
        barcode: initialData.barcode || '',
        stock: initialData.stock || 0,
        dailyUsage: initialData.dailyUsage || 0.0,
        leadTimeDays: initialData.leadTimeDays || 7,
        safetyStock: initialData.safetyStock || 10
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'leadTimeDays' || name === 'safetyStock' 
        ? parseInt(value) || 0 
        : name === 'dailyUsage' 
          ? parseFloat(value) || 0.0 
          : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] rounded-xl border border-[#27272a] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-['Space_Grotesk']">
        <div className="px-6 py-4 border-b border-[#27272a] flex justify-between items-center bg-[#1a1a1a]">
          <h2 className="text-xl font-bold text-[#f4f4f5]">{t('editProduct')}</h2>
          <button 
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="skuCode" className="block text-sm font-medium text-[#a1a1aa]">{t('skuCode')} <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="skuCode" 
              name="skuCode" 
              required
              value={formData.skuCode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              placeholder="e.g. SKU-10049"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-[#a1a1aa]">{t('productName')} <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              placeholder="e.g. Mechanical Keyboard"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="barcode" className="block text-sm font-medium text-[#a1a1aa]">{t('barcode')} <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              id="barcode" 
              name="barcode" 
              required
              value={formData.barcode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              placeholder="e.g. 8901234567894"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="stock" className="block text-sm font-medium text-[#a1a1aa]">{t('initialStock')}</label>
              <input 
                type="number" 
                id="stock" 
                name="stock" 
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dailyUsage" className="block text-sm font-medium text-[#a1a1aa]">{t('dailyUsage')}</label>
              <input 
                type="number" 
                id="dailyUsage" 
                name="dailyUsage" 
                step="0.1"
                min="0"
                value={formData.dailyUsage}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="leadTimeDays" className="block text-sm font-medium text-[#a1a1aa]">{t('leadTimeDays')}</label>
              <input 
                type="number" 
                id="leadTimeDays" 
                name="leadTimeDays" 
                min="0"
                value={formData.leadTimeDays}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="safetyStock" className="block text-sm font-medium text-[#a1a1aa]">{t('safetyStock')}</label>
              <input 
                type="number" 
                id="safetyStock" 
                name="safetyStock" 
                min="0"
                value={formData.safetyStock}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-[#27272a] rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-[#27272a] rounded-lg text-[#f4f4f5] font-medium hover:bg-[#27272a] transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#ccff00] text-black rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {t('updateProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
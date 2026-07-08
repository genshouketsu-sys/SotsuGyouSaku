import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import BarcodeLookupModal from '../components/BarcodeLookupModal';
import { useTranslation } from '../i18n/LanguageContext';

function ProductCatalog() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [highlightedBarcode, setHighlightedBarcode] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');

      // 将后端返回的真实数据展示
      const backendData = response.data.map(p => ({
        ...p,
        category: 'General Category',
        image: null
      }));

      setProducts([...backendData]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please ensure the backend server is running on http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (newProductData) => {
    try {
      const response = await axios.post('/api/products', newProductData);
      if (response.data.success || response.status === 200) {
        setIsAddModalOpen(false);
        // 重新获取列表
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBarcodeFound = (barcode) => {
    setSearchTerm(barcode);
    setHighlightedBarcode(barcode);
    setCurrentPage(1);
    setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    setTimeout(() => setHighlightedBarcode(null), 3000);
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const response = await axios.put(`/api/products/${updatedData.id}`, updatedData);
      if (response.data.success || response.status === 200) {
        setIsEditModalOpen(false);
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await axios.delete(`/api/products/${id}`);
      if (response.data.success || response.status === 200) {
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Name', 'Barcode', 'Stock', 'Create Time'];

    // Barcode を Excel に数値として解釈させないためテキスト強制 (="...") を使う
    // Excelが長い数字を科学計数法で表示するのを防ぐ
    const formatBarcode = (barcode) => {
      if (!barcode) return '';
      return `="` + String(barcode).replace(/"/g, '""') + `"`;
    };

    // createTime は Java の LocalDateTime が JSON 配列 [y,mo,d,h,mi,s,ns] として来る場合がある
    const formatCreateTime = (timeInput) => {
      if (!timeInput) return '';
      let result;
      if (Array.isArray(timeInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = timeInput;
        result = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second).padStart(2,'0')}`;
      } else {
        const date = new Date(timeInput);
        if (isNaN(date.getTime())) return String(timeInput);
        result = date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0') + ' ' +
          String(date.getHours()).padStart(2, '0') + ':' +
          String(date.getMinutes()).padStart(2, '0') + ':' +
          String(date.getSeconds()).padStart(2, '0');
      }
      // CSV内でコンマや改行が含まれないようにダブルクォートで囲む
      return `"${result}"`;
    };

    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p =>
        [
          p.id,
          p.skuCode ? `"${String(p.skuCode).replace(/"/g, '""')}"` : '',
          p.name ? `"${String(p.name).replace(/"/g, '""')}"` : '',
          formatBarcode(p.barcode),
          p.stock ?? '',
          formatCreateTime(p.createTime)
        ].join(',')
      )
    ].join('\n');

    
    // '\uFEFF' は UTF-8 BOM。これがないと Excel が文字コードを誤認識し乱码になる。
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Data transformation
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.skuCode && p.skuCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStock = stockFilter === 'all' ? true : (stockFilter === 'low' ? p.stock < 20 : true);
    return matchesSearch && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter/search change
  }, [searchTerm, stockFilter]);

  // LocalDateTime の書式化 / 格式化 LocalDateTime
  // 配列形式 [y,mo,d,h,mi,s,ns] または ISO 文字列 "2024-05-15T11:30:45" を扱う
  const formatDateTime = (timeInput) => {
    if (!timeInput) return '-';

    // 旧形式: Java LocalDateTime → JSON 配列
    if (Array.isArray(timeInput)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = timeInput;
      return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ` +
             `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second).padStart(2,'0')}`;
    }

    // 新形式: ISO-8601 文字列 "2024-05-15T11:30:45"
    // new Date() は UTC として解析するためタイムゾーンずれが起こる → 直接パース
    const str = String(timeInput);
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
    }

    // フォールバック
    const date = new Date(timeInput);
    if (isNaN(date.getTime())) return str;
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' +
      String(date.getSeconds()).padStart(2, '0');
  };


  return (
    <div className="w-full font-['Space_Grotesk'] relative min-h-[calc(100vh-64px)]" style={{ color: 'var(--color-text-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{t('productCatalog')}</h1>
            <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your inventory products, SKUs, and stock levels.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded font-medium hover:brightness-110 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t('addNewProduct')}
          </button>
        </div>

        <div className="backdrop-blur-md rounded-xl p-4 mb-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-text-muted)' }}>search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] focus:border-transparent transition-shadow text-sm" 
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border-input)', color: 'var(--color-text-primary)' }}
                placeholder={t('searchPlaceholder')}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="flex items-center gap-2 px-4 h-[44px] rounded-lg text-sm font-medium hover:opacity-80 transition-colors w-full sm:w-auto justify-center"
                style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
              >
                <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                スキャン
              </button>
              <button 
                onClick={() => setStockFilter(prev => prev === 'all' ? 'low' : 'all')}
                className="flex items-center gap-2 px-4 h-[44px] rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                style={stockFilter === 'low' 
                  ? { border: '1px solid var(--color-accent)', color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-bg)' }
                  : { border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                {stockFilter === 'low' ? t('lowStockOnly') : t('allStock')}
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 h-[44px] rounded-lg text-sm font-medium hover:opacity-80 transition-colors w-full sm:w-auto justify-center"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {t('export')}
              </button>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto min-h-[680px]">
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ backgroundColor: 'var(--color-bg-table-head)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-16" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>
                    <input 
                      className="rounded bg-transparent" 
                      style={{ borderColor: 'var(--color-border-input)', accentColor: 'var(--color-accent)' }}
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-40" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('skuCode')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('name')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-48" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('barcode')}</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider w-32" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('currentStock')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-56" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('createTime')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-28" scope="col" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-faint)' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        {t('loading')}
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      {t('noProducts')}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      ref={product.barcode === highlightedBarcode ? highlightRef : null}
                      className={`transition-colors group h-[72px] ${product.barcode === highlightedBarcode ? 'ring-1 ring-[#c5ff4a]/40' : ''}`}
                      style={{ borderBottom: '1px solid var(--color-border-faint)', backgroundColor: product.barcode === highlightedBarcode ? 'var(--color-accent-bg)' : undefined }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = product.barcode === highlightedBarcode ? 'var(--color-accent-bg)' : ''}
                    >
                      <td className="px-6 py-2 whitespace-nowrap">
                        <input 
                          className="rounded bg-transparent" 
                          style={{ borderColor: 'var(--color-border-input)', accentColor: 'var(--color-accent)' }}
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {product.skuCode || '-'}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-faint)' }}>
                            {product.image ? (
                              <img alt="Product thumbnail" className="h-full w-full object-cover" src={product.image}/>
                            ) : (
                              <span className="material-symbols-outlined opacity-50" style={{ color: 'var(--color-text-muted)' }}>image</span>
                            )}
                          </div>
                          <div className="ml-4 max-w-[240px]">
                            <div className="text-sm font-medium break-words whitespace-normal leading-tight line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{product.name || '-'}</div>
                            <div className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{product.category || 'General Category'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        {product.barcode || '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-right font-medium" style={{ color: product.stock < 20 ? '#dc2626' : 'var(--color-text-primary)' }}>
                        {product.stock || 0}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDateTime(product.createTime)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex justify-start gap-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="hover:opacity-80 transition-colors p-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 h-[64px] flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-table-head)', borderTop: '1px solid var(--color-border)' }}>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('showing')} <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> {t('to')} <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> {t('of')} <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{filteredProducts.length}</span> {t('results')}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 h-[36px] rounded-lg text-sm font-medium disabled:opacity-30 hover:opacity-80 transition-colors flex items-center"
                style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              >
                {t('previous')}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="px-4 h-[36px] rounded-lg text-sm font-medium hover:opacity-80 transition-colors disabled:opacity-30 flex items-center"
                style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              >
                {t('next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProduct} 
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEditSubmit}
        initialData={productToEdit}
      />

      <BarcodeLookupModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onBarcodeFound={(barcode) => {
          setIsScanModalOpen(false);
          handleBarcodeFound(barcode);
        }}
      />
    </div>
  );
}

export default ProductCatalog;
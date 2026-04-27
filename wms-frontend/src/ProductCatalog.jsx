import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProductModal from './AddProductModal';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/products');

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
      const response = await axios.post('http://localhost:8080/api/products', newProductData);
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

  const formatDateTime = (timeInput) => {
    if (!timeInput) return '-';
    
    if (Array.isArray(timeInput)) {
      const [year, month, day, hour = 0, minute = 0] = timeInput;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    const date = new Date(timeInput);
    if(isNaN(date.getTime())) return timeInput;
    
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0');
  };

  return (
    <div className="bg-transparent text-[#e2e2e2] w-full font-['Space_Grotesk'] relative min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Product Catalog</h1>
            <p className="text-zinc-400 mt-1">Manage your inventory products, SKUs, and stock levels.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#c5ff4a] text-black px-5 py-2.5 rounded font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Product
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-zinc-500">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg bg-zinc-950/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] focus:border-transparent transition-shadow sm:text-sm" 
                placeholder="Search by SKU, Name, or Barcode..." 
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center text-white">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center text-white">
                <span className="material-symbols-outlined text-sm">download</span>
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-[#0c0f0f]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider w-10" scope="col">
                    <input className="rounded border-white/20 text-[#c5ff4a] focus:ring-[#c5ff4a] bg-transparent" type="checkbox"/>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">SKU Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">Barcode</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">Current Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">Create Time</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                      No products found in the database.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input className="rounded border-white/20 text-[#c5ff4a] focus:ring-[#c5ff4a] bg-transparent" type="checkbox"/>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {product.skuCode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-[#0c0f0f]/50 rounded-md border border-white/10 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img alt="Product thumbnail" className="h-full w-full object-cover" src={product.image}/>
                            ) : (
                              <span className="material-symbols-outlined text-zinc-500 opacity-50">image</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{product.name || '-'}</div>
                            <div className="text-xs text-zinc-500">{product.category || 'General Category'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 font-mono">
                        {product.barcode || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${product.stock < 20 ? 'text-red-500' : 'text-white'}`}>
                        {product.stock || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                        {formatDateTime(product.createTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-zinc-500 hover:text-white transition-colors p-1">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button className="text-zinc-500 hover:text-red-500 transition-colors p-1 ml-2">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Showing <span className="font-medium text-white">{Math.min(products.length, 1)}</span> to <span className="font-medium text-white">{Math.min(products.length, 10)}</span> of <span className="font-medium text-white">{products.length}</span> results
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-white/10 rounded bg-white/5 text-sm font-medium disabled:opacity-50 text-white" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-white/10 rounded bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors text-white">
                Next
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
    </div>
  );
}

export default ProductCatalog;
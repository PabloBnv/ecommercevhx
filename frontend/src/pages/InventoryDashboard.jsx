import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Package, Upload, Download, Plus, Edit2, Trash2, BarChart3, AlertCircle, FileText, FileSpreadsheet, FileJson, Search } from 'lucide-react';
import DashboardChat from '../components/DashboardChat';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [exportFormat, setExportFormat] = useState('csv');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.admin.getProducts();
      const allProds = Array.isArray(data) ? data : (data.content || []);
      setProducts(allProds);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      if (product.id) {
        await api.admin.updateProduct(product.id, product);
      } else {
        await api.admin.createProduct(product);
      }
      setShowModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.admin.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      await api.admin.updateProduct(productId, { ...product, stock: parseInt(newStock) || 0 });
      loadProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'Imagen'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.description || ''}"`,
      p.price,
      p.stock ?? 0,
      `"${p.category?.name || ''}"`,
      `"${p.imageUrl || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'inventario.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map(p => ({
        id: p.id, name: p.name, description: p.description,
        price: p.price, stock: p.stock, category: p.category?.name
      }))
    };
    downloadFile(JSON.stringify(data, null, 2), 'inventario.json', 'application/json');
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Nombre', 'Descripción', 'Precio (ARS)', 'Stock', 'Categoría'];
    const rows = products.map(p => [
      p.id, `"${p.name}"`, `"${p.description || ''}"`,
      p.price?.toFixed(2), p.stock ?? 0, `"${p.category?.name || ''}"`
    ]);
    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    downloadFile(content, 'inventario.xls', 'application/vnd.ms-excel');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const handleExport = () => {
    if (exportFormat === 'csv') exportToCSV();
    else if (exportFormat === 'json') exportToJSON();
    else if (exportFormat === 'excel') exportToExcel();
  };

  // Import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      let productsToImport = [];
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          productsToImport = Array.isArray(data) ? data : data.products || [];
        } catch { alert('Error al leer JSON'); return; }
      } else {
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const product = {};
          headers.forEach((header, idx) => {
            if (header === 'precio' || header === 'price') product.price = parseFloat(values[idx]) || 0;
            else if (header === 'stock') product.stock = parseInt(values[idx]) || 0;
            else product[header === 'nombre' ? 'name' : header] = values[idx]?.trim() || '';
          });
          if (product.name) productsToImport.push(product);
        }
      }
      let ok = 0, err = 0;
      for (const p of productsToImport) {
        try {
          await api.admin.createProduct({
            name: p.name || p.nombre || 'Sin nombre',
            description: p.description || p.descripcion || '',
            price: p.price || p.precio || 0,
            stock: p.stock || 0,
            imageUrl: p.imageUrl || p.imagen || ''
          });
          ok++;
        } catch { err++; }
      }
      alert(`Importación: ${ok} exitosos, ${err} errores`);
      loadProducts();
      setShowImport(false);
    };
    reader.readAsText(file);
  };

  // Metrics
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
  const lowStockProducts = products.filter(p => p.stock != null && p.stock > 0 && p.stock < 10).length;
  const outOfStock = products.filter(p => p.stock === 0 || p.stock === null).length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encargado de Inventario</h1>
          <p className="text-gray-600">Gestiona tu inventario, productos y stock</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm">Total productos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-slate-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Stock total</p>
              <p className="text-2xl font-bold">{totalStock}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Valor total</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString('es-AR')}</p>
            </div>
            <FileText className="w-8 h-8 text-cyan-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Stock bajo</p>
              <p className="text-2xl font-bold">{lowStockProducts}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Sin stock</p>
              <p className="text-2xl font-bold">{outOfStock}</p>
            </div>
            <Package className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'products', label: 'Productos' },
          { key: 'import', label: 'Importar' },
          { key: 'export', label: 'Exportar' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.key ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Import Section */}
      {activeTab === 'import' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Importar Productos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-slate-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium text-gray-700 mb-2">Importar desde archivo</p>
              <p className="text-sm text-gray-500 mb-4">CSV o JSON</p>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv,.json" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Seleccionar archivo
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium text-gray-700 mb-2">Agregar un producto</p>
              <p className="text-sm text-gray-500 mb-4">Cargar manualmente</p>
              <button onClick={() => { setEditingProduct({}); setShowModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Nuevo producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Section */}
      {activeTab === 'export' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Exportar Inventario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { format: 'csv', label: 'CSV', desc: 'Hoja de cálculo', color: 'green' },
              { format: 'excel', label: 'Excel', desc: 'Formato XLS', color: 'blue' },
              { format: 'json', label: 'JSON', desc: 'Datos estructurados', color: 'orange' }
            ].map(item => (
              <button
                key={item.format}
                onClick={() => { setExportFormat(item.format); handleExport(); }}
                className={`flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-${item.color}-50 hover:border-${item.color}-500 transition-all`}
              >
                {item.format === 'json' ? <FileJson className={`w-12 h-12 text-${item.color}-600 mb-3`} /> : <FileSpreadsheet className={`w-12 h-12 text-${item.color}-600 mb-3`} />}
                <p className="font-semibold text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <button
              onClick={() => { setEditingProduct({}); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width="300"
                      height="300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'Sin categoría'}</p>
                  <p className="text-lg font-bold text-slate-600 mb-2">${product.price?.toLocaleString('es-AR')}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={product.stock ?? 0}
                      onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      min="0"
                    />
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.stock == null ? 'bg-gray-100 text-gray-700' :
                      product.stock > 10 ? 'bg-slate-100 text-slate-700' :
                      product.stock > 0 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock == null ? 'N/A' : product.stock === 0 ? 'Sin stock' : product.stock < 10 ? 'Bajo' : 'OK'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}

      <DashboardChat role="INVENTORY" />
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {product?.id ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Descripción"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Precio"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock ?? ''}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <input
            type="text"
            placeholder="URL de imagen"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-slate-600 text-white py-2 rounded-lg">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryDashboard;

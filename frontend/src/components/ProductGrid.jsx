import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import ProductCard from './ProductCard';
import { ChevronDown, Search, X } from 'lucide-react';
import { api } from '../services/api';

const ProductGrid = memo(() => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    api.products.getAll()
      .then(productsData => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        const uniqueCategories = [...new Set((Array.isArray(productsData) ? productsData : []).map(p => p.category?.name).filter(Boolean))];
        setCategories(uniqueCategories.sort());
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?.name === selectedCategory);
    }

    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortOption) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return result;
    }
  }, [products, searchQuery, selectedCategory, priceRange, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortOption]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSortOption('default');
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000;

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] xl:grid-cols-[320px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-6 sticky top-24 h-96">
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
            </div>
          </aside>
          <main className="min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                  <div className="aspect-square bg-gray-200 animate-pulse" style={{ aspectRatio: '1/1' }}></div>
                  <div className="p-4 space-y-3">
                    <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="animate-pulse bg-gray-200 h-3 rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="animate-pulse bg-gray-200 h-6 rounded w-20"></div>
                      <div className="animate-pulse bg-gray-200 h-8 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] xl:grid-cols-[320px_1fr] gap-8">
        {/* Left Sidebar - Filters - Always reserve space to prevent CLS */}
        <aside className="hidden lg:block">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-6 sticky top-24">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-h-[80px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 h-10"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de precio</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Mín"
                />
                <span className="text-gray-500 text-sm">—</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Máx"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">${priceRange[0]} - ${priceRange[1]}</p>
            </div>

            {/* Quick Price Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precios rápidos</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hasta $1,000', max: 1000 },
                  { label: '$1k-$3k', min: 1000, max: 3000 },
                  { label: '$3k-$5k', min: 3000, max: 5000 },
                  { label: '+$5,000', min: 5000, max: 100000 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPriceRange([preset.min || 0, preset.max || 10000])}
                    className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-slate-50 hover:border-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Main Content - Products */}
        <main className="min-w-0">
          {/* Mobile Filter Toggle - Fixed height to prevent CLS */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl mb-4 h-[52px]"
          >
            <span className="text-sm font-medium text-gray-700">Filtros</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Filters - Fixed min-height */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:hidden mb-6 p-4 bg-white border border-gray-200 rounded-xl space-y-4`} style={{ minHeight: showFilters ? '400px' : '0px' }}>
            {/* Mobile Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Category */}
            <div className="min-h-[70px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 h-10"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Mobile Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de precio</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Mín"
                />
                <span className="text-gray-500 text-sm">—</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Máx"
                />
              </div>
            </div>

            {/* Mobile Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Header with count and sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span> productos encontrados
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Ordenar:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
                >
                  <option value="default">Por defecto</option>
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio: ↑</option>
                  <option value="price-desc">Precio: ↓</option>
                  <option value="name-asc">Nombre: A-Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index === 0} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => goToPage(i + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-slate-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No se encontraron productos con los filtros seleccionados.</p>
              <button
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
});

export default ProductGrid;

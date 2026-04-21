import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import ProductCard from './ProductCard';
import { ChevronDown, Search, X, Grid, List, SlidersHorizontal } from 'lucide-react';
import { products as allProductsData, categories } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const ProductGrid = memo(() => {
  const { theme } = useTheme();
  
  const [products] = useState(allProductsData);
  const [loading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(300);
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [viewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  const PRODUCTS_PER_PAGE = 12;

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const allColors = useMemo(() => [...new Set(products.flatMap(p => p.colors || []))].sort(), [products]);
  const allSizes = useMemo(() => [...new Set(products.flatMap(p => p.sizes || []))].sort(), [products]);
  const allBadges = useMemo(() => [...new Set(products.map(p => p.badge).filter(Boolean))].sort(), [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }

    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    }

    if (selectedBadges.length > 0) {
      result = result.filter(p => p.badge && selectedBadges.includes(p.badge));
    }

    result = result.filter(p => p.price >= priceMin && p.price <= priceMax);

    if (stockFilter === 'in-stock') {
      result = result.filter(p => p.stock > 0);
    } else if (stockFilter === 'low-stock') {
      result = result.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(p => p.stock === 0);
    }

    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedColors, selectedSizes, selectedBadges, priceMin, priceMax, stockFilter, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrands, selectedColors, selectedSizes, selectedBadges, priceMin, priceMax, stockFilter, sortOption]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBadges([]);
    setPriceMin(0);
    setPriceMax(300);
    setStockFilter('all');
    setSortOption('default');
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedBrands.length > 0 || 
    selectedColors.length > 0 || selectedSizes.length > 0 || selectedBadges.length > 0 || 
    priceMin > 0 || priceMax < 300 || stockFilter !== 'all';

  const toggleArrayFilter = useCallback((arr, setArr, value) => {
    if (arr.includes(value)) {
      setArr(arr.filter(v => v !== value));
    } else {
      setArr([...arr, value]);
    }
  }, []);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const FilterSection = ({ title, children }) => (
    <div className="mb-5">
      <h4 className="text-sm font-semibold mb-2" style={{ color: theme.colors.text }}>{title}</h4>
      {children}
    </div>
  );

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 py-1 cursor-pointer hover:opacity-80">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded" style={{ accentColor: theme.colors.accent }} />
      <span className="text-sm" style={{ color: theme.colors.text }}>{label}</span>
    </label>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: theme.colors.text }}>Catálogo</h2>
          <p style={{ color: theme.colors.textSecondary }}>{filteredProducts.length} productos</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}>
            <option value="default">Por defecto</option>
            <option value="price-asc">Precio: ↑</option>
            <option value="price-desc">Precio: ↓</option>
            <option value="name-asc">Nombre: A-Z</option>
            <option value="newest">Novedades</option>
          </select>
          
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid ' + theme.colors.border }}>
            <button onClick={() => {}} className="p-2" style={{ backgroundColor: viewMode === 'grid' ? theme.colors.accent : 'transparent', color: viewMode === 'grid' ? theme.colors.buttonText : theme.colors.textSecondary }}>
              <Grid className="w-5 h-5" />
            </button>
            <button onClick={() => {}} className="p-2" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.textSecondary }}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl p-6 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2" style={{ color: theme.colors.text }}>
                <SlidersHorizontal className="w-5 h-5" />Filtros
              </h3>
              {hasActiveFilters && <button onClick={clearFilters} className="text-sm underline" style={{ color: '#ef4444' }}>Limpiar</button>}
            </div>

            <FilterSection title="Buscar">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nombre, marca..." className="w-full pl-10 pr-4 py-2 rounded-xl text-sm" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }} />
              </div>
            </FilterSection>

            <FilterSection title="Categoría">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}>
                <option value="all">Todas</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FilterSection>

            <FilterSection title={"Precio ($" + priceMin + " - $" + priceMax + ")"}>
              <div className="space-y-3">
                <input type="range" min="0" max="300" value={priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value))} className="w-full" style={{ accentColor: theme.colors.accent }} />
                <div className="flex gap-2">
                  <input type="number" value={priceMin} onChange={(e) => setPriceMin(parseInt(e.target.value) || 0)} className="w-1/2 px-3 py-2 rounded-xl text-sm text-center" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }} placeholder="Min" />
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value) || 300)} className="w-1/2 px-3 py-2 rounded-xl text-sm text-center" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }} placeholder="Max" />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Marca">
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allBrands.map(brand => <Checkbox key={brand} label={brand} checked={selectedBrands.includes(brand)} onChange={() => toggleArrayFilter(selectedBrands, setSelectedBrands, brand)} />)}
              </div>
            </FilterSection>

            <FilterSection title="Color">
              <div className="flex flex-wrap gap-2">
                {allColors.map(color => (
                  <button key={color} onClick={() => toggleArrayFilter(selectedColors, setSelectedColors, color)} className="px-3 py-1 rounded-full text-xs transition-all" style={{ backgroundColor: selectedColors.includes(color) ? theme.colors.accent : theme.colors.bgSecondary, color: selectedColors.includes(color) ? theme.colors.buttonText : theme.colors.text, border: '1px solid ' + theme.colors.border }}>
                    {color}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Talla">
              <div className="flex flex-wrap gap-2">
                {allSizes.map(size => (
                  <button key={size} onClick={() => toggleArrayFilter(selectedSizes, setSelectedSizes, size)} className="w-10 h-10 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: selectedSizes.includes(size) ? theme.colors.accent : theme.colors.bgSecondary, color: selectedSizes.includes(size) ? theme.colors.buttonText : theme.colors.text, border: '1px solid ' + theme.colors.border }}>
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Tipo">
              <div className="space-y-1">
                {allBadges.map(badge => <Checkbox key={badge} label={badge} checked={selectedBadges.includes(badge)} onChange={() => toggleArrayFilter(selectedBadges, setSelectedBadges, badge)} />)}
              </div>
            </FilterSection>

            <FilterSection title="Disponibilidad">
              <div className="space-y-1">
                {[{ value: 'all', label: 'Todos' }, { value: 'in-stock', label: 'En stock' }, { value: 'low-stock', label: 'Bajo stock (≤10)' }, { value: 'out-of-stock', label: 'Sin stock' }].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="stock" checked={stockFilter === opt.value} onChange={() => setStockFilter(opt.value)} className="w-4 h-4" style={{ accentColor: theme.colors.accent }} />
                    <span className="text-sm" style={{ color: theme.colors.text }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        <main>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-square animate-pulse" style={{ backgroundColor: theme.colors.bgSecondary }} />
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl font-medium disabled:opacity-50" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text }}>Anterior</button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className="w-10 h-10 rounded-xl font-medium" style={{ backgroundColor: currentPage === i + 1 ? theme.colors.accent : theme.colors.bgSecondary, color: currentPage === i + 1 ? theme.colors.buttonText : theme.colors.text }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl font-medium disabled:opacity-50" style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text }}>Siguiente</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl font-medium mb-4" style={{ color: theme.colors.text }}>No hay productos con esos filtros</p>
              <button onClick={clearFilters} className="px-6 py-3 rounded-xl font-medium" style={{ backgroundColor: theme.colors.accent, color: theme.colors.buttonText }}>Limpiar filtros</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
});

export default ProductGrid;

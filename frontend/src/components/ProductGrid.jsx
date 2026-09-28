import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import ProductDetailModal from './ProductDetailModal';
import { SearchIcon, XIcon, AlertCircleIcon, SparklesIcon } from './Icons';

export default function ProductGrid({
  categories: propCategories,
  onRequireAuth,
  selectedCategory,
  onSelectCategory,
  isSearchOpen,
  onCloseSearch,
  onNotify
}) {
  const [products, setProducts] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const categories = propCategories && propCategories.length > 0 ? propCategories : localCategories;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const searchInputRef = useRef(null);

  // Load fallback categories if not provided via props
  useEffect(() => {
    if (propCategories && propCategories.length > 0) return;
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await api.categories.getAll();
        if (isMounted && res && res.data) {
          setLocalCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories in ProductGrid:', err.message);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [propCategories]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Focus search when triggered from navbar
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Fetch all products from real backend
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 100 };
      if (selectedCategory) {
        if (/^[1-9]\d*$/.test(String(selectedCategory))) {
          params.category_id = String(selectedCategory);
        } else if (categories.length > 0) {
          const matched = categories.find(
            (c) => c.name.toLowerCase() === String(selectedCategory).toLowerCase()
          );
          if (matched) {
            params.category_id = String(matched.id);
          }
        }
      }
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.products.getAll(params);
      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
      setError('Unable to load catalog. Please ensure the backend service is operational.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch, categories]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-desc':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, sortBy]);

  return (
    <section id="catalog" className="catalog-section" aria-label="Catalog Collection">
      {/* Section Header */}
      <div className="catalog-header-block">
        <div className="catalog-title-wrapper">
          <span className="catalog-eyebrow">
            <SparklesIcon size={14} className="eyebrow-sparkle" />
            CURATED CATALOG
          </span>
          <h2 className="catalog-heading">Curated Product Catalog</h2>
          <p className="catalog-subheading">
            Precision electronics, heavyweight apparel, handcrafted leather, and interior living essentials.
          </p>
        </div>
      </div>

      {/* Modern Catalog Toolbar */}
      <div className="catalog-toolbar">
        {/* Category Navigation Pills */}
        <nav className="catalog-category-tabs" aria-label="Department filter">
          <button
            type="button"
            className={`category-tab-link ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => onSelectCategory('')}
            aria-pressed={selectedCategory === ''}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-tab-link ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => onSelectCategory(String(cat.id))}
              aria-pressed={String(selectedCategory) === String(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Right Controls: Sort & Search */}
        <div className="catalog-controls-group">
          {/* Search Box */}
          <div className="toolbar-search-wrap">
            <SearchIcon size={16} className="toolbar-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products or categories…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-search-input"
              aria-label="Search catalog collection"
            />
            {searchTerm && (
              <button
                type="button"
                className="toolbar-search-clear"
                onClick={() => {
                  setSearchTerm('');
                  if (onCloseSearch) onCloseSearch();
                }}
                aria-label="Clear search"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="toolbar-sort-wrap">
            <label htmlFor="catalog-sort" className="sr-only">
              Sort catalog by
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="toolbar-sort-select"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A–Z</option>
            </select>
          </div>

          {/* Item Count Display */}
          <span className="toolbar-count-badge tabular-nums">
            {loading ? '…' : `${sortedProducts.length} items`}
          </span>
        </div>
      </div>

      {/* Product Grid Content */}
      {loading ? (
        <div className="retail-catalog-grid" aria-busy="true" aria-label="Loading catalog works">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="editorial-state-card error-card" role="alert">
          <div className="state-card-icon-wrap error-icon-wrap">
            <AlertCircleIcon size={28} />
          </div>
          <h3 className="state-card-title">Catalog Connection Notice</h3>
          <p className="state-card-text">{error}</p>
          <button type="button" onClick={loadProducts} className="editorial-button-secondary">
            Retry Connection
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="editorial-state-card empty-card" role="region" aria-label="Empty results">
          <div className="state-card-icon-wrap empty-icon-wrap">
            <SearchIcon size={28} />
          </div>
          <h3 className="state-card-title">No Products Found</h3>
          <p className="state-card-text">
            {searchTerm
              ? `No products match your search for “${searchTerm}”.`
              : 'There are currently no items cataloged under this department.'}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              type="button"
              className="editorial-button-secondary"
              onClick={() => {
                setSearchTerm('');
                onSelectCategory('');
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="retail-catalog-grid">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRequireAuth={onRequireAuth}
              onQuickView={(p) => setQuickViewProduct(p)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onRequireAuth={onRequireAuth}
        onNotify={onNotify}
      />
    </section>
  );
}

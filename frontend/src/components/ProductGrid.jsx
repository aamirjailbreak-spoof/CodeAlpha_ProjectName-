import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';

export default function ProductGrid({ onRequireAuth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.categories.getAll();
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products whenever selectedCategory or debouncedSearch changes
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.products.getAll(params);
      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
      setError('Unable to load products. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="product-section">
      {/* Controls Bar: Category Pills & Search */}
      <div className="catalog-controls">
        <div className="category-pills">
          <button
            className={`pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`pill ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <p>{error}</p>
          <button onClick={loadProducts} className="retry-btn">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No products found</h3>
          <p>
            {searchTerm
              ? `No items match "${searchTerm}". Try a different keyword.`
              : 'There are currently no products available in this category.'}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

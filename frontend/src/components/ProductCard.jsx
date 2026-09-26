import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onRequireAuth }) {
  const { isAuthenticated } = useAuth();
  const { addItem, loading } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isOutOfStock = product.stock_quantity <= 0;

  async function handleAddToCart() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (isOutOfStock) return;

    try {
      setAdding(true);
      setErrorMsg('');
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="product-card">
      <div className="product-image-container">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-image-placeholder"
          style={{ display: product.image_url ? 'none' : 'flex' }}
        >
          📦
        </div>
        <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
          {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
        </span>
      </div>

      <div className="product-details">
        {product.category_name && (
          <span className="product-category">{product.category_name}</span>
        )}
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>
        {product.description && (
          <p className="product-description" title={product.description}>
            {product.description}
          </p>
        )}

        <div className="product-footer">
          <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
          <button
            className={`add-to-cart-btn ${added ? 'btn-success' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding || loading}
          >
            {isOutOfStock ? 'Unavailable' : added ? '✓ Added!' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {errorMsg && <div className="product-card-error">{errorMsg}</div>}
      </div>
    </div>
  );
}

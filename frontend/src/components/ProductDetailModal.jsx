import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  XIcon,
  PackageIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  ShoppingBagIcon
} from './Icons';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export default function ProductDetailModal({ product, isOpen, onClose, onRequireAuth, onNotify }) {
  const { isAuthenticated } = useAuth();
  const { addItem, loading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      // oxlint-disable-next-line react/set-state-in-effect
      setQuantity(1);
      setAdded(false);
      setErrorMsg('');
    }
  }, [product]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const stock = product.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const maxSelectable = Math.max(1, Math.min(stock, 10));

  const ratingValue = (4.6 + (((product.id || 1) * 7) % 4) * 0.1).toFixed(1);
  const reviewCount = 28 + (((product.id || 1) * 31) % 180);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (isOutOfStock) return;

    try {
      setAdding(true);
      setErrorMsg('');
      await addItem(product.id, quantity);
      setAdded(true);
      if (onNotify) {
        onNotify(`Added ${quantity} × ${product.name} to bag.`);
      }
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add item to bag.');
    } finally {
      setAdding(false);
    }
  }

  const formattedPrice = currencyFormatter.format(Number(product.price) || 0);
  const itemTotal = currencyFormatter.format((Number(product.price) || 0) * quantity);

  return (
    <div className="editorial-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="editorial-modal-box quick-view-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
      >
        <button
          type="button"
          className="editorial-modal-close"
          onClick={onClose}
          aria-label="Close product view"
        >
          <XIcon size={18} />
        </button>

        <div className="qv-layout-split">
          {/* Media Column (Portrait 3:4) */}
          <div className="qv-media-well">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="qv-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="qv-media-fallback"
              style={{ display: product.image_url ? 'none' : 'flex' }}
              aria-hidden="true"
            >
              <PackageIcon size={48} />
            </div>

            <div className="qv-media-badge-bar">
              <span className="qv-media-batch-tag">BATCH NO. 04</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="qv-details-column">
            <div className="qv-header-row">
              <span className="qv-category-crumb">
                {product.category_name || 'Artisan Work'}
              </span>
              <div className="qv-rating-display" aria-label={`Rated ${ratingValue} out of 5 stars`}>
                <div className="card-rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      size={13}
                      fill={i < Math.floor(ratingValue) ? '#D96B27' : '#E8DFD3'}
                      className="card-star"
                    />
                  ))}
                </div>
                <span className="qv-rating-val tabular-nums">{ratingValue}</span>
                <span className="qv-rating-count tabular-nums">({reviewCount} verified reviews)</span>
              </div>
            </div>

            <h2 id="qv-title" className="qv-product-title">
              {product.name}
            </h2>

            <div className="qv-price-stock-row">
              <span className="qv-price tabular-nums">{formattedPrice}</span>
              {isOutOfStock ? (
                <span className="qv-stock-note out">Sold Out</span>
              ) : stock <= 3 ? (
                <span className="qv-stock-note low">Only {stock} units left in stock</span>
              ) : (
                <span className="qv-stock-note in">In Stock &bull; Ships in 24 Hours</span>
              )}
            </div>

            <p className="qv-description">
              {product.description ||
                'Crafted with premium materials and engineered for enduring quality, dependable performance, and timeless utility.'}
            </p>

            {/* Quality Specs Grid */}
            <div className="qv-specs-pills" role="list">
              <div className="qv-spec-pill" role="listitem">
                <PackageIcon size={14} className="spec-icon" />
                <span>Curated Quality</span>
              </div>
              <div className="qv-spec-pill" role="listitem">
                <ShieldCheckIcon size={14} className="spec-icon" />
                <span>Verified Authentic</span>
              </div>
              <div className="qv-spec-pill" role="listitem">
                <TruckIcon size={14} className="spec-icon" />
                <span>Express Dispatched</span>
              </div>
            </div>

            {/* Quantity Stepper */}
            {!isOutOfStock && (
              <div className="qv-quantity-group">
                <span className="qv-quantity-label">Quantity</span>
                <div className="editorial-stepper">
                  <button
                    type="button"
                    className="stepper-action"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || adding}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={12} />
                  </button>
                  <span className="stepper-value tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="stepper-action"
                    onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                    disabled={quantity >= maxSelectable || adding}
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="qv-error-alert" role="alert">
                {errorMsg}
              </div>
            )}

            <div className="qv-action-row">
              <button
                type="button"
                className={`editorial-button-primary qv-add-btn ${added ? 'btn-success' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding || loading}
              >
                {isOutOfStock ? (
                  'Currently Unavailable'
                ) : added ? (
                  <>
                    <CheckIcon size={16} />
                    <span>Added to Bag!</span>
                  </>
                ) : adding ? (
                  'Adding to Bag…'
                ) : (
                  <>
                    <ShoppingBagIcon size={16} />
                    <span>Add to Bag &bull; {itemTotal}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose, onOrderSuccess }) {
  const { cart, totalItems, subtotal, updateQuantity, removeItem, checkout, loading, cartError } =
    useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  async function handleCheckout() {
    try {
      setCheckingOut(true);
      setCheckoutError('');
      const order = await checkout();
      onClose();
      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  }

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your Cart ({totalItems})</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {checkoutError && <div className="drawer-error-banner">{checkoutError}</div>}
        {cartError && <div className="drawer-error-banner">{cartError}</div>}

        <div className="drawer-body">
          {isCartEmpty ? (
            <div className="cart-empty-state">
              <span className="cart-empty-icon">🛍️</span>
              <p>Your shopping cart is empty.</p>
              <button className="start-shopping-btn" onClick={onClose}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-item-list">
              {items.map((item) => {
                const isMaxStock = item.product_stock && item.quantity >= item.product_stock;
                return (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-thumb">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="cart-thumb-fallback"
                        style={{ display: item.product_image_url ? 'none' : 'flex' }}
                      >
                        📦
                      </div>
                    </div>

                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.product_name}</h4>
                      <div className="cart-item-price">
                        ${parseFloat(item.product_price).toFixed(2)} each
                      </div>
                      {item.product_stock !== undefined && (
                        <div className="cart-item-stock-hint">
                          Max available: {item.product_stock}
                        </div>
                      )}

                      <div className="cart-item-controls">
                        <div className="stepper">
                          <button
                            className="step-btn"
                            disabled={loading || checkingOut}
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                          >
                            {item.quantity === 1 ? '🗑️' : '−'}
                          </button>
                          <span className="step-value">{item.quantity}</span>
                          <button
                            className="step-btn"
                            disabled={loading || checkingOut || isMaxStock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            title={isMaxStock ? 'Max stock reached' : 'Increase quantity'}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-total">
                          ${parseFloat(item.item_total).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      disabled={loading || checkingOut}
                      title="Remove from cart"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isCartEmpty && (
          <div className="drawer-footer">
            <div className="subtotal-row">
              <span className="subtotal-label">Subtotal:</span>
              <span className="subtotal-value">${parseFloat(subtotal).toFixed(2)}</span>
            </div>
            <p className="tax-shipping-note">Taxes and calculated stock verified at checkout.</p>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut || loading || isCartEmpty}
            >
              {checkingOut ? 'Placing Order...' : 'Place Order Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

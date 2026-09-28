import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import {
  XIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  PackageIcon,
  ShoppingBagIcon
} from './Icons';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export default function CartDrawer({ isOpen, onClose, onStartCheckout, onNotify }) {
  const { cart, totalItems, subtotal, updateQuantity, removeItem, loading, cartError } =
    useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleStartCheckout() {
    onClose();
    if (onStartCheckout) {
      onStartCheckout();
    }
  }

  async function handleRemove(cartItemId, productName) {
    try {
      await removeItem(cartItemId);
      if (onNotify) {
        onNotify(`Removed ${productName} from bag.`);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;
  const numSubtotal = Number(subtotal) || 0;
  const formattedSubtotal = currencyFormatter.format(numSubtotal);

  return (
    <div
      className="editorial-drawer-overlay"
      onClick={onClose}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <aside
        className="editorial-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* Drawer Header */}
        <div className="drawer-header-strip">
          <div className="drawer-title-wrap">
            <ShoppingBagIcon size={20} className="drawer-bag-icon" />
            <h2 className="drawer-heading">Your Shopping Bag</h2>
            <span className="drawer-count-bracket tabular-nums">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            type="button"
            className="drawer-close-action"
            onClick={onClose}
            aria-label="Close bag"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Error Banners */}
        {cartError && (
          <div className="drawer-alert alert-error" role="alert">
            {cartError}
          </div>
        )}

        {/* Drawer Body */}
        <div className="drawer-scroll-body">
          {isCartEmpty ? (
            <div className="drawer-empty-state">
              <div className="empty-state-icon-wrap">
                <ShoppingBagIcon size={40} />
              </div>
              <h3 className="empty-state-title">Your Bag is Empty</h3>
              <p className="empty-state-desc">
                Fill it with precision electronics, heavyweight apparel, and crafted living objects.
              </p>
              <button
                type="button"
                className="editorial-button-secondary empty-browse-btn"
                onClick={onClose}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="drawer-items-list" role="list">
              {items.map((item) => {
                const isMaxStock = item.product_stock && item.quantity >= item.product_stock;
                const unitPrice = Number(item.product_price ?? item.price ?? 0);
                const lineTotal = item.item_total != null ? Number(item.item_total) : (unitPrice * item.quantity);

                return (
                  <div key={item.id} className="drawer-item-entry" role="listitem">
                    <div className="drawer-item-thumb">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="thumb-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="thumb-fallback"
                        style={{ display: item.product_image_url ? 'none' : 'flex' }}
                        aria-hidden="true"
                      >
                        <PackageIcon size={22} />
                      </div>
                    </div>

                    <div className="drawer-item-meta">
                      <div className="item-title-row">
                        <h4 className="item-title">{item.product_name}</h4>
                        <button
                          type="button"
                          className="item-remove-action"
                          onClick={() => handleRemove(item.id, item.product_name)}
                          aria-label={`Remove ${item.product_name}`}
                          title="Remove item"
                          disabled={loading}
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>

                      <div className="item-unit-price tabular-nums">
                        {currencyFormatter.format(unitPrice)} each
                      </div>

                      <div className="item-bottom-row">
                        <div className="editorial-stepper stepper-sm">
                          <button
                            type="button"
                            className="stepper-action"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.product_name}`}
                          >
                            <MinusIcon size={12} />
                          </button>
                          <span className="stepper-value tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            className="stepper-action"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading || isMaxStock}
                            aria-label={`Increase quantity of ${item.product_name}`}
                            title={isMaxStock ? 'Max stock reached' : ''}
                          >
                            <PlusIcon size={12} />
                          </button>
                        </div>

                        <span className="item-line-total tabular-nums">
                          {currencyFormatter.format(lineTotal)}
                        </span>
                      </div>

                      {isMaxStock && (
                        <span className="item-stock-warning">Max available stock reached</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Checkout Footer */}
        {!isCartEmpty && (
          <div className="drawer-footer-strip">
            <div className="drawer-summary-block">
              <div className="summary-line">
                <span>Subtotal</span>
                <span className="tabular-nums">{formattedSubtotal}</span>
              </div>
              <div className="summary-line">
                <span>Delivery</span>
                <span className="shipping-complimentary">Calculated at checkout</span>
              </div>
              <div className="summary-total-line">
                <span>Estimated Subtotal</span>
                <span className="tabular-nums total-val">{formattedSubtotal}</span>
              </div>
            </div>

            <button
              type="button"
              className="editorial-button-primary drawer-checkout-btn"
              onClick={handleStartCheckout}
              disabled={loading || isCartEmpty}
            >
              <span>Proceed to Checkout &bull; {formattedSubtotal}</span>
            </button>
            <p className="drawer-guarantee-note">
              30-day quality guarantee &bull; Secure SSL encrypted checkout
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

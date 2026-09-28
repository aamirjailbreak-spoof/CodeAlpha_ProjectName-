import { useState, useEffect } from 'react';
import api from '../services/api';
import { XIcon, AlertCircleIcon, ChevronDownIcon } from './Icons';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

function formatStatus(status) {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatAddress(details) {
  if (!details?.shipping_address) return 'Not recorded';
  const parts = [
    details.shipping_address,
    details.shipping_city,
    details.shipping_postal_code
  ].filter(Boolean);
  return parts.join(', ') || 'Not recorded';
}

function formatDeliveryMethod(method) {
  if (method === 'express') return 'Express Delivery ($14.95)';
  if (method === 'standard') return 'Standard Delivery ($4.95)';
  return 'Not recorded';
}

function formatPaymentMethod(method) {
  if (method === 'cash_on_delivery') return 'Cash on Delivery';
  if (method === 'online') return 'Online';
  return 'Not recorded';
}

export default function OrdersModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError('');
        const res = await api.orders.getAll();
        if (res && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isOpen]);

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
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function toggleOrderDetails(orderId) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    if (orderDetails[orderId]) return;

    try {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));
      const res = await api.orders.getById(orderId);
      if (res && res.data) {
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data }));
      }
    } catch (err) {
      console.error(`Failed to load details for order ${orderId}:`, err.message);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="editorial-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="editorial-modal-box orders-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-title"
      >
        <button
          type="button"
          className="editorial-modal-close"
          onClick={onClose}
          aria-label="Close orders"
        >
          <XIcon size={18} />
        </button>

        {/* Header */}
        <div className="orders-editorial-header">
          <span className="orders-eyebrow">ACCOUNT ARCHIVES</span>
          <h2 id="orders-title" className="orders-title">
            Previous Orders
          </h2>
          <p className="orders-subtitle">
            Itemized purchase history, fulfillment status, and delivery records.
          </p>
        </div>

        {/* Content Area */}
        <div className="orders-content-scroll">
          {loading ? (
            <div className="orders-loading-note" aria-busy="true">
              <span className="spinner-sm" />
              <span>Fetching order history…</span>
            </div>
          ) : error ? (
            <div className="editorial-state-card error-card" role="alert">
              <AlertCircleIcon size={20} />
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-card">
              <h3>No Order History</h3>
              <p>When you complete a purchase, your itemized receipts will be archived here.</p>
              <button
                type="button"
                className="editorial-button-secondary"
                onClick={onClose}
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const details = orderDetails[order.id];
                const isLoadingThisOrder = loadingDetails[order.id];
                const orderDate = order.created_at ? dateFormatter.format(new Date(order.created_at)) : 'Recent';
                const formattedTotal = currencyFormatter.format(Number(order.total_amount) || 0);
                const statusClass = (order.status || 'pending').toLowerCase();
                const displayStatus = formatStatus(order.status);
                const itemCount = order.total_quantity || order.total_items || (details?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)) || 1;

                return (
                  <div key={order.id} className="order-entry-card">
                    {/* Collapsed Order Card Summary */}
                    <div
                      className="order-card-summary"
                      onClick={() => toggleOrderDetails(order.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={`order-details-${order.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleOrderDetails(order.id);
                        }
                      }}
                    >
                      {/* Top Row: Order Number & Status Badge */}
                      <div className="order-summary-top-row">
                        <span className="order-number-tag">Order #{order.id}</span>
                        <span className={`order-status-pill status-${statusClass}`}>
                          {displayStatus}
                        </span>
                      </div>

                      {/* Meta Row: Date & Item Count */}
                      <div className="order-summary-meta-row">
                        <span className="order-summary-date">{orderDate}</span>
                        <span className="order-summary-dot" aria-hidden="true">&bull;</span>
                        <span className="order-summary-items tabular-nums">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Bottom Row: Total & View Details Action */}
                      <div className="order-summary-bottom-row">
                        <div className="order-summary-total-group">
                          <span className="order-summary-total-label">Total</span>
                          <span className="order-summary-total-amount tabular-nums">
                            {formattedTotal}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="order-summary-expand-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderDetails(order.id);
                          }}
                          aria-expanded={isExpanded}
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                          <ChevronDownIcon size={14} className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Order Details Panel */}
                    {isExpanded && (
                      <div id={`order-details-${order.id}`} className="order-expanded-panel">
                        {isLoadingThisOrder ? (
                          <div className="order-details-loading">
                            <span className="spinner-sm" />
                            <span>Loading order details…</span>
                          </div>
                        ) : details ? (
                          <div className="order-panel-content">
                            {/* Section 1: Itemized Product Rows */}
                            <div className="order-panel-section">
                              <h4 className="order-section-title">
                                Order Items ({details.items?.length || 0})
                              </h4>
                              {details.items && details.items.length > 0 ? (
                                <div className="order-items-flow">
                                  {details.items.map((item, idx) => {
                                    const unitPrice = Number(item.unit_price ?? item.price ?? 0);
                                    const lineTotal = item.item_total != null ? Number(item.item_total) : unitPrice * item.quantity;
                                    return (
                                      <div key={item.id || idx} className="order-item-readable-row">
                                        <div className="order-item-desc-col">
                                          <span className="order-item-product-name">{item.product_name}</span>
                                          <span className="order-item-unit-calc tabular-nums">
                                            Qty {item.quantity} &times; {currencyFormatter.format(unitPrice)}
                                          </span>
                                        </div>
                                        <span className="order-item-line-price tabular-nums">
                                          {currencyFormatter.format(lineTotal)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="order-details-empty">No itemized products found.</div>
                              )}
                            </div>

                            {/* Section 2: Fulfillment & Payment Cards */}
                            <div className="order-details-two-col">
                              {/* Delivery Information Card */}
                              <div className="order-detail-card">
                                <h5 className="order-card-subtitle">Delivery</h5>
                                <div className="order-card-fields">
                                  <div className="order-field-row">
                                    <span className="field-label">Recipient</span>
                                    <span className="field-value">{details.customer_name || 'Not recorded'}</span>
                                  </div>
                                  <div className="order-field-row">
                                    <span className="field-label">Phone</span>
                                    <span className="field-value">{details.phone || 'Not recorded'}</span>
                                  </div>
                                  <div className="order-field-row">
                                    <span className="field-label">Address</span>
                                    <span className="field-value">{formatAddress(details)}</span>
                                  </div>
                                  <div className="order-field-row">
                                    <span className="field-label">Delivery method</span>
                                    <span className="field-value">{formatDeliveryMethod(details.delivery_method)}</span>
                                  </div>
                                  {details.delivery_instructions && (
                                    <div className="order-field-row">
                                      <span className="field-label">Instructions</span>
                                      <span className="field-value">{details.delivery_instructions}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Payment Information Card */}
                              <div className="order-detail-card">
                                <h5 className="order-card-subtitle">Payment</h5>
                                <div className="order-card-fields">
                                  <div className="order-field-row">
                                    <span className="field-label">Payment method</span>
                                    <span className="field-value">{formatPaymentMethod(details.payment_method)}</span>
                                  </div>
                                  <div className="order-field-row">
                                    <span className="field-label">Payment status</span>
                                    <span className="field-value">
                                      {details.payment_status ? (
                                        <span className={`order-status-pill status-${details.payment_status.toLowerCase()}`}>
                                          {formatStatus(details.payment_status)}
                                        </span>
                                      ) : (
                                        'Not recorded'
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Financial Totals Breakdown */}
                            <div className="order-total-breakdown-card">
                              {details.delivery_fee != null && (
                                <>
                                  <div className="breakdown-line">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums">
                                      {currencyFormatter.format(Number(details.subtotal ?? (Number(details.total_amount) - Number(details.delivery_fee))))}
                                    </span>
                                  </div>
                                  <div className="breakdown-line">
                                    <span>Delivery</span>
                                    <span className="tabular-nums">
                                      {currencyFormatter.format(Number(details.delivery_fee))}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="breakdown-line grand-total-line">
                                <span>Order Total</span>
                                <span className="tabular-nums total-number">
                                  {currencyFormatter.format(Number(details.total_amount) || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="order-details-empty">No order details found.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


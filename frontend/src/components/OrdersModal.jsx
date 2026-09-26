import { useState, useEffect } from 'react';
import api from '../services/api';

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
        setError(err.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isOpen]);

  async function toggleOrderDetails(orderId) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // If details already cached, don't refetch
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card orders-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order History</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body orders-modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="form-error-banner">{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <h3>No orders found</h3>
              <p>You haven't placed any orders yet. Start shopping!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const details = orderDetails[order.id];
                const isFetchingDetails = loadingDetails[order.id];
                const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-summary" onClick={() => toggleOrderDetails(order.id)}>
                      <div className="order-meta">
                        <div className="order-id">Order #{order.id}</div>
                        <div className="order-date">{dateStr}</div>
                      </div>

                      <div className="order-stats">
                        <span className={`order-status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                        <div className="order-total-amount">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </div>

                      <button
                        className="expand-arrow-btn"
                        aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="order-expanded-details">
                        {isFetchingDetails ? (
                          <div className="loading-subtle">Loading line items...</div>
                        ) : details && details.items ? (
                          <div className="order-items-table">
                            <div className="items-header">
                              <span>Product</span>
                              <span>Price</span>
                              <span>Qty</span>
                              <span>Total</span>
                            </div>
                            {details.items.map((item) => (
                              <div key={item.id} className="order-item-row">
                                <div className="item-name-cell">
                                  {item.product_image_url && (
                                    <img
                                      src={item.product_image_url}
                                      alt={item.product_name}
                                      className="item-small-thumb"
                                      onError={(e) => (e.target.style.display = 'none')}
                                    />
                                  )}
                                  <span>{item.product_name}</span>
                                </div>
                                <span>${parseFloat(item.unit_price).toFixed(2)}</span>
                                <span>{item.quantity}</span>
                                <span className="item-row-total">
                                  ${parseFloat(item.item_total).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-items-hint">No details available.</p>
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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  XIcon,
  CheckIcon,
  TruckIcon,
  LockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PackageIcon,
  AlertCircleIcon,
  SpinnerIcon,
  CashIcon,
  CreditCardIcon
} from './Icons';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    eta: '3–5 business days',
    fee: 4.95,
    desc: 'Reliable ground shipping with doorstep tracking'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    eta: '1–2 business days',
    fee: 14.95,
    desc: 'Priority air dispatch with signature guarantee'
  }
];

const PAYMENT_OPTIONS = [
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    badge: 'Available',
    desc: 'Pay safely with cash or contactless card when your package arrives at your door',
    icon: CashIcon
  },
  {
    id: 'online',
    name: 'Online',
    badge: 'Pending',
    desc: 'Order placed with online payment method. Payment status remains pending.',
    icon: CreditCardIcon
  }
];

export default function CheckoutModal({
  isOpen,
  onClose,
  onViewOrders,
  onRequireAuth
}) {
  const { user, isAuthenticated } = useAuth();
  const { cart, subtotal, checkout } = useCart();

  // Multi-step flow: 'info' | 'review' | 'confirmation'
  const [step, setStep] = useState('info');

  // Checkout form fields
  const [customerName, setCustomerName] = useState(() => user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Initialize/prefill customer name if user logs in later
  useEffect(() => {
    if (user?.name) {
      // oxlint-disable-next-line react/set-state-in-effect
      setCustomerName((prev) => (prev ? prev : user.name));
    }
  }, [user?.name]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setStep('info');
    setFormError('');
    onClose();
  }, [submitting, onClose]);

  // Keyboard Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, handleClose]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const numSubtotal = Number(subtotal) || 0;
  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryMethod) || DELIVERY_OPTIONS[0];
  const deliveryFee = selectedDelivery.fee;
  const estimatedTotal = numSubtotal + deliveryFee;

  function validateInformation() {
    setFormError('');

    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return false;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return false;
    }

    const phoneClean = phone.trim();
    const phoneRegex = /^[\d\s+\-().]{7,30}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      setFormError('Please provide a valid phone number with at least 7 digits.');
      return false;
    }

    if (!address.trim() || address.trim().length < 5) {
      setFormError('Please enter your full street address.');
      return false;
    }

    if (!city.trim() || city.trim().length < 2) {
      setFormError('Please enter your delivery city.');
      return false;
    }

    if (!postalCode.trim() || postalCode.trim().length < 3) {
      setFormError('Please enter a valid postal or ZIP code.');
      return false;
    }

    return true;
  }

  function handleContinueToReview(e) {
    e.preventDefault();
    if (validateInformation()) {
      setStep('review');
    }
  }

  async function handlePlaceOrder() {
    if (submitting) return;

    if (!validateInformation()) {
      setStep('info');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const checkoutPayload = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        shipping_address: address.trim(),
        shipping_city: city.trim(),
        shipping_postal_code: postalCode.trim(),
        delivery_instructions: deliveryInstructions.trim() || null,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod
      };

      const orderData = await checkout(checkoutPayload);
      setPlacedOrder(orderData);
      setStep('confirmation');
    } catch (err) {
      setFormError(err.message || 'Unable to place order. Please review your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="editorial-modal-overlay checkout-modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="checkout-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-dialog-title"
      >
        {/* Header Bar with Stepper */}
        <div className="checkout-modal-header">
          <div className="checkout-header-left">
            <h2 id="checkout-dialog-title" className="checkout-header-title">
              {step === 'confirmation' ? 'Order Receipt' : 'Express Checkout'}
            </h2>
            <div className="checkout-stepper-strip" role="navigation" aria-label="Checkout Progress">
              <span className={`checkout-step-badge ${step === 'info' ? 'active' : 'completed'}`}>
                1. Information
              </span>
              <span className="checkout-step-sep">&rsaquo;</span>
              <span className={`checkout-step-badge ${step === 'review' ? 'active' : step === 'confirmation' ? 'completed' : ''}`}>
                2. Review Order
              </span>
              <span className="checkout-step-sep">&rsaquo;</span>
              <span className={`checkout-step-badge ${step === 'confirmation' ? 'active' : ''}`}>
                3. Confirmation
              </span>
            </div>
          </div>

          <button
            type="button"
            className="checkout-modal-close"
            onClick={handleClose}
            aria-label="Close checkout"
            disabled={submitting}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="checkout-alert-error" role="alert">
            <AlertCircleIcon size={18} className="checkout-alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        {/* STAGE 1: CHECKOUT INFORMATION */}
        {step === 'info' && (
          <form className="checkout-two-col-layout" onSubmit={handleContinueToReview} noValidate>
            {/* Left Column: Input Forms */}
            <div className="checkout-main-column">
              {/* Section: Contact Details */}
              <div className="checkout-form-section">
                <h3 className="checkout-section-title">1. Contact Information</h3>
                <div className="checkout-grid-row">
                  <div className="checkout-field-group">
                    <label htmlFor="chk-name" className="checkout-field-label">
                      Full Name <span className="req-star">*</span>
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      className="checkout-input"
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="checkout-field-group">
                    <label htmlFor="chk-phone" className="checkout-field-label">
                      Phone Number <span className="req-star">*</span>
                    </label>
                    <input
                      id="chk-phone"
                      type="tel"
                      className="checkout-input"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Shipping Address */}
              <div className="checkout-form-section">
                <h3 className="checkout-section-title">2. Delivery Address</h3>
                <div className="checkout-field-group">
                  <label htmlFor="chk-address" className="checkout-field-label">
                    Street Address <span className="req-star">*</span>
                  </label>
                  <input
                    id="chk-address"
                    type="text"
                    className="checkout-input"
                    placeholder="123 Artisan Way, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="checkout-grid-row">
                  <div className="checkout-field-group">
                    <label htmlFor="chk-city" className="checkout-field-label">
                      City <span className="req-star">*</span>
                    </label>
                    <input
                      id="chk-city"
                      type="text"
                      className="checkout-input"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="checkout-field-group">
                    <label htmlFor="chk-postal" className="checkout-field-label">
                      Postal / ZIP Code <span className="req-star">*</span>
                    </label>
                    <input
                      id="chk-postal"
                      type="text"
                      className="checkout-input"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="checkout-field-group">
                  <label htmlFor="chk-notes" className="checkout-field-label">
                    Delivery Instructions <span className="optional-tag">(Optional)</span>
                  </label>
                  <input
                    id="chk-notes"
                    type="text"
                    className="checkout-input"
                    placeholder="Gate code, reception drop-off, or access notes"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>
              </div>

              {/* Section: Delivery Method */}
              <div className="checkout-form-section">
                <h3 className="checkout-section-title">3. Delivery Method</h3>
                <div className="checkout-options-stack" role="radiogroup" aria-label="Delivery options">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`checkout-radio-card ${deliveryMethod === opt.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="delivery_method"
                        value={opt.id}
                        checked={deliveryMethod === opt.id}
                        onChange={() => setDeliveryMethod(opt.id)}
                        className="checkout-native-radio"
                      />
                      <div className="radio-card-body">
                        <div className="radio-card-header">
                          <span className="radio-card-name">{opt.name}</span>
                          <span className="radio-card-price tabular-nums">
                            {currencyFormatter.format(opt.fee)}
                          </span>
                        </div>
                        <span className="radio-card-eta">
                          <TruckIcon size={14} className="eta-icon" /> {opt.eta}
                        </span>
                        <p className="radio-card-desc">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section: Payment Method */}
              <div className="checkout-form-section">
                <h3 className="checkout-section-title">4. Payment Method</h3>
                <div className="checkout-options-stack" role="radiogroup" aria-label="Payment options">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    return (
                      <label
                        key={opt.id}
                        className={`checkout-radio-card ${paymentMethod === opt.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={opt.id}
                          checked={paymentMethod === opt.id}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="checkout-native-radio"
                        />
                        <div className="radio-card-body">
                          <div className="radio-card-header">
                            <span className="radio-card-name">
                              <IconComp size={16} className="pay-icon" /> {opt.name}
                            </span>
                            <span className="payment-badge-tag">{opt.badge}</span>
                          </div>
                          <p className="radio-card-desc">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="checkout-submit-row">
                <button type="submit" className="editorial-button-primary checkout-action-btn">
                  <span>Continue to Review Order</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <aside className="checkout-summary-column">
              <div className="checkout-summary-card">
                <h4 className="summary-card-title">Order Summary ({items.length} items)</h4>
                <div className="summary-items-preview">
                  {items.map((item) => (
                    <div key={item.id} className="preview-item-row">
                      <div className="preview-thumb-wrap">
                        {item.product_image_url ? (
                          <img src={item.product_image_url} alt={item.product_name} className="preview-img" />
                        ) : (
                          <PackageIcon size={18} className="preview-fallback-icon" />
                        )}
                        <span className="preview-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="preview-info-col">
                        <span className="preview-item-name">{item.product_name}</span>
                        <span className="preview-item-price tabular-nums">
                          {currencyFormatter.format(Number(item.product_price ?? item.price ?? 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-cost-breakdown">
                  <div className="cost-line">
                    <span>Items Subtotal</span>
                    <span className="tabular-nums">{currencyFormatter.format(numSubtotal)}</span>
                  </div>
                  <div className="cost-line">
                    <span>Delivery ({selectedDelivery.name})</span>
                    <span className="tabular-nums">{currencyFormatter.format(deliveryFee)}</span>
                  </div>
                  <div className="cost-line total-line">
                    <span>Total Due</span>
                    <span className="tabular-nums total-highlight">
                      {currencyFormatter.format(estimatedTotal)}
                    </span>
                  </div>
                </div>

                <div className="summary-trust-badges">
                  <div className="trust-pill">
                    <ShieldCheckIcon size={14} /> 30-Day Authentic Guarantee
                  </div>
                  <div className="trust-pill">
                    <LockIcon size={14} /> Encrypted Order Processing
                  </div>
                </div>
              </div>
            </aside>
          </form>
        )}

        {/* STAGE 2: REVIEW ORDER */}
        {step === 'review' && (
          <div className="checkout-two-col-layout">
            {/* Left Column: Review Verification Cards */}
            <div className="checkout-main-column">
              <div className="checkout-review-card">
                <div className="review-card-header">
                  <h3 className="review-header-title">Customer &amp; Delivery Destination</h3>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => setStep('info')}
                    disabled={submitting}
                  >
                    Edit Information
                  </button>
                </div>
                <div className="review-details-grid">
                  <div className="review-detail-cell">
                    <span className="cell-label">Recipient</span>
                    <span className="cell-value">{customerName}</span>
                  </div>
                  <div className="review-detail-cell">
                    <span className="cell-label">Phone</span>
                    <span className="cell-value">{phone}</span>
                  </div>
                  <div className="review-detail-cell full-width">
                    <span className="cell-label">Shipping Address</span>
                    <span className="cell-value">
                      {address}, {city} {postalCode}
                    </span>
                  </div>
                  {deliveryInstructions && (
                    <div className="review-detail-cell full-width">
                      <span className="cell-label">Instructions</span>
                      <span className="cell-value">{deliveryInstructions}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkout-review-card">
                <div className="review-card-header">
                  <h3 className="review-header-title">Logistics &amp; Payment Verification</h3>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => setStep('info')}
                    disabled={submitting}
                  >
                    Change Options
                  </button>
                </div>
                <div className="review-details-grid">
                  <div className="review-detail-cell">
                    <span className="cell-label">Delivery Service</span>
                    <span className="cell-value">
                      {selectedDelivery.name} ({currencyFormatter.format(selectedDelivery.fee)})
                    </span>
                    <span className="cell-sub">{selectedDelivery.eta}</span>
                  </div>
                  <div className="review-detail-cell">
                    <span className="cell-label">Payment Method</span>
                    <span className="cell-value">
                      {paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'}
                    </span>
                    <span className="cell-sub">
                      {paymentMethod === 'cash_on_delivery'
                        ? 'Payment collected at doorstep'
                        : 'Payment status: Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Order Line Items */}
              <div className="checkout-review-card">
                <h3 className="review-header-title">Itemized Order Manifest ({items.length} works)</h3>
                <div className="review-items-table">
                  {items.map((item) => {
                    const unitPrice = Number(item.product_price ?? item.price ?? 0);
                    const lineTotal = item.item_total != null ? Number(item.item_total) : unitPrice * item.quantity;
                    return (
                      <div key={item.id} className="review-item-line">
                        <div className="review-item-main">
                          <span className="review-item-title">{item.product_name}</span>
                          <span className="review-item-unit tabular-nums">
                            {currencyFormatter.format(unitPrice)} &times; {item.quantity}
                          </span>
                        </div>
                        <span className="review-item-total tabular-nums">
                          {currencyFormatter.format(lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submission Action Bar */}
              <div className="checkout-submit-row review-actions-row">
                <button
                  type="button"
                  className="editorial-button-secondary back-to-info-btn"
                  onClick={() => setStep('info')}
                  disabled={submitting}
                >
                  &larr; Back to Information
                </button>
                <button
                  type="button"
                  className="editorial-button-primary place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <SpinnerIcon size={16} />
                      <span>Placing Order…</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon size={16} />
                      <span>Place Order &bull; {currencyFormatter.format(estimatedTotal)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Sticky Review Summary */}
            <aside className="checkout-summary-column">
              <div className="checkout-summary-card">
                <h4 className="summary-card-title">Order Total</h4>
                <div className="summary-cost-breakdown">
                  <div className="cost-line">
                    <span>Items Subtotal</span>
                    <span className="tabular-nums">{currencyFormatter.format(numSubtotal)}</span>
                  </div>
                  <div className="cost-line">
                    <span>Delivery Fee</span>
                    <span className="tabular-nums">{currencyFormatter.format(deliveryFee)}</span>
                  </div>
                  <div className="cost-line total-line">
                    <span>Final Amount</span>
                    <span className="tabular-nums total-highlight">
                      {currencyFormatter.format(estimatedTotal)}
                    </span>
                  </div>
                </div>

                <div className="summary-guarantee-box">
                  <ShieldCheckIcon size={16} className="box-icon" />
                  <p>
                    By clicking <strong>Place Order</strong>, your reservation is atomically confirmed and
                    inventory is dedicated to your order record.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* STAGE 3: ORDER CONFIRMATION */}
        {step === 'confirmation' && placedOrder && (
          <div className="checkout-confirmation-view">
            <div className="confirmation-hero-badge">
              <div className="hero-check-circle">
                <CheckIcon size={28} />
              </div>
              <h3 className="confirmation-hero-title">Order Placed Successfully</h3>
              <p className="confirmation-hero-subtitle">
                Thank you for your purchase. Your order has been registered and is being prepared for fulfillment.
              </p>
            </div>

            <div className="confirmation-card">
              <div className="confirmation-header-strip">
                <div className="order-id-block">
                  <span className="order-id-label">Order Reference</span>
                  <span className="order-id-number tabular-nums">№ {placedOrder.id}</span>
                </div>
                <div className="order-total-block">
                  <span className="order-total-label">Total Amount</span>
                  <span className="order-total-number tabular-nums">
                    {currencyFormatter.format(Number(placedOrder.total_amount) || 0)}
                  </span>
                </div>
              </div>

              <div className="confirmation-grid">
                <div className="confirmation-detail-cell">
                  <span className="cell-label">Delivery Address</span>
                  <span className="cell-value">
                    {placedOrder.customer_name}
                    <br />
                    {placedOrder.shipping_address}, {placedOrder.shipping_city} {placedOrder.shipping_postal_code}
                  </span>
                  <span className="cell-sub">Tel: {placedOrder.phone}</span>
                </div>

                <div className="confirmation-detail-cell">
                  <span className="cell-label">Delivery Logistics</span>
                  <span className="cell-value">
                    {placedOrder.delivery_method === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                  </span>
                  <span className="cell-sub">
                    Fee: {currencyFormatter.format(Number(placedOrder.delivery_fee) || 0)} &bull;{' '}
                    {placedOrder.delivery_method === 'express' ? '1–2 business days' : '3–5 business days'}
                  </span>
                </div>

                <div className="confirmation-detail-cell">
                  <span className="cell-label">Payment Method</span>
                  <span className="cell-value">
                    {placedOrder.payment_method === 'online' ? 'Online' : 'Cash on Delivery'}
                  </span>
                  <span className="cell-sub">
                    Payment Status: <strong className="status-badge-pending">{placedOrder.payment_status ? (placedOrder.payment_status.charAt(0).toUpperCase() + placedOrder.payment_status.slice(1).toLowerCase()) : 'Pending'}</strong>
                  </span>
                </div>

                {placedOrder.delivery_instructions && (
                  <div className="confirmation-detail-cell full-width">
                    <span className="cell-label">Delivery Notes</span>
                    <span className="cell-value">{placedOrder.delivery_instructions}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="confirmation-actions-row">
              <button
                type="button"
                className="editorial-button-secondary"
                onClick={() => {
                  handleClose();
                  if (onViewOrders) onViewOrders();
                }}
              >
                View in Order History
              </button>
              <button
                type="button"
                className="editorial-button-primary"
                onClick={handleClose}
              >
                <span>Continue Shopping</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from './services/api';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductGrid from './components/ProductGrid';
import BrandValues from './components/BrandValues';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import OrdersModal from './components/OrdersModal';
import ProfileModal from './components/ProfileModal';
import { XIcon, CheckIcon, LogoMarkIcon, ArrowRightIcon, ShieldCheckIcon, TruckIcon } from './components/Icons';
import './App.css';

function MainLayout() {
  const { isCartOpen, closeCart } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Load categories from real backend
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.categories.getAll();
        if (res && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  function showNotification(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  function handleOrderSuccess(order) {
    showNotification(`Order #${order.id} placed successfully! Thank you for your purchase.`);
    setOrdersOpen(true);
  }

  function handleScrollToCatalog() {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleScrollToValues() {
    const valuesEl = document.getElementById('values-section');
    if (valuesEl) {
      valuesEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleCategorySelect(catId) {
    setSelectedCategory(catId);
    handleScrollToCatalog();
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    showNotification('Welcome to CodeAlpha Store! Check your inbox soon.');
  }

  return (
    <div className="store-layout">
      {/* Modern E-Commerce Header */}
      <Navbar
        categories={categories}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onSearchClick={() => {
          setIsSearchOpen(true);
          handleScrollToCatalog();
        }}
      />

      {/* Modern Floating Toast Notification */}
      {toast && (
        <div
          className={`editorial-toast toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon-wrap">
            <CheckIcon size={14} />
          </div>
          <span className="toast-text">{toast.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        <HeroSection
          onExploreClick={handleScrollToCatalog}
          onValuesClick={handleScrollToValues}
        />

        <ProductGrid
          categories={categories}
          onRequireAuth={() => setAuthOpen(true)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isSearchOpen={isSearchOpen}
          onCloseSearch={() => setIsSearchOpen(false)}
          onNotify={showNotification}
        />

        <BrandValues onShopClick={handleScrollToCatalog} />
      </main>

      {/* Polished Food Brand Footer */}
      <footer className="store-footer">
        <div className="footer-inner">
          <div className="footer-main-grid">
            {/* Column 1: Brand Wordmark & Story */}
            <div className="footer-brand-col">
              <div className="footer-brand-header">
                <LogoMarkIcon size={30} />
                <span className="footer-brand-title">CodeAlpha Store</span>
              </div>
              <p className="footer-manifesto">
                Precision electronics, tailored apparel, handcrafted leather goods, and timeless living objects.
                Curated with uncompromising standards for everyday durability and modern utility.
              </p>
              <div className="footer-badges">
                <span className="footer-badge-pill">
                  <ShieldCheckIcon size={14} /> Quality Guarantee
                </span>
                <span className="footer-badge-pill">
                  <TruckIcon size={14} /> Reliable Insured Shipping
                </span>
              </div>
            </div>

            {/* Column 2: Department Links */}
            <div className="footer-links-col">
              <h4 className="footer-heading">Collections</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => handleCategorySelect('')}>
                    All Collections
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button type="button" onClick={() => handleCategorySelect(String(cat.id))}>
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Standards & Story */}
            <div className="footer-links-col">
              <h4 className="footer-heading">Customer Care</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={handleScrollToValues}>
                    Product Quality
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleScrollToValues}>
                    Customer Promise
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setOrdersOpen(true)}>
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setProfileOpen(true)}>
                    Client Account
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Club */}
            <div className="footer-newsletter-col">
              <h4 className="footer-heading">Product Updates</h4>
              <p className="newsletter-desc">
                Subscribe for announcements on new arrivals, curated electronics releases,
                and 10% off your first order.
              </p>
              {newsletterSubscribed ? (
                <div className="newsletter-success-box" role="status">
                  <CheckIcon size={16} />
                  <span>You're subscribed! Welcome to CodeAlpha Store.</span>
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address for newsletter
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address…"
                    required
                    className="newsletter-input"
                  />
                  <button
                    type="submit"
                    className="newsletter-submit-btn"
                    aria-label="Join newsletter list"
                  >
                    <span>Join</span>
                    <ArrowRightIcon size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="footer-bottom-strip">
            <p>&copy; {new Date().getFullYear()} CodeAlpha Store &bull; Full Stack Internship Project</p>
            <div className="footer-tech-stack">
              <span>PostgreSQL 18</span>
              <span className="dot-sep">&bull;</span>
              <span>Express.js REST API</span>
              <span className="dot-sep">&bull;</span>
              <span>React 19 &amp; Vite</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        onStartCheckout={() => {
          closeCart();
          setCheckoutOpen(true);
        }}
        onNotify={showNotification}
      />
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onViewOrders={() => {
          setCheckoutOpen(false);
          setOrdersOpen(true);
        }}
        onRequireAuth={() => {
          setCheckoutOpen(false);
          setAuthOpen(true);
        }}
        onOrderSuccess={handleOrderSuccess}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <OrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}

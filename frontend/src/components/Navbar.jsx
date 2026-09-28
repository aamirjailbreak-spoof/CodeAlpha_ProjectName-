import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  SearchIcon,
  UserIcon,
  PackageIcon,
  LogOutIcon,
  CartIcon,
  MenuIcon,
  XIcon,
  LogoMarkIcon
} from './Icons';

export default function Navbar({
  categories = [],
  onOpenAuth,
  onOpenOrders,
  onOpenProfile,
  onSelectCategory,
  selectedCategory,
  onSearchClick
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [mobileMenuOpen]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  function handleCategoryClick(catId) {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setMobileMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Mobile Menu Hamburger Toggle */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        {/* Brand Wordmark & Emblem */}
        <div className="navbar-left">
          <a href="#root" className="navbar-brand" aria-label="CodeAlpha Store Home">
            <span className="brand-logo-emblem">
              <LogoMarkIcon size={28} />
            </span>
            <div className="brand-text-block">
              <span className="brand-wordmark">CODEALPHA</span>
              <span className="brand-editions">STORE</span>
            </div>
          </a>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="navbar-nav" aria-label="Department navigation">
          <button
            type="button"
            className={`nav-link ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
            aria-pressed={selectedCategory === ''}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`nav-link ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => handleCategoryClick(String(cat.id))}
              aria-pressed={String(selectedCategory) === String(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Right Actions: Search, Account, Bag */}
        <div className="navbar-right">
          <button
            type="button"
            className="nav-icon-action"
            onClick={onSearchClick}
            aria-label="Search collection"
            title="Search Products"
          >
            <SearchIcon size={19} />
          </button>

          {isAuthenticated ? (
            <div className="user-action-group">
              <button
                type="button"
                className="nav-text-action user-account-btn"
                onClick={onOpenProfile}
                aria-label={`View profile for ${firstName}`}
              >
                <UserIcon size={16} />
                <span className="nav-desktop-only">{firstName}</span>
              </button>

              <button
                type="button"
                className="nav-text-action"
                onClick={onOpenOrders}
                aria-label="View orders"
                title="Order History"
              >
                <PackageIcon size={16} />
                <span className="nav-desktop-only">Orders</span>
              </button>

              <button
                type="button"
                className="nav-icon-action"
                onClick={logout}
                aria-label="Sign out"
                title="Sign Out"
              >
                <LogOutIcon size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="nav-signin-btn"
              onClick={onOpenAuth}
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
          )}

          {/* Premium Glass/Liquid Cart Pill Button */}
          <button
            type="button"
            className="nav-cart-btn nav-glass-cart-btn"
            onClick={openCart}
            aria-label={`Shopping cart containing ${totalItems} item${totalItems === 1 ? '' : 's'}`}
          >
            <span className="glass-btn-reflection" aria-hidden="true" />
            <CartIcon size={18} className="cart-icon" />
            <span className="cart-title-text">Cart</span>
            <span className="cart-count-badge tabular-nums">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        >
          <div
            id="mobile-navigation"
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <LogoMarkIcon size={24} />
                <span>CodeAlpha Store</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">Browse Department</span>
              <button
                type="button"
                className={`mobile-nav-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`mobile-nav-item ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(String(cat.id))}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mobile-drawer-divider" />

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">Account & Orders</span>
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                  >
                    <UserIcon size={16} />
                    <span>My Account ({firstName})</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenOrders();
                    }}
                  >
                    <PackageIcon size={16} />
                    <span>Orders & Receipts</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-nav-item text-danger"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOutIcon size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="mobile-signin-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenAuth, onOpenOrders, onOpenProfile }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-logo">🛒</span>
          <span className="brand-name">CodeAlpha Store</span>
        </div>

        <div className="navbar-actions">
          <button
            className="cart-button"
            onClick={openCart}
            aria-label="View shopping cart"
          >
            <span className="cart-icon">🛍️</span>
            <span className="cart-label">Cart</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button" onClick={onOpenProfile} title="View Profile">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
              </button>
              <button className="nav-secondary-button" onClick={onOpenOrders} title="View Orders">
                📦 Orders
              </button>
              <button className="nav-secondary-button logout-button" onClick={logout} title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

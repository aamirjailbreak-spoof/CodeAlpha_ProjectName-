import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import OrdersModal from './components/OrdersModal';
import ProfileModal from './components/ProfileModal';
import './App.css';

function MainLayout() {
  const { isCartOpen, closeCart } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  function handleOrderSuccess(order) {
    setSuccessToast(`🎉 Order #${order.id} placed successfully!`);
    setOrdersOpen(true);
    setTimeout(() => setSuccessToast(''), 6000);
  }

  return (
    <div className="store-layout">
      <Navbar
        onOpenAuth={() => setAuthOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {successToast && (
        <div className="success-toast-banner" onClick={() => setSuccessToast('')}>
          <span>{successToast}</span>
          <button className="toast-close">✕</button>
        </div>
      )}

      <main className="main-content">
        <ProductGrid onRequireAuth={() => setAuthOpen(true)} />
      </main>

      <footer className="store-footer">
        <p>CodeAlpha E-Commerce Store &bull; Full Stack Internship Project</p>
      </footer>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
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

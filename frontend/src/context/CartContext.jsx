import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: '0.00', total_items: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: '0.00', total_items: 0 });
      return;
    }

    try {
      setLoading(true);
      setCartError(null);
      const res = await api.cart.get();
      if (res && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err.message);
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to add items to your cart');
      }

      setLoading(true);
      setCartError(null);
      try {
        await api.cart.addItem(productId, quantity);
        await fetchCart();
      } catch (err) {
        setCartError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      setLoading(true);
      setCartError(null);
      try {
        await api.cart.updateItem(itemId, quantity);
        await fetchCart();
      } catch (err) {
        setCartError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setLoading(true);
      setCartError(null);
      try {
        await api.cart.removeItem(itemId);
        await fetchCart();
      } catch (err) {
        setCartError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart]
  );

  const checkout = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to complete checkout');
    }

    setLoading(true);
    setCartError(null);
    try {
      const res = await api.orders.create();
      // On success, reset local cart and refresh
      setCart({ items: [], subtotal: '0.00', total_items: 0 });
      return res.data;
    } catch (err) {
      // If error (e.g. stock limitation), refresh cart to reflect latest state
      await fetchCart();
      setCartError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const value = {
    cart,
    totalItems: cart.total_items || 0,
    subtotal: cart.subtotal || '0.00',
    loading,
    cartError,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    checkout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

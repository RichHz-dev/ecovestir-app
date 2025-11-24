import * as api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem } from '@/types/api';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  cartCount: number;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number, size: string) => Promise<void>;
  removeItem: (productId: string, size: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCart();
      setCart(data);
    } catch (err: any) {
      console.error('Error refreshing cart:', err);
      setError(err.message || 'Error al cargar el carrito');
      // Si el usuario no está autenticado, mantener carrito vacío
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, quantity: number, size: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.addToCart(productId, quantity, size);
      setCart(data);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Error al añadir al carrito');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number, size: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.updateCartItemQuantity(productId, quantity, size);
      setCart(data);
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError(err.message || 'Error al actualizar cantidad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string, size: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.removeFromCart(productId, size);
      setCart(data);
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.message || 'Error al eliminar del carrito');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.clearCart();
      setCart(data);
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Error al vaciar el carrito');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar carrito cuando cambie el usuario
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Si no hay usuario, limpiar el carrito
      setCart([]);
    }
  }, [user]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartCount,
        refreshCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

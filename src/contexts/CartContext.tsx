"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartItem[], action: any) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return [...state, action.payload];
    case 'REMOVE_FROM_CART':
      return state.filter(item => item._id !== action.payload);
    case 'INCREASE_QUANTITY':
      return state.map(item => item._id === action.payload ? { ...item, quantity: item.quantity + 1 } : item);
    case 'DECREASE_QUANTITY':
      return state.map(item => item._id === action.payload && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => dispatch({ type: 'ADD_TO_CART', payload: item });
  const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const increaseQuantity = (id: string) => dispatch({ type: 'INCREASE_QUANTITY', payload: id });
  const decreaseQuantity = (id: string) => dispatch({ type: 'DECREASE_QUANTITY', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

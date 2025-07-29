import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  paidExamIds: string[];
  freeAttempts: number;
  cart: string[];
  login: (user: User) => void;
  logout: () => void;
  addPaidExam: (examId: string) => void;
  useFreeAttempt: () => void;
  addToCart: (examId: string) => void;
  removeFromCart: (examId: string) => void;
  clearCart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [paidExamIds, setPaidExamIds] = useState<string[]>([]);
  const [freeAttempts, setFreeAttempts] = useState<number>(10);
  const [cart, setCart] = useState<string[]>([]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setPaidExamIds([]);
    setFreeAttempts(10);
    setCart([]);
  };

  const addPaidExam = (examId: string) => {
    setPaidExamIds(prev => [...prev, examId]);
  }

  const useFreeAttempt = () => {
    setFreeAttempts(prev => Math.max(0, prev - 1));
  }

  const addToCart = (examId: string) => {
    setCart(prev => (prev.includes(examId) ? prev : [...prev, examId]));
  };

  const removeFromCart = (examId: string) => {
    setCart(prev => prev.filter(id => id !== examId));
  };
  
  const clearCart = () => {
      setCart([]);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, paidExamIds, freeAttempts, addPaidExam, useFreeAttempt, cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
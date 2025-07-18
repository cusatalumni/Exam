import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  paidExamIds: string[];
  login: (user: User) => void;
  logout: () => void;
  addPaidExam: (examId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [paidExamIds, setPaidExamIds] = useState<string[]>([]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setPaidExamIds([]);
  };

  const addPaidExam = (examId: string) => {
    setPaidExamIds(prev => [...prev, examId]);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, paidExamIds, addPaidExam }}>
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
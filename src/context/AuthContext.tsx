import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '../services/api';

interface User {
  fullName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
  kycStatus: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sharppay_token');
    const savedUser = localStorage.getItem('sharppay_user');
    if (savedToken) {
      setTokenState(savedToken);
      if (savedUser) setUserState(JSON.parse(savedUser));
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res = await getMe();
      const userData = res.data?.data || res.data;
      setUserState(userData);
      localStorage.setItem('sharppay_user', JSON.stringify(userData));
    } catch {
      // keep existing user data
    } finally {
      setIsLoading(false);
    }
  };

  const setToken = (t: string) => {
    localStorage.setItem('sharppay_token', t);
    setTokenState(t);
  };

  const setUser = (u: User) => {
    setUserState(u);
    localStorage.setItem('sharppay_user', JSON.stringify(u));
  };

  const logout = () => {
    localStorage.removeItem('sharppay_token');
    localStorage.removeItem('sharppay_user');
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setToken, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

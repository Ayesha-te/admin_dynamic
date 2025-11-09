import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, LoginResponse } from '@/lib/api';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      apiClient
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(username, password);
      localStorage.setItem('admin_token', response.access);
      localStorage.setItem('admin_refresh_token', response.refresh);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

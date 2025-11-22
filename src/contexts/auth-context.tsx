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
      // If we have a cached user snapshot, use it immediately for fast UI
      try {
        const cached = localStorage.getItem('admin_user');
        if (cached) {
          setUser(JSON.parse(cached));
          // do not keep loading state; allow UI to render quickly
          setIsLoading(false);
        }
      } catch (e) {
        // ignore parse errors
      }

      // Refresh authoritative user data in background
      apiClient
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          try {
            localStorage.setItem('admin_user', JSON.stringify(userData));
          } catch (e) {}
        })
        .catch(() => {
          // If refresh fails, clear tokens and cached user
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          setUser(null);
        })
        .finally(() => {
          // ensure loading is false in case there was no cached user
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
      try {
        localStorage.setItem('admin_user', JSON.stringify(userData));
      } catch (e) {}
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
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

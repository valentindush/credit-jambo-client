'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from './types';
import { apiClient } from './api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creditjambo_access_token',
  REFRESH_TOKEN: 'creditjambo_refresh_token',
  USER: 'creditjambo_user',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from storage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const setAuthTokens = useCallback((response: AuthResponse) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const clearAuthTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      setAuthTokens(response);
    } catch (error) {
      clearAuthTokens();
      throw error;
    }
  }, [setAuthTokens, clearAuthTokens]);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => {
      try {
        const response = await apiClient.register({
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        });
        setAuthTokens(response);
      } catch (error) {
        clearAuthTokens();
        throw error;
      }
    },
    [setAuthTokens, clearAuthTokens]
  );

  const logout = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await apiClient.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthTokens();
    }
  }, [getAccessToken, clearAuthTokens]);

  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        clearAuthTokens();
        return;
      }

      const response = await apiClient.refreshToken({ refreshToken });
      setAuthTokens(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthTokens();
    }
  }, [setAuthTokens, clearAuthTokens]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAccessToken() {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setToken(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  }, []);

  return token;
}


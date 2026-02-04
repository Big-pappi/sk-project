"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, initializeAuth, clearTokens } from "@/lib/api/client";
import type { Profile, UserRole } from "@/lib/types";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  address?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    initializeAuth();
    const storedUser = authApi.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setUser(null);
      return;
    }

    const { data, error } = await authApi.getProfile();
    if (data && !error) {
      const userData: User = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role as UserRole,
        avatar_url: data.avatar_url,
        address: data.address,
      };
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } else {
      // If we can't get profile, clear auth
      clearTokens();
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authApi.login(email, password);
    
    if (error || !data) {
      return { success: false, error: error || "Login failed" };
    }

    const userData: User = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name,
      phone: data.user.phone,
      role: data.user.role as UserRole,
      avatar_url: data.user.avatar_url,
    };
    
    setUser(userData);
    return { success: true };
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: string;
  }) => {
    const { error } = await authApi.register(data);
    
    if (error) {
      return { success: false, error };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

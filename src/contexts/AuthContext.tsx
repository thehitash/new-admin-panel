import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginAdmin } from '../utils/apis';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('admin-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await loginAdmin({ email, password });

    // Adjust to match your backend response shape
    if (res?.success && res.user) {
      const loggedInUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || "Admin User", // fallback if no name
        role: res.user.role || "admin",
        contactNumber: '',
        address: ''
      };

      setUser(loggedInUser);
      localStorage.setItem("admin-user", JSON.stringify(loggedInUser));

      return true;
    }

    return false;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};
  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin-user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
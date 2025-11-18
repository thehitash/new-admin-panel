import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginAdmin, requestAdminOTP } from '../utils/apis';

interface AuthContextType {
  user: User | null;
  requestOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
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
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('admin-user');
      }
    }
    setLoading(false);
  }, []);

  const requestOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await requestAdminOTP(phoneNumber);

      console.log('🔐 OTP Request Response:', res);

      if (res?.status === true || res?.success === true) {
        return {
          success: true,
          message: res.message || 'OTP sent successfully! Check your phone.',
        };
      }

      return {
        success: false,
        message: res?.message || 'Failed to send OTP. Please try again.',
      };
    } catch (error) {
      console.error('❌ Request OTP failed:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await loginAdmin({ phoneNumber, otp });

      console.log('✅ OTP Verify Response:', res);

      // Check if login was successful
      if (res?.status === true && res?.data) {
        const userData = res.data;

        // Check if user is admin
        if (!userData.isAdmin) {
          return {
            success: false,
            message: 'Access denied. Admin privileges required.',
          };
        }

        const loggedInUser: User = {
          id: userData._id || userData.id,
          email: userData.email || '',
          name: userData.fullName || 'Admin User',
          role: 'admin',
          contactNumber: userData.phoneNumber || phoneNumber,
          address: '',
          token: userData.token || res.token, // Store JWT token
        };

        setUser(loggedInUser);
        localStorage.setItem('admin-user', JSON.stringify(loggedInUser));

        return {
          success: true,
          message: 'Login successful!',
        };
      }

      return {
        success: false,
        message: res?.message || 'Invalid OTP. Please try again.',
      };
    } catch (error) {
      console.error('❌ Verify OTP failed:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin-user');
  };

  const value = {
    user,
    requestOTP,
    verifyOTP,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export type UserRole = 'admin' | 'guest';

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => void;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signUpAsAdmin: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  hasPermission: (action: 'read' | 'write') => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a guest session
    const guestSession = localStorage.getItem('guestSession');
    if (guestSession) {
      setUser({ id: 'guest', role: 'guest' });
      setLoading(false);
      return;
    }

    // Check Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserRole(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        checkUserRole(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = (userId: string, email: string) => {
    // Simplified: All authenticated users are admins by default
    // No database check needed for now
    setUser({
      id: userId,
      email: email,
      role: 'admin',
      approved: true
    });
  };

  const signInAsGuest = () => {
    localStorage.setItem('guestSession', 'true');
    setUser({ id: 'guest', role: 'guest' });
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // If email not confirmed, try to bypass for development
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email and confirm your account before signing in.');
        }
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const signUpAsAdmin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    
    // Show success message for email confirmation
    console.log('Please check your email to confirm your account before signing in.');
  };

  const signOut = () => {
    localStorage.removeItem('guestSession');
    supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = (action: 'read' | 'write') => {
    if (!user) return false;
    if (action === 'read') return true; // All users can read
    return user.role === 'admin' && user.approved !== false; // Only approved admins can write
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInAsGuest,
      signInAsAdmin,
      signUpAsAdmin,
      signOut,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};
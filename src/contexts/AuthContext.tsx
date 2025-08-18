import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          console.log("⚠️ Supabase not configured, using mock auth");
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session error:", error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("❌ Initial session error:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔐 Auth state changed:", event);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("❌ Profile fetch error:", error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
          avatar_url: data.avatar_url
        });
        console.log("✅ User profile loaded:", data.email, "Role:", data.role);
      }
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        // Mock authentication for development
        if (email === "admin@company.com" && password === "admin123456") {
          const mockUser: User = {
            id: "mock-admin-id",
            email: "admin@company.com",
            full_name: "Admin User",
            role: "admin"
          };
          setUser(mockUser);
          console.log("✅ Mock admin login successful");
          return { success: true };
        }
        return { success: false, error: "Invalid credentials" };
      }

      console.log("🔐 Attempting sign in for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("✅ Sign in successful:", data.user.id);
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "Unknown error occurred" };
    } catch (error: any) {
      console.error("❌ Sign in exception:", error);
      return { success: false, error: error.message || "Sign in failed" };
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication not configured" };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name,
            phone: userData?.phone,
            role: userData?.role || 'customer'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Sign up failed" };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Update failed" };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
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
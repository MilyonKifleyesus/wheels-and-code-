import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import Toast from '../components/ui/Toast';

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
  sessionPersisted: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionPersisted, setSessionPersisted] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log("🔐 Checking initial authentication state...");
        
        // Check environment variables first
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        // Immediate fallback if no environment variables
        if (!supabaseUrl || !supabaseKey) {
          console.log("⚠️ Supabase environment variables not configured - skipping session check");
          if (mounted) setLoading(false);
          return;
        }
        if (!supabaseUrl || !supabaseKey) {
          console.log("⚠️ Supabase environment variables not configured");
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Skip session check if supabase client is not available
        if (!supabase) {
          console.log("⚠️ Supabase client not available - skipping session check");
          if (mounted) setLoading(false);
          return;
        }
        if (!supabase) {
          console.log("⚠️ Supabase not configured, using mock auth");
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Simple session check without timeout race condition
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return; // Component unmounted, don't update state
        
        if (error) {
          console.error("❌ Session error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log("✅ Found existing session for:", session.user.email);
          setSessionPersisted(true);
          await fetchUserProfile(session.user.id);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Initial session error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set a safety timeout to ensure loading state is cleared
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1000);

    getInitialSession().finally(() => clearTimeout(safetyTimeout));
    // Listen for auth changes
    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔐 Auth state changed:", event);
        
        if (mounted) {
          if (session?.user) {
            setSessionPersisted(true);
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setSessionPersisted(false);
          }
          setLoading(false);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Rate limiting for login attempts
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastLoginAttempt;
    
    // Reset attempts after 15 minutes
    if (timeSinceLastAttempt > 15 * 60 * 1000) {
      setLoginAttempts(0);
      return true;
    }
    
    // Allow max 5 attempts per 15 minutes
    return loginAttempts < 5;
  };
  const fetchUserProfile = async (userId: string) => {
    try {
      if (!supabase) return;

      console.log("👤 Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("❌ Profile fetch error:", error);
        // Don't leave loading state hanging on profile fetch error
        setLoading(false);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
          avatar_url: data.avatar_url
        };
        
        setUser(userProfile);
        console.log("✅ User profile loaded:", data.email, "Role:", data.role);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check rate limiting
      if (!checkRateLimit()) {
        return { success: false, error: "Too many login attempts. Please try again in 15 minutes." };
      }

      setLoading(true);
      setLastLoginAttempt(Date.now());
      setLoginAttempts(prev => prev + 1);
      
      if (!supabase) {
        // Mock authentication for development
        if (email === "mili.kifleyesus@gmail.com" && password === "P@ssw0rd123!") {
          const mockUser: User = {
            id: "mock-admin-id",
            email: "mili.kifleyesus@gmail.com",
            full_name: "Admin User",
            role: "admin"
          };
          setUser(mockUser);
          setSessionPersisted(true);
          setLoginAttempts(0); // Reset on successful login
          setLoading(false);
          console.log("✅ Mock admin login successful");
          return { success: true };
        }
        setLoading(false);
        return { success: false, error: "Invalid credentials" };
      }

      console.log("🔐 Attempting sign in for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true
        }
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("✅ Sign in successful:", data.user.id);
        setLoginAttempts(0); // Reset on successful login
        await fetchUserProfile(data.user.id);
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: "Unknown error occurred" };
    } catch (error: any) {
      console.error("❌ Sign in exception:", error);
      setLoading(false);
      return { success: false, error: error.message || "Sign in failed" };
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      if (!supabase) {
        setLoading(false);
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
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message || "Sign up failed" };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication not configured" };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Password reset failed" };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication not configured" };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Password update failed" };
    }
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Resend verification failed" };
    }
  };
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSessionPersisted(false);
      setLoading(false);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      setLoading(false);
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
      sessionPersisted,
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      signOut,
      updateProfile,
      resendVerification
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
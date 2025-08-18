import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin' | 'staff';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  isAdmin: boolean;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return null;
    }
  };

  const initializeAuth = async () => {
    try {
      // Get initial session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      );

      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      setSession(session);
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile with timeout - don't block auth flow if it fails
        try {
          const profilePromise = fetchUserProfile(session.user.id);
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          );

          const userProfile = await Promise.race([
            profilePromise,
            profileTimeoutPromise
          ]) as Profile | null;

          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (profileError) {
          console.warn('Profile fetch failed, continuing without profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) return { error };

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              phone: phone,
              role: 'customer'
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin" | "staff";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing authentication...");
        
        if (!supabase) {
          console.log("⚠️ Supabase not configured, skipping auth initialization");
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session check error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log("✅ Found existing session for:", session.user.email);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          console.log("ℹ️ No existing session found");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes only if supabase is available
    let subscription: any = null;
    
    if (supabase) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("✅ User signed in:", session.user.email);
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 User signed out");
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      });
      
      subscription = authSubscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!supabase) {
      console.warn("⚠️ Supabase not available for profile fetch");
      return;
    }
    
    try {
      console.log("👤 Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("⚠️ Profile fetch failed:", error.message);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log("🔄 Profile not found, creating new profile...");
          await createUserProfile(userId, email);
          return;
        }
        
        throw error;
      }

      if (data) {
        console.log("✅ Profile loaded successfully:", data.email, data.role);
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        });
      }
    } catch (error) {
      console.error("❌ Profile fetch error:", error);
      // Don't create fallback user - let the error be handled properly
      throw error;
    }
  };

  const createUserProfile = async (userId: string, email: string) => {
    if (!supabase) {
      console.warn("⚠️ Supabase not available for profile creation");
      return;
    }
    
    try {
      console.log("👤 Creating user profile...");
      
      const isAdmin = email === "admin@company.com";
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          full_name: isAdmin ? "Admin User" : "User",
          role: isAdmin ? "admin" : "customer",
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Profile creation failed:", error);
        throw error;
      }

      console.log("✅ Profile created successfully:", data);
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      });
    } catch (error) {
      console.error("❌ Profile creation error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.error("❌ Supabase not available for sign in");
      return { success: false, error: "Database connection not available" };
    }
    
    try {
      setUser(null); // Clear any existing user state
      
      // First, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log("⚠️ Sign in failed:", signInError.message);
        setLoading(false);
        
        // If user doesn't exist and this is admin, try to create admin user
        if (email === "admin@company.com" && signInError.message.includes("Invalid login credentials")) {
          console.log("🔧 Admin user doesn't exist, creating...");
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined,
              data: {
                full_name: "Admin User",
                role: "admin",
              },
            },
          });

          if (signUpError) {
            console.error("❌ Admin creation failed:", signUpError);
            setLoading(false);
            return { success: false, error: `Failed to create admin user: ${signUpError.message}` };
          }

          if (signUpData.user) {
            console.log("✅ Admin user created, creating profile...");
            await createUserProfile(signUpData.user.id, email);
            return { success: true };
          }
        }
        
        setLoading(false);
        return { success: false, error: signInError.message };
      }

      if (signInData.user) {
        console.log("✅ Sign in successful for:", signInData.user.email);
        // Profile will be fetched by the auth state change listener
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: "Login failed - no user data returned" };
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      setLoading(false);
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const signOut = async () => {
    try {
      console.log("👋 Signing out...");
      setLoading(true);
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      setUser(null); // Force sign out locally
    }
  };

  const isAdmin = user?.role === "admin";

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
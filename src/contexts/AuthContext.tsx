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
    // Check for existing session
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, attempting to create...");
          await createUserProfile(userId);
          return;
        }
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Get user info from auth
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || 'User',
            role: authUser.user.email === 'admin@company.com' ? 'admin' : 'customer'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Profile creation error:", error);
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        });
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // If user doesn't exist and it's the admin email, try to create admin user
        if (error.message.includes("Invalid login credentials") && email === "admin@company.com") {
          console.log("Admin user not found, attempting to create...");
          return await createAdminUser(email, password);
        }
        
        throw error;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const createAdminUser = async (email: string, password: string) => {
    try {
      console.log("🔧 Creating admin user...");
      
      // Try to sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: "Admin User",
            role: "admin",
          },
        },
      });

      if (error) {
        console.error("Admin signup error:", error);
        
        // If user already exists, try to sign in instead
        if (error.message.includes("already registered")) {
          console.log("Admin user already exists, trying to sign in...");
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            throw signInError;
          }
          
          if (signInData.user) {
            await fetchUserProfile(signInData.user.id);
            return { success: true };
          }
        }
        
        throw error;
      }

      if (data.user) {
        console.log("✅ Admin user created successfully");
        
        // Create admin profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: "Admin User",
              role: "admin",
            }
          ]);

        if (profileError) {
          console.error("Admin profile creation error:", profileError);
          // Don't throw error if profile already exists
          if (!profileError.message.includes("duplicate key")) {
            throw profileError;
          }
        }

        setUser({
          id: data.user.id,
          email: email,
          full_name: "Admin User",
          role: "admin",
        });

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Admin creation failed" };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
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
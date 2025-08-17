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
      console.log("🔐 Attempting sign in with:", email);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Supabase not configured - missing environment variables");
        return { 
          success: false, 
          error: "Database not configured. Please check your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" 
        };
      }
      
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
        
        return { 
          success: false, 
          error: `Login failed: ${error.message}. If this is your first time, the admin user will be created automatically.` 
        };
      }

      if (data.user) {
        console.log("✅ Sign in successful, fetching profile...");
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error: any) {
      console.error("❌ Sign in failed:", error);
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
          emailRedirectTo: undefined // Disable email confirmation
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
            console.error("❌ Admin sign in failed:", signInError);
            return { success: false, error: `Admin login failed: ${signInError.message}` };
          }
          
          if (signInData.user) {
            console.log("✅ Admin sign in successful");
            await fetchUserProfile(signInData.user.id);
            return { success: true };
          }
        }
        
        return { success: false, error: `Admin creation failed: ${error.message}` };
      }

      if (data.user) {
        console.log("✅ Admin user created successfully");
        
        // Create admin profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: "Admin User",
              role: "admin",
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error("Admin profile creation error:", profileError);
          
          // If profile creation fails, try to fetch existing profile
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
            
          if (existingProfile) {
            console.log("✅ Using existing admin profile");
            setUser({
              id: existingProfile.id,
              email: existingProfile.email,
              full_name: existingProfile.full_name,
              role: existingProfile.role,
            });
          } else {
            console.warn("⚠️ Profile creation failed, using basic user data");
            setUser({
              id: data.user.id,
              email: email,
              full_name: "Admin User",
              role: "admin",
            });
          }
        } else if (profileData) {
          console.log("✅ Admin profile created successfully");
          setUser({
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            role: profileData.role,
          });
        }

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error: any) {
      console.error("❌ Admin creation failed:", error);
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
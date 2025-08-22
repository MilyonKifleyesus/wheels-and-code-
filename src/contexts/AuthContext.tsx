import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import supabase from "../utils/supabase";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: "customer" | "admin" | "staff";
  avatar_url?: string;
}

// Type guard to safely extract user data from database results
const isValidUserData = (
  data: unknown
): data is {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: "customer" | "admin" | "staff";
  avatar_url?: string | null;
} => {
  if (!data || typeof data !== "object") return false;
  const userData = data as Record<string, unknown>;

  return (
    typeof userData.id === "string" &&
    typeof userData.email === "string" &&
    (userData.full_name === undefined ||
      userData.full_name === null ||
      typeof userData.full_name === "string") &&
    (userData.phone === undefined ||
      userData.phone === null ||
      typeof userData.phone === "string") &&
    (userData.role === "customer" ||
      userData.role === "admin" ||
      userData.role === "staff") &&
    (userData.avatar_url === undefined ||
      userData.avatar_url === null ||
      typeof userData.avatar_url === "string")
  );
};

// Helper function to safely create User object from database data
const createUserFromData = (data: unknown): User | null => {
  if (!isValidUserData(data)) {
    console.error("Invalid user data structure:", data);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name ?? undefined,
    phone: data.phone ?? undefined,
    role: data.role,
    avatar_url: data.avatar_url ?? undefined,
  };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  sessionPersisted: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    userData?: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionPersisted, setSessionPersisted] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number>(0);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // Define fetchUserProfile first so it can be used in useEffect
  const fetchUserProfile = useCallback(
    async (userId: string, userEmail?: string) => {
      try {
        if (!supabase) return;

        // Prevent multiple simultaneous profile fetches
        if (isFetchingProfile) {
          console.log("⚠️ Profile fetch already in progress, skipping...");
          return;
        }

        setIsFetchingProfile(true);
        console.log("👤 Fetching user profile for:", userId);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("❌ Profile fetch error:", error);

          // If profile doesn't exist, create it automatically
          if (error.code === "PGRST116") {
            console.log("🔄 Profile not found, creating new profile...");

            // Try to create the profile, but handle the case where it might already exist
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .upsert(
                {
                  id: userId,
                  email: userEmail,
                  full_name: "New User",
                  role: "customer",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "id",
                }
              )
              .select()
              .single();

            if (createError) {
              console.error("❌ Failed to create/update profile:", createError);
              console.log("🔍 Create error details:", {
                code: createError.code,
                message: createError.message,
                details: createError.details,
                hint: createError.hint,
              });

              // Try to fetch the profile again in case it was created by another process
              const { data: retryProfile, error: retryError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

              if (retryError || !retryProfile) {
                console.error(
                  "❌ Profile still not available after retry:",
                  retryError
                );
                console.log(
                  "🔄 Attempting to create profile with minimal fields..."
                );

                // Try one more time with minimal fields
                const { data: minimalProfile, error: minimalError } =
                  await supabase
                    .from("profiles")
                    .insert({
                      id: userId,
                      email: userEmail,
                      role: "customer",
                    })
                    .select()
                    .single();

                if (minimalError || !minimalProfile) {
                  console.error(
                    "❌ All profile creation attempts failed, signing out"
                  );
                  await supabase.auth.signOut();
                  setLoading(false);
                  setIsFetchingProfile(false);
                  return;
                }

                // Use the minimal profile
                const userProfile = createUserFromData(minimalProfile);
                if (!userProfile) {
                  console.error(
                    "❌ Failed to create user profile from minimal data"
                  );
                  await supabase.auth.signOut();
                  setLoading(false);
                  setIsFetchingProfile(false);
                  return;
                }

                setUser(userProfile);
                console.log(
                  "✅ Minimal admin profile created and loaded:",
                  minimalProfile.email
                );
                setLoading(false);
                setIsFetchingProfile(false);
                return;
              }

              // Use the retry profile
              const userProfile = createUserFromData(retryProfile);
              if (!userProfile) {
                console.error(
                  "❌ Failed to create user profile from retry data"
                );
                await supabase.auth.signOut();
                setLoading(false);
                setIsFetchingProfile(false);
                return;
              }

              setUser(userProfile);
              console.log(
                "✅ Admin profile loaded after retry:",
                retryProfile.email,
                "Role:",
                retryProfile.role
              );
              setLoading(false);
              setIsFetchingProfile(false);
              return;
            }

            if (newProfile) {
              const userProfile = createUserFromData(newProfile);
              if (!userProfile) {
                console.error(
                  "❌ Failed to create user profile from new profile data"
                );
                await supabase.auth.signOut();
                setLoading(false);
                setIsFetchingProfile(false);
                return;
              }

              setUser(userProfile);
              console.log(
                "✅ Admin profile created and loaded:",
                newProfile.email,
                "Role:",
                newProfile.role
              );
              setLoading(false);
              setIsFetchingProfile(false);
              return;
            }
          }

          // For other errors, sign out to prevent infinite loop
          console.error("❌ Critical profile error, signing out:", error);
          await supabase.auth.signOut();
          setLoading(false);
          setIsFetchingProfile(false);
          return;
        }

        if (data) {
          const userProfile = createUserFromData(data);
          if (!userProfile) {
            console.error("❌ Failed to create user profile from fetched data");
            await supabase.auth.signOut();
            setLoading(false);
            setIsFetchingProfile(false);
            return;
          }

          setUser(userProfile);
          console.log(
            "✅ User profile loaded:",
            data.email,
            "Role:",
            data.role
          );
        }
        setLoading(false);
      } catch (error: unknown) {
        console.error("❌ Profile fetch error:", error);
        // Sign out on any unexpected error to prevent infinite loop
        if (supabase) {
          await supabase.auth.signOut();
        }
        setLoading(false);
      } finally {
        setIsFetchingProfile(false);
      }
    },
    [isFetchingProfile]
  );

  useEffect(() => {
    let mounted = true;

    // Check for Supabase config once.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey || !supabase) {
      console.log("⚠️ Supabase not configured, skipping auth.");
      setLoading(false);
      return;
    }

    // onAuthStateChange handles everything: initial session, sign in, sign out.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event);

      if (!mounted) return;

      if (session?.user) {
        setSessionPersisted(true);
        // fetchUserProfile will set loading to false on its own.
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setSessionPersisted(false);
        setLoading(false); // Set loading false if no user.
      }
    });

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

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

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check rate limiting
      if (!checkRateLimit()) {
        return {
          success: false,
          error: "Too many login attempts. Please try again in 15 minutes.",
        };
      }

      setLoading(true);
      setLastLoginAttempt(Date.now());
      setLoginAttempts((prev) => prev + 1);

      console.log("🔐 Starting sign in process...");
      console.log("📧 Email:", email);
      console.log("🔧 Supabase client available:", !!supabase);
      if (!supabase) {
        // Mock authentication for development
        if (
          email === "mili.kifleyesus@gmail.com" &&
          password === "P@ssw0rd123!"
        ) {
          const mockUser: User = {
            id: "mock-admin-id",
            email: "mili.kifleyesus@gmail.com",
            full_name: "Admin User",
            role: "admin",
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

      // Implement retry mechanism for network errors
      const maxRetries = 3;
      let retries = 0;
      let data = null;
      let error = null;

      while (retries < maxRetries) {
        try {
          console.log(`🔄 Attempt ${retries + 1}/${maxRetries}...`);
          ({ data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          }));

          // If no error or non-retryable error, break the loop
          if (!error) {
            break;
          }

          // Check if it's a retryable network error
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("Network") ||
            error.message.includes("timeout")
          ) {
            console.warn(
              `⚠️ Network error, retrying (${retries + 1}/${maxRetries})...`
            );
            retries++;
            if (retries < maxRetries) {
              // Exponential backoff: wait longer between retries
              const delay = 1000 * Math.pow(2, retries - 1);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          } else {
            // Non-retryable error, break the loop
            break;
          }
        } catch {
          console.warn(
            `⚠️ Network exception, retrying (${retries + 1}/${maxRetries})...`
          );
          retries++;
          if (retries < maxRetries) {
            const delay = 1000 * Math.pow(2, retries - 1);
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (error) {
        console.error("❌ Sign in error after retries:", error);
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        console.log("✅ Sign in successful:", data.user.id);
        setLoginAttempts(0); // Reset on successful login
        await fetchUserProfile(data.user.id, data.user.email);
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: "Unknown error occurred" };
    } catch (error: unknown) {
      console.error("❌ Sign in exception:", error);
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      if (!supabase) {
        console.log("⚠️ No Supabase client, using mock authentication");
        setLoading(false);
        console.log("❌ Mock login failed - invalid credentials");
        return { success: false, error: "Authentication not configured" };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name,
            phone: userData?.phone,
            role: userData?.role || "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication not configured" };
      }

      // Implement retry mechanism for network errors
      const maxRetries = 3;
      let retries = 0;
      let error = null;

      while (retries < maxRetries) {
        try {
          console.log(
            `🔄 Password reset attempt ${retries + 1}/${maxRetries}...`
          );
          const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          console.log("📊 Sign in response:", { 
            hasData: !!data, 
            hasUser: !!data?.user, 
            hasSession: !!data?.session,
            error: error?.message 
          });

          if (!result.error) {
            return { success: true };
          }

          // Check if it's a retryable network error
          if (
            result.error.message.includes("Failed to fetch") ||
            result.error.message.includes("Network") ||
            result.error.message.includes("timeout")
          ) {
            console.warn(
              `⚠️ Network error, retrying (${retries + 1}/${maxRetries})...`
            );
            retries++;
            if (retries < maxRetries) {
              const delay = 1000 * Math.pow(2, retries - 1);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          } else {
            error = result.error;
            break;
          }
        } catch {
          console.warn(
            `⚠️ Network exception, retrying (${retries + 1}/${maxRetries})...`
          );
          retries++;
          if (retries < maxRetries) {
            const delay = 1000 * Math.pow(2, retries - 1);
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "Reset password failed after retries" };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication not configured" };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Password update failed",
      };
    }
  };

  const resendVerification = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (!supabase || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Resend verification failed",
      };
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

  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setUser((prev) => (prev ? { ...prev, ...updates } : null));
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
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
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

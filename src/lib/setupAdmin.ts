import supabase from "../utils/supabase";

export const setupAdminUser = async () => {
  try {
    console.log("🔧 Setting up admin user...");

    // First, try to sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: "mili.kifleyesus@gmail.com",
      password: "P@ssw0rd123!",
      options: {
        data: {
          full_name: "Admin User",
          role: "admin",
        },
      },
    });

    if (error) {
      console.error("❌ Sign up error:", error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log("✅ Admin user created successfully:", data.user.id);

      // Now create the profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: "mili.kifleyesus@gmail.com",
          full_name: "Admin User",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
        return { success: false, error: profileError.message };
      }

      console.log("✅ Admin profile created successfully");
      return { success: true, user: data.user };
    }

    return { success: false, error: "No user data returned" };
  } catch (error) {
    console.error("❌ Setup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const checkAdminUser = async () => {
  try {
    console.log("🔍 Checking admin user...");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .single();

    if (error) {
      console.error("❌ Check error:", error);
      return { exists: false, error: error.message };
    }

    if (data) {
      console.log("✅ Admin user found:", data);
      return { exists: true, user: data };
    }

    return { exists: false, user: null };
  } catch (error) {
    console.error("❌ Check error:", error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

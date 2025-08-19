import { supabase } from "./supabase";

/**
 * Enhanced setup script to create the first admin user
 * This version handles the authentication issues and creates a working admin account
 */
export const setupAdminUser = async () => {
  try {
    console.log("🚀 Starting enhanced admin user setup...");
    console.log("==========================================");

    // Check if Supabase is available
    if (!supabase) {
      console.error("❌ Supabase client not available");
      console.log("💡 Please ensure your .env file is configured with Supabase credentials");
      return;
    }

    // Step 1: Try to sign up the admin user (this creates the auth user)
    console.log("1️⃣ Creating admin user in Supabase Auth...");
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: "mili.kifleyesus@gmail.com",
      password: "P@ssw0rd123!",
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: "Admin User",
          role: "admin",
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
        console.log("✅ Admin user already exists in auth system");
        
        // Test if we can sign in
        console.log("🔐 Testing existing user login...");
        const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
          email: "mili.kifleyesus@gmail.com",
          password: "P@ssw0rd123!",
        });
        
        if (testLogin?.user) {
          console.log("✅ Existing user can login successfully!");
          await supabase.auth.signOut();
          return;
        } else {
          console.error("❌ Existing user cannot login:", testError?.message);
          console.log("💡 You may need to reset the password or create the user manually in Supabase Dashboard");
          return;
        }
      } else {
        console.error("❌ Failed to create admin user:", signUpError.message);
        console.log("💡 You may need to create the user manually in Supabase Dashboard → Authentication → Users");
        return;
      }
    }

    if (signUpData?.user) {
      console.log("✅ Admin user created in auth system:", signUpData.user.id);
      console.log("📧 Email confirmed:", signUpData.user.email_confirmed_at ? "Yes" : "No");
      
      // Step 2: Ensure profile exists
      console.log("2️⃣ Ensuring admin profile exists...");
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", signUpData.user.id)
        .single();
        
      if (!existingProfile) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: signUpData.user.id,
            email: "mili.kifleyesus@gmail.com",
            full_name: "Admin User",
            role: "admin",
          })
          .select()
          .single();

        if (profileError) {
          console.error("❌ Profile creation error:", profileError);
        } else {
          console.log("✅ Admin profile created:", profileData);
        }
      } else {
        console.log("✅ Admin profile already exists");
      }
      
      // Sign out after setup
      await supabase.auth.signOut();
      
      console.log("🎉 Admin user setup complete!");
      console.log("==========================================");
      console.log("📧 Email: mili.kifleyesus@gmail.com");
      console.log("🔑 Password: P@ssw0rd123!");
      console.log("👤 Role: admin");
      console.log("==========================================");
      console.log("💡 You can now try logging in!");
    }
  } catch (error) {
    console.error("❌ Setup error:", error);
  }
};

/**
 * Test function to verify admin setup
 */
export const testAdminSetup = async () => {
  try {
    console.log("🧪 Testing admin setup...");

    // Check profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "mili.kifleyesus@gmail.com");

    if (profileError) {
      console.error("❌ Profile check failed:", profileError);
      return;
    }

    console.log("📊 Admin profiles found:", profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name,
        });
      });
    }

    // Test login
    console.log("🔐 Testing login...");
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: "mili.kifleyesus@gmail.com",
        password: "P@ssw0rd123!",
      });

    if (loginError) {
      console.error("❌ Login test failed:", loginError);
      console.log("💡 Admin user needs to be created in Supabase auth system");
    } else {
      console.log("✅ Login test successful:", loginData.user?.id);
      // Sign out after test
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

/**
 * Quick fix function to resolve common issues
 */
export const quickFix = async () => {
  try {
    console.log("🔧 Running quick fix...");

    // 1. Create admin profile if it doesn't exist
    await setupAdminUser();

    // 2. Test the setup
    await testAdminSetup();

    console.log("✅ Quick fix completed!");
  } catch (error) {
    console.error("❌ Quick fix failed:", error);
  }
};

// Export the main function for easy access
export default setupAdminUser;
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
      return;
    }

    // Step 1: Check if admin user already exists
    console.log("1️⃣ Checking if admin user already exists...");
    
    // First check if auth user exists by trying to sign in
    const { data: testLogin, error: testLoginError } = await supabase.auth.signInWithPassword({
      email: "mili.kifleyesus@gmail.com",
      password: "P@ssw0rd123!",
    });

    if (testLogin?.user && !testLoginError) {
      console.log("✅ Admin user already exists and can login!");
      console.log("User ID:", testLogin.user.id);
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", testLogin.user.id)
        .single();
        
      if (!profile) {
        console.log("🔄 Creating missing profile for existing user...");
        await supabase.from("profiles").insert({
          id: testLogin.user.id,
          email: "mili.kifleyesus@gmail.com",
          full_name: "Admin User",
          role: "admin",
        });
      }
      
      // Sign out after test
      await supabase.auth.signOut();
      console.log("✅ Setup verified - you can now login!");
      return;
    }

    console.log("❌ Admin user doesn't exist, creating new one...");

    // Step 2: Create user account with signUp
    console.log("2️⃣ Creating user account...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "mili.kifleyesus@gmail.com",
      password: "P@ssw0rd123!",
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
        data: {
          full_name: "Admin User",
          role: "admin",
        },
      },
    });

    if (authError) {
      console.error("❌ Auth signup error:", authError);
      
      // Check if user already exists error
      if (authError.message.includes("already registered")) {
        console.log("✅ User already exists in auth system");
        console.log("🔄 Trying to sign in with existing user...");
        
        const { data: existingLogin, error: existingLoginError } = await supabase.auth.signInWithPassword({
          email: "mili.kifleyesus@gmail.com",
          password: "P@ssw0rd123!",
        });
        
        if (existingLogin?.user) {
          console.log("✅ Successfully signed in with existing user");
          await supabase.auth.signOut();
          return;
        } else {
          console.error("❌ Could not sign in with existing user:", existingLoginError);
        }
      }
      return;
    }

    if (authData.user) {
      console.log("✅ User account created:", authData.user.id);
      console.log("📧 Email confirmed:", authData.user.email_confirmed_at ? "Yes" : "No");

      // Step 3: Create the profile with admin role
      console.log("3️⃣ Creating admin profile...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: "mili.kifleyesus@gmail.com",
          full_name: "Admin User",
          role: "admin",
        })
        .select()
        .single();

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
        return;
      }

      console.log("✅ Admin profile created:", profileData);
      
      // Sign out after creation
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
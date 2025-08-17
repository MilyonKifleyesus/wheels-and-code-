import { supabase } from "./supabase";

/**
 * Enhanced setup script to create the first admin user
 * This version handles the authentication issues and creates a working admin account
 */
export const setupAdminUser = async () => {
  try {
    console.log("🚀 Starting enhanced admin user setup...");
    console.log("==========================================");

    // Step 1: Check if admin user already exists
    console.log("1️⃣ Checking if admin user already exists...");
    const { data: existingProfiles, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "admin@company.com")
      .eq("role", "admin");

    if (profileCheckError) {
      console.error("❌ Error checking existing profiles:", profileCheckError);
      return;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log("✅ Admin profile already exists:", existingProfiles[0]);
      console.log("You can now try logging in with:");
      console.log("Email: admin@company.com");
      console.log("Password: admin123456");
      return;
    }

    console.log("❌ No admin profile found, creating new one...");

    // Step 2: Create user account with signUp
    console.log("2️⃣ Creating user account...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "admin@company.com",
      password: "admin123456",
      options: {
        data: {
          full_name: "Admin User",
          role: "admin",
        },
      },
    });

    if (authError) {
      console.error("❌ Auth signup error:", authError);

      // If signup fails, try to create just the profile
      console.log("🔄 Trying alternative approach - creating profile only...");
      await createAdminProfileOnly();
      return;
    }

    if (authData.user) {
      console.log("✅ User account created:", authData.user.id);
      console.log(
        "📧 Email confirmation required:",
        authData.user.email_confirmed_at ? "No" : "Yes"
      );

      // Step 3: Create the profile with admin role
      console.log("3️⃣ Creating admin profile...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: "admin@company.com",
          full_name: "Admin User",
          role: "admin",
        })
        .select()
        .single();

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);

        // Try to create profile with a new UUID
        console.log("🔄 Trying to create profile with new UUID...");
        await createAdminProfileOnly();
        return;
      }

      console.log("✅ Admin profile created:", profileData);
      console.log("🎉 Admin user setup complete!");
      console.log("==========================================");
      console.log("📧 Email: admin@company.com");
      console.log("🔑 Password: admin123456");
      console.log("👤 Role: admin");
      console.log("==========================================");
      console.log(
        "⚠️  Note: If email confirmation is required, check your email first"
      );
      console.log("💡 You can now try logging in!");
    }
  } catch (error) {
    console.error("❌ Setup error:", error);
    console.log("🔄 Trying alternative approach...");
    await createAdminProfileOnly();
  }
};

/**
 * Alternative method to create admin profile when auth signup fails
 */
const createAdminProfileOnly = async () => {
  try {
    console.log("🔄 Creating admin profile using alternative method...");

    // Create a profile with a new UUID
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(), // Generate new UUID
        email: "admin@company.com",
        full_name: "Admin User",
        role: "admin",
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Alternative profile creation failed:", profileError);
      console.log("💡 You may need to run the database migration first");
      return;
    }

    console.log(
      "✅ Admin profile created with alternative method:",
      profileData
    );
    console.log(
      "⚠️  Note: You'll need to create the auth user manually or use email/password login"
    );
  } catch (error) {
    console.error("❌ Alternative method failed:", error);
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
      .eq("email", "admin@company.com");

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
        email: "admin@company.com",
        password: "admin123456",
      });

    if (loginError) {
      console.error("❌ Login test failed:", loginError);
      console.log("💡 This might be expected if the auth user wasn't created");
    } else {
      console.log("✅ Login test successful:", loginData.user?.id);
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

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Missing Supabase environment variables");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Present" : "❌ Missing");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Present" : "❌ Missing");
}
// Only create client if both URL and key are provided
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Log client creation status
if (supabase) {
  console.log("✅ Supabase client created successfully");
} else {
  console.warn("❌ Supabase client not created - missing environment variables");
}
// Test connection function
export const testSupabaseConnection = async () => {
  console.log("🧪 Testing Supabase Connection...");

  if (!supabase) {
    console.log("❌ Supabase client not available - missing environment variables");
    return { success: false, error: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables" };
  }

  try {
    // Test auth connection (doesn't require RLS)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log("❌ Auth connection failed:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Supabase connection successful!");
    console.log(
      "Session status:",
      data.session ? "Active session" : "No active session"
    );
    return { success: true, session: data.session };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log("❌ Connection test failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Get configuration status for debugging
export const getConfigurationStatus = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    hasClient: !!supabase,
    urlValue: supabaseUrl,
    keyLength: supabaseKey?.length || 0,
    isConfigured: !!(supabaseUrl && supabaseKey && supabase),
  };
};

export default supabase;

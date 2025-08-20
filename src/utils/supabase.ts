// Re-export the single, robust Supabase client to avoid multiple instances.
// This prevents duplicate auth listeners and token refresh race conditions.
export {
  supabase as default,
  supabase,
  safeSupabaseCall,
  testSupabaseConnection,
  isSupabaseConfigured,
  getConfigurationStatus,
  forceRecreateClient,
} from "../lib/supabase";

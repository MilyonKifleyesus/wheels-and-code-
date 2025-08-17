import { createClient } from "@supabase/supabase-js";

// Environment variable validation and testing
const validateEnvironmentVariables = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log("🔍 Environment Variable Check:");
  console.log("==========================================");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Present" : "❌ Missing");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Present" : "❌ Missing");
  console.log("Environment Mode:", import.meta.env.MODE);
  console.log("All Environment Variables:", Object.keys(import.meta.env));
  
  if (supabaseUrl) {
    console.log("URL Value:", supabaseUrl);
    console.log("URL Format Valid:", supabaseUrl.includes('.supabase.co') ? "✅ Yes" : "❌ No");
  }
  
  if (supabaseAnonKey) {
    console.log("Key Length:", supabaseAnonKey.length);
    console.log("Key Format Valid:", supabaseAnonKey.length > 50 ? "✅ Yes" : "❌ No");
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

// Run validation immediately
const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();

// Create Supabase client with fallback handling
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
  : null;

// Test connection function
export const testSupabaseConnection = async () => {
  console.log("🧪 Testing Supabase Connection...");
  
  if (!supabase) {
    console.log("❌ Supabase client not initialized (missing environment variables)");
    return { success: false, error: "Missing environment variables" };
  }
  
  try {
    // Test auth connection (doesn't require RLS)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log("❌ Auth connection failed:", error.message);
      return { success: false, error: error.message };
    }
    
    console.log("✅ Supabase connection successful!");
    console.log("Session status:", data.session ? "Active session" : "No active session");
    return { success: true, session: data.session };
  } catch (err: any) {
    console.log("❌ Connection test failed:", err.message);
    return { success: false, error: err.message };
  }
};

// Run initial connection test
if (supabase) {
  testSupabaseConnection();
}

// Check if environment variables are properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Get configuration status for debugging
export const getConfigurationStatus = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    hasClient: !!supabase,
    urlValue: supabaseUrl,
    keyLength: supabaseAnonKey?.length || 0,
    isConfigured: isSupabaseConfigured()
  };
};

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "customer" | "admin" | "staff";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin" | "staff";
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin" | "staff";
          avatar_url?: string | null;
        };
      };
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          year: number;
          price: number;
          mileage: number;
          vin: string | null;
          status: "available" | "sold" | "reserved" | "maintenance";
          images: string[];
          specs: Record<string, unknown>;
          features: string[];
          tags: string[];
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          make: string;
          model: string;
          year: number;
          price: number;
          mileage: number;
          vin?: string | null;
          status?: "available" | "sold" | "reserved" | "maintenance";
          images?: string[];
          specs?: Record<string, unknown>;
          features?: string[];
          tags?: string[];
          description?: string | null;
        };
        Update: {
          make?: string;
          model?: string;
          year?: number;
          price?: number;
          mileage?: number;
          vin?: string | null;
          status?: "available" | "sold" | "reserved" | "maintenance";
          images?: string[];
          specs?: Record<string, unknown>;
          features?: string[];
          tags?: string[];
          description?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          service_id: string | null;
          vehicle_info: string;
          booking_date: string;
          booking_time: string;
          status:
            | "pending"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          notes: string | null;
          estimated_cost: number | null;
          actual_cost: number | null;
          location_id: string | null;
          assigned_staff: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_id?: string | null;
          service_id?: string | null;
          vehicle_info: string;
          booking_date: string;
          booking_time: string;
          status?:
            | "pending"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          notes?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          location_id?: string | null;
          assigned_staff?: string | null;
        };
        Update: {
          customer_id?: string | null;
          service_id?: string | null;
          vehicle_info?: string;
          booking_date?: string;
          booking_time?: string;
          status?:
            | "pending"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled";
          notes?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          location_id?: string | null;
          assigned_staff?: string | null;
        };
      };
      content_sections: {
        Row: {
          id: string;
          section_type: string;
          title: string;
          visible: boolean;
          sort_order: number;
          content: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          section_type: string;
          title: string;
          visible?: boolean;
          sort_order?: number;
          content?: Record<string, unknown>;
        };
        Update: {
          title?: string;
          visible?: boolean;
          sort_order?: number;
          content?: Record<string, unknown>;
        };
      };
    };
  };
}

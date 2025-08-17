import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables for debugging
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseAnonKey ? "Present" : "Missing");
console.log("Environment:", import.meta.env.MODE);

// Enhanced environment variable validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error(
    "VITE_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✓ Set" : "✗ Missing"
  );
  
  // Show instructions for setting up environment variables
  console.error("\n🔧 Setup Instructions:");
  console.error("1. Create a .env file in your project root");
  console.error("2. Add your Supabase credentials:");
  console.error("   VITE_SUPABASE_URL=https://your-project-id.supabase.co");
  console.error("   VITE_SUPABASE_ANON_KEY=your-anon-key-here");
  
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Validate URL format
if (
  supabaseUrl &&
  !supabaseUrl.startsWith("https://") ||
  !supabaseUrl.includes(".supabase.co")
) {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  throw new Error(
    "Invalid Supabase URL format. URL should be: https://your-project-id.supabase.co"
  );
}

// Validate key format (basic check)
if (supabaseAnonKey.length < 50) {
  console.error("Supabase anon key appears to be invalid (too short)");
  throw new Error("Invalid Supabase anon key format");
}

console.log("Supabase configuration validated successfully");
console.log("URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});

// Test the connection
if (supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection test failed:", error);
    } else {
      console.log("Supabase connection test successful");
      console.log("Current session:", data.session ? "Active" : "None");
    }
  });
} else {
  console.warn("Skipping connection test due to missing credentials");
}

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
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          service: string;
          vehicle: string;
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
          assigned_technician: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          service: string;
          vehicle: string;
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
          assigned_technician?: string | null;
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          service?: string;
          vehicle?: string;
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
          assigned_technician?: string | null;
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

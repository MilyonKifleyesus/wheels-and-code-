import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  addBooking: (booking: BookingInsert) => Promise<void>;
  updateBooking: (id: string, booking: BookingUpdate) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Add some sample data if no bookings exist
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: 'exact', head: true });

      if (count === 0) {

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

        // If no data, add sample bookings
        if (!data || data.length === 0) {
          const sampleBookings = [
            {
              customer_name: 'John Smith',
              customer_email: 'john@example.com',
              customer_phone: '(416) 555-0123',
              service: 'Oil Change',
              vehicle: '2020 BMW M3',
              booking_date: '2024-01-20',
              booking_time: '10:00',
              status: 'confirmed',
              estimated_cost: 150
            },
            {
              customer_name: 'Sarah Johnson',
              customer_email: 'sarah@example.com',
              customer_phone: '(416) 555-0456',
              service: 'Brake Service',
              vehicle: '2021 Mercedes C300',
              booking_date: '2024-01-22',
              booking_time: '14:00',
              status: 'pending',
              estimated_cost: 450
            }
          ];

          for (const booking of sampleBookings) {
            try {
              await supabase.from("bookings").insert([booking]);
            } catch (insertError) {
              console.warn("Could not insert sample booking:", insertError);
            }
          }

          // Fetch again after inserting samples
          const { data: newData } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });
          
          setBookings(newData || []);
          return;
        }
      }

      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to fetch bookings";
      if (err instanceof Error) {
        if (err.message.includes("JWT")) {
          errorMessage =
            "Authentication error - please check your Supabase configuration";
        } else if (err.message.includes("fetch")) {
          errorMessage =
            "Network error - please check your internet connection";
        } else if (err.message.includes("500")) {
          errorMessage =
            "Server error - please check your Supabase database configuration";
        } else if (
          err.message.includes("42P17") ||
          err.message.includes("infinite recursion")
        ) {
          errorMessage =
            "Database policy error - RLS policies have infinite recursion. Please run the RLS fix script.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      // Set empty array as fallback to prevent UI crashes
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: BookingInsert) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      setBookings((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error adding booking:", err);
      setError(err instanceof Error ? err.message : "Failed to add booking");
      throw err;
    }
  };

  const updateBooking = async (id: string, updates: BookingUpdate) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? data : booking))
      );
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(err instanceof Error ? err.message : "Failed to update booking");
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;

      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError(err instanceof Error ? err.message : "Failed to delete booking");
      throw err;
    }
  };

  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    await updateBooking(id, { status });
  };

  const getBookingById = (id: string) => {
    return bookings.find((booking) => booking.id === id);
  };

  const refreshBookings = async () => {
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          console.log("Booking change received:", payload);
          fetchBookings(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        addBooking,
        updateBooking,
        deleteBooking,
        getBookingById,
        updateBookingStatus,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
};

export type { Booking, BookingInsert, BookingUpdate };

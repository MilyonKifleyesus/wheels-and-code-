import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "../utils/supabase";

export interface Booking {
  id: string; // Changed to string to support UUIDs from Supabase
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedTechnician?: string;
  createdAt?: string;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Promise<void>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  refreshBookings: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    console.log("📅 Starting booking fetch process...");
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          customer_name,
          customer_phone,
          customer_email,
          service,
          vehicle,
          booking_date,
          booking_time,
          status,
          notes,
          estimated_cost,
          actual_cost,
          assigned_technician,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Database booking fetch failed:", error.message);
        setError(error.message);
        setBookings([]); // Clear bookings on error
        return;
      }

      if (data) {
        console.log("✅ Database bookings loaded:", data.length);
        const convertedBookings: Booking[] = data.map((dbBooking) => ({
          id: dbBooking.id,
          customerName: dbBooking.customer_name,
          customerPhone: dbBooking.customer_phone,
          customerEmail: dbBooking.customer_email,
          service: dbBooking.service,
          vehicle: dbBooking.vehicle,
          date: dbBooking.booking_date,
          time: dbBooking.booking_time,
          status: dbBooking.status as Booking["status"],
          notes: dbBooking.notes || undefined,
          estimatedCost: dbBooking.estimated_cost || undefined,
          actualCost: dbBooking.actual_cost || undefined,
          assignedTechnician: dbBooking.assigned_technician || undefined,
          createdAt: dbBooking.created_at,
        }));
        setBookings(convertedBookings);
      }
    } catch (err) {
      console.error("❌ Database error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, "id" | "createdAt">) => {
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          customer_name: bookingData.customerName,
          customer_phone: bookingData.customerPhone,
          customer_email: bookingData.customerEmail,
          service: bookingData.service,
          vehicle: bookingData.vehicle,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          status: bookingData.status,
          notes: bookingData.notes,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log(
        "✅ Booking added to database:",
        bookingData.service,
        "for",
        bookingData.customerName
      );
      await fetchBookings(); // Refresh bookings from DB
    } catch (error) {
      console.error("❌ Error adding booking:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    // Convert camelCase keys to snake_case for Supabase
    const dbUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return [snakeKey, value];
      })
    );

    const { error } = await supabase.from("bookings").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("❌ Error updating booking:", error.message);
      setError(error.message);
    } else {
      console.log("✅ Booking updated:", id);
      await fetchBookings();
    }
  };

  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      console.error("❌ Error deleting booking:", error.message);
      setError(error.message);
    } else {
      console.log("✅ Booking deleted:", id);
      await fetchBookings();
    }
  };

  const updateBookingStatus = async (id: string, status: Booking["status"]) => {
    await updateBooking(id, { status });
  };

  const getBookingById = (id: string) => {
    return bookings.find((booking) => booking.id === id);
  };

  const refreshBookings = () => {
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
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

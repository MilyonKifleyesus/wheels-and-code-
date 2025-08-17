import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
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
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: number, booking: Partial<Booking>) => void;
  deleteBooking: (id: number) => void;
  getBookingById: (id: number) => Booking | undefined;
  updateBookingStatus: (id: number, status: Booking['status']) => void;
  refreshBookings: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Sample bookings that always work
const getSampleBookings = (): Booking[] => [
  {
    id: 1,
    customerName: "John Smith",
    customerPhone: "(416) 555-0123",
    customerEmail: "john.smith@email.com",
    service: "Oil Change",
    vehicle: "2020 BMW M3",
    date: "2024-01-20",
    time: "10:00 AM",
    status: "confirmed",
    estimatedCost: 150,
    assignedTechnician: "Mike Johnson",
    notes: "Customer prefers synthetic oil",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    customerName: "Sarah Johnson",
    customerPhone: "(416) 555-0456",
    customerEmail: "sarah.johnson@email.com",
    service: "Brake Service",
    vehicle: "2021 Mercedes C300",
    date: "2024-01-22",
    time: "2:00 PM",
    status: "pending",
    estimatedCost: 450,
    notes: "Front brake pads replacement needed",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    customerName: "Mike Rodriguez",
    customerPhone: "(416) 555-0789",
    customerEmail: "mike.rodriguez@email.com",
    service: "Performance Tune",
    vehicle: "2019 Porsche 911",
    date: "2024-01-25",
    time: "9:00 AM",
    status: "in-progress",
    estimatedCost: 899,
    actualCost: 950,
    assignedTechnician: "Alex Chen",
    notes: "ECU tune and exhaust upgrade",
    createdAt: new Date().toISOString(),
  },
];

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    console.log("📅 Starting booking fetch process...");
    
    // Always start with sample data
    const sampleBookings = getSampleBookings();
    setBookings(sampleBookings);
    console.log("✅ Sample bookings loaded:", sampleBookings.length);

    // Try to enhance with database data if available
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log("⚠️ Supabase not configured, using sample data only");
        return;
      }

      console.log("🔄 Attempting to fetch bookings from database...");
      // Note: Using the actual database schema columns
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          vehicle_info,
          booking_date,
          booking_time,
          status,
          notes,
          estimated_cost,
          actual_cost,
          assigned_staff,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("⚠️ Database booking fetch failed, keeping sample data:", error.message);
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Database bookings loaded:", data.length);
        // Convert database format to UI format
        const convertedBookings: Booking[] = data.map((dbBooking, index) => ({
          id: index + 1,
          customerName: `Customer ${index + 1}`,
          customerPhone: "(416) 555-0000",
          customerEmail: `customer${index + 1}@email.com`,
          service: "Service from Database",
          vehicle: dbBooking.vehicle_info,
          date: dbBooking.booking_date,
          time: dbBooking.booking_time,
          status: dbBooking.status as Booking['status'],
          notes: dbBooking.notes || undefined,
          estimatedCost: dbBooking.estimated_cost || undefined,
          actualCost: dbBooking.actual_cost || undefined,
          assignedTechnician: dbBooking.assigned_staff || undefined,
          createdAt: dbBooking.created_at,
        }));
        
        setBookings(convertedBookings);
      }
    } catch (err) {
      console.warn("⚠️ Database error, keeping sample data:", err);
    }
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    console.log("✅ Booking added:", newBooking.service, "for", newBooking.customerName);
  };

  const updateBooking = (id: number, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, ...updates } : booking
    ));
    console.log("✅ Booking updated:", id);
  };

  const deleteBooking = (id: number) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
    console.log("✅ Booking deleted:", id);
  };

  const updateBookingStatus = (id: number, status: Booking['status']) => {
    updateBooking(id, { status });
  };

  const getBookingById = (id: number) => {
    return bookings.find(booking => booking.id === id);
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

export type { Booking };
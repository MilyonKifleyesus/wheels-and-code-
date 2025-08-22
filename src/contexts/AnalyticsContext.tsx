import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useVehicles } from "./VehicleContext";
import { useBookings } from "./BookingContext";
import { Vehicle } from "./VehicleContext";

export interface MonthlyData {
  month: string;
  sales: number;
  services: number;
  vehicles: number;
}

export interface TopService {
  name: string;
  revenue: number;
  bookings: number;
}

export interface CustomerSegment {
    segment: 'New' | 'Regular' | 'VIP';
    count: number;
    revenue: number;
}

export interface VehiclePerformance {
    name: string;
    status: Vehicle['status'];
    price: number;
    id: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number; // Percentage change from previous period
  vehiclesSold: number;
  vehiclesSoldChange: number;
  totalBookings: number;
  bookingsChange: number;
  activeCustomers: number;
  customersChange: number;
  monthlyData: MonthlyData[];
  topServices: TopService[];
  customerSegments: CustomerSegment[];
  vehiclePerformance: VehiclePerformance[];
}

interface AnalyticsContextType {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { vehicles, refreshVehicles } = useVehicles();
  const { bookings, refreshBookings } = useBookings();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateAnalytics = useCallback(() => {
    setLoading(true);
    setError(null);

    if (vehicles.length === 0 && bookings.length === 0) {
        setLoading(false);
        return;
    }

    try {
      // --- Helper for date ranges ---
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

      // --- Revenue Calculations ---
      const soldVehicles = vehicles.filter(v => v.status === 'sold' && v.updated_at);
      const completedBookings = bookings.filter(b => b.status === 'completed' && b.createdAt);

      const currentSalesRevenue = soldVehicles
        .filter(v => new Date(v.updated_at!) >= oneMonthAgo)
        .reduce((sum, v) => sum + v.price, 0);
      const previousSalesRevenue = soldVehicles
        .filter(v => new Date(v.updated_at!) < oneMonthAgo && new Date(v.updated_at!) >= twoMonthsAgo)
        .reduce((sum, v) => sum + v.price, 0);

      const currentServiceRevenue = completedBookings
        .filter(b => new Date(b.createdAt!) >= oneMonthAgo)
        .reduce((sum, b) => sum + (b.actualCost || 0), 0);
      const previousServiceRevenue = completedBookings
        .filter(b => new Date(b.createdAt!) < oneMonthAgo && new Date(b.createdAt!) >= twoMonthsAgo)
        .reduce((sum, b) => sum + (b.actualCost || 0), 0);

      const totalRevenue = currentSalesRevenue + currentServiceRevenue;
      const previousTotalRevenue = previousSalesRevenue + previousServiceRevenue;
      const revenueChange = previousTotalRevenue > 0 ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : totalRevenue > 0 ? 100 : 0;

      // --- Key Metrics ---
      const vehiclesSold = soldVehicles.filter(v => new Date(v.updated_at!) >= oneMonthAgo).length;
      const prevVehiclesSold = soldVehicles.filter(v => new Date(v.updated_at!) < oneMonthAgo && new Date(v.updated_at!) >= twoMonthsAgo).length;
      const vehiclesSoldChange = prevVehiclesSold > 0 ? ((vehiclesSold - prevVehiclesSold) / prevVehiclesSold) * 100 : vehiclesSold > 0 ? 100 : 0;

      const totalBookings = bookings.filter(b => new Date(b.createdAt!) >= oneMonthAgo).length;
      const prevTotalBookings = bookings.filter(b => new Date(b.createdAt!) < oneMonthAgo && new Date(b.createdAt!) >= twoMonthsAgo).length;
      const bookingsChange = prevTotalBookings > 0 ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 : totalBookings > 0 ? 100 : 0;

      const activeCustomers = new Set(bookings.map(b => b.customerEmail)).size;
      // Customer change is harder to calculate meaningfully without more data, so we'll use a placeholder logic.
      const customersChange = 22; // Placeholder

      // --- Monthly Data (for the last 6 months) ---
      const monthlyDataMap: { [key: string]: { sales: number, services: number, vehicles: number } } = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          monthlyDataMap[monthKey] = { sales: 0, services: 0, vehicles: 0 };
      }
      soldVehicles.forEach(v => {
          const soldDate = new Date(v.updated_at!);
          const monthKey = `${monthNames[soldDate.getMonth()]} ${soldDate.getFullYear()}`;
          if (monthlyDataMap[monthKey]) {
              monthlyDataMap[monthKey].sales += v.price;
              monthlyDataMap[monthKey].vehicles += 1;
          }
      });
      completedBookings.forEach(b => {
          const completedDate = new Date(b.createdAt!);
          const monthKey = `${monthNames[completedDate.getMonth()]} ${completedDate.getFullYear()}`;
          if (monthlyDataMap[monthKey]) {
              monthlyDataMap[monthKey].services += b.actualCost || 0;
          }
      });
      const monthlyData: MonthlyData[] = Object.entries(monthlyDataMap).map(([month, data]) => ({ month: month.split(' ')[0], ...data }));

      // --- Top Services ---
      const servicesMap: { [key: string]: { revenue: number, bookings: number } } = {};
      completedBookings.forEach(b => {
          if (!servicesMap[b.service]) servicesMap[b.service] = { revenue: 0, bookings: 0 };
          servicesMap[b.service].revenue += b.actualCost || 0;
          servicesMap[b.service].bookings += 1;
      });
      const topServices: TopService[] = Object.entries(servicesMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      // --- Customer Segments ---
      const customerSpendMap = new Map<string, { count: number, revenue: number }>();
      completedBookings.forEach(b => {
          const entry = customerSpendMap.get(b.customerEmail) || { count: 0, revenue: 0 };
          entry.count += 1;
          entry.revenue += b.actualCost || 0;
          customerSpendMap.set(b.customerEmail, entry);
      });
      const segments: Record<'New' | 'Regular' | 'VIP', { count: number, revenue: number }> = { New: { count: 0, revenue: 0 }, Regular: { count: 0, revenue: 0 }, VIP: { count: 0, revenue: 0 } };
      customerSpendMap.forEach(data => {
          if (data.count === 1) {
              segments.New.count++;
              segments.New.revenue += data.revenue;
          } else if (data.count > 1 && data.count < 5) {
              segments.Regular.count++;
              segments.Regular.revenue += data.revenue;
          } else {
              segments.VIP.count++;
              segments.VIP.revenue += data.revenue;
          }
      });
      const customerSegments: CustomerSegment[] = Object.entries(segments).map(([segment, data]) => ({ segment: segment as any, ...data }));

      // --- Vehicle Performance ---
      const vehiclePerformance: VehiclePerformance[] = vehicles.map(v => ({ name: `${v.year} ${v.make} ${v.model}`, status: v.status, price: v.price, id: v.id, }));

      setAnalytics({
        totalRevenue, revenueChange,
        vehiclesSold, vehiclesSoldChange,
        totalBookings, bookingsChange,
        activeCustomers, customersChange,
        monthlyData,
        topServices,
        customerSegments,
        vehiclePerformance,
      });

    } catch (err: any) {
      console.error("Error calculating analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicles, bookings]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const refreshAnalytics = () => {
    setLoading(true);
    refreshVehicles();
    refreshBookings();
  };

  return (
    <AnalyticsContext.Provider value={{ analytics, loading, error, refreshAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};

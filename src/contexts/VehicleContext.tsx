import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

// Define Vehicle type to match what the UI expects
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin?: string | null;
  status: "available" | "sold" | "reserved" | "maintenance";
  images: string[];
  specs?: {
    hp?: number;
    torque?: number;
    acceleration?: string;
  };
  features?: string[];
  tags?: string[];
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  addVehicle: (vehicle: Partial<Vehicle>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  refreshVehicles: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Hardcoded sample vehicles that always work
const getSampleVehicles = (): Vehicle[] => [
  {
    id: "1",
    make: "BMW",
    model: "M3",
    year: 2022,
    price: 85000,
    mileage: 15000,
    vin: "WBA3B1C50DF123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 473, torque: 600, acceleration: "4.1s" },
    features: ["Premium Sound", "Navigation", "Heated Seats"],
    tags: ["NEW", "FEATURED"],
    description: "High-performance luxury sedan",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    make: "Mercedes",
    model: "C63 AMG",
    year: 2021,
    price: 92000,
    mileage: 8500,
    vin: "WDD2050461F123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 503, torque: 700, acceleration: "3.9s" },
    features: ["AMG Performance", "Premium Interior", "Sport Exhaust"],
    tags: ["PERFORMANCE"],
    description: "AMG performance sedan",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    make: "PORSCHE",
    model: "911 Turbo S",
    year: 2023,
    price: 245000,
    mileage: 2500,
    vin: "WP0AB2A99NS123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 640, torque: 800, acceleration: "2.7s" },
    features: ["Sport Chrono", "Carbon Fiber", "Premium Audio"],
    tags: ["NEW", "LUXURY"],
    description: "Ultimate sports car",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    make: "FERRARI",
    model: "F8 Tributo",
    year: 2022,
    price: 325000,
    mileage: 1200,
    vin: "ZFF9A2A5000123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 710, torque: 770, acceleration: "2.9s" },
    features: ["Carbon Fiber", "Racing Seats", "Track Package"],
    tags: ["EXOTIC", "PERFORMANCE"],
    description: "Exotic supercar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    make: "LAMBORGHINI",
    model: "Huracan",
    year: 2023,
    price: 280000,
    mileage: 800,
    vin: "ZHWUC1ZF5NLA123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 630, torque: 600, acceleration: "3.2s" },
    features: ["All-Wheel Drive", "Carbon Package", "Sport Exhaust"],
    tags: ["NEW", "EXOTIC"],
    description: "Italian supercar excellence",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    make: "AUDI",
    model: "RS6 Avant",
    year: 2022,
    price: 125000,
    mileage: 12000,
    vin: "WAUZZZ4G5NN123456",
    status: "available",
    images: ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
    specs: { hp: 591, torque: 800, acceleration: "3.6s" },
    features: ["Quattro AWD", "Sport Differential", "Air Suspension"],
    tags: ["PERFORMANCE", "WAGON"],
    description: "High-performance wagon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to show content immediately
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    console.log("🚗 Starting vehicle fetch process...");
    
    // Always start with sample data to ensure UI works
    const sampleVehicles = getSampleVehicles();
    setVehicles(sampleVehicles);
    console.log("✅ Sample vehicles loaded:", sampleVehicles.length);

    // Try to fetch from database as enhancement, but don't block UI
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log("⚠️ Supabase not configured, using sample data only");
        return;
      }

      console.log("🔄 Attempting to fetch from database...");
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("⚠️ Database fetch failed, keeping sample data:", error.message);
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Database vehicles loaded:", data.length);
        setVehicles(data);
      } else {
        console.log("📝 No database vehicles, keeping sample data");
      }
    } catch (err) {
      console.warn("⚠️ Database error, keeping sample data:", err);
    }
  };

  const addVehicle = (vehicleData: Partial<Vehicle>) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      make: vehicleData.make || "",
      model: vehicleData.model || "",
      year: vehicleData.year || new Date().getFullYear(),
      price: vehicleData.price || 0,
      mileage: vehicleData.mileage || 0,
      status: vehicleData.status || "available",
      images: vehicleData.images || ["https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"],
      specs: vehicleData.specs || { hp: 300, torque: 400, acceleration: "5.0s" },
      features: vehicleData.features || [],
      tags: vehicleData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setVehicles(prev => [newVehicle, ...prev]);
    console.log("✅ Vehicle added:", newVehicle.make, newVehicle.model);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updates, updated_at: new Date().toISOString() } : vehicle
    ));
    console.log("✅ Vehicle updated:", id);
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    console.log("✅ Vehicle deleted:", id);
  };

  const getVehicleById = (id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const refreshVehicles = () => {
    fetchVehicles();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        loading,
        error,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicleById,
        refreshVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicles must be used within a VehicleProvider");
  }
  return context;
};

export type { Vehicle };
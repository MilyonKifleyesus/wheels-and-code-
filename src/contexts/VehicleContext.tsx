import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  addVehicle: (vehicle: VehicleInsert) => Promise<void>;
  updateVehicle: (id: string, vehicle: VehicleUpdate) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicleById: (id: string) => Vehicle | undefined;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚗 Fetching vehicles from database...");

      // Check if we have proper Supabase configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn("⚠️ Supabase not configured, using fallback data");
        setVehicles(getFallbackVehicles());
        setLoading(false);
        return;
      }

      // Fetch vehicles data
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error:", error);
        console.log("🔄 Using fallback data due to database error");
        setVehicles(getFallbackVehicles());
        setLoading(false);
        return;
      }

      // If no data, add sample vehicles
      if (!data || data.length === 0) {
        console.log("📝 No vehicles found, creating sample data...");
        const sampleVehicles = [
          {
            make: 'BMW',
            model: 'M3',
            year: 2022,
            price: 85000,
            mileage: 15000,
            status: 'available',
            images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
            specs: { hp: 473, torque: 600, acceleration: '4.1s' },
            features: ['Premium Sound', 'Navigation', 'Heated Seats'],
            tags: ['NEW', 'FEATURED'],
            vin: 'WBA3B1C50DF123456'
          },
          {
            make: 'Mercedes',
            model: 'C63 AMG',
            year: 2021,
            price: 92000,
            mileage: 8500,
            status: 'available',
            images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
            specs: { hp: 503, torque: 700, acceleration: '3.9s' },
            features: ['AMG Performance', 'Premium Interior', 'Sport Exhaust'],
            tags: ['PERFORMANCE'],
            vin: 'WDD2050461F123456'
          },
          {
            make: 'PORSCHE',
            model: '911 Turbo S',
            year: 2023,
            price: 245000,
            mileage: 2500,
            status: 'available' as const,
            images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
            specs: { hp: 640, torque: 800, acceleration: '2.7s' },
            features: ['Sport Chrono', 'Carbon Fiber', 'Premium Audio'],
            tags: ['NEW', 'LUXURY'],
            vin: 'WP0AB2A99NS123456'
          },
          {
            make: 'FERRARI',
            model: 'F8 Tributo',
            year: 2022,
            price: 325000,
            mileage: 1200,
            status: 'available' as const,
            images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
            specs: { hp: 710, torque: 770, acceleration: '2.9s' },
            features: ['Carbon Fiber', 'Racing Seats', 'Track Package'],
            tags: ['EXOTIC', 'PERFORMANCE'],
            vin: 'ZFF9A2A5000123456'
          }
        ];

        for (const vehicle of sampleVehicles) {
          try {
            await supabase.from("vehicles").insert([vehicle]);
            console.log(`✅ Created sample vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
          } catch (insertError) {
            console.warn("⚠️ Could not insert sample vehicle:", insertError);
          }
        }

        // Fetch again after inserting samples
        const { data: newData } = await supabase
          .from("vehicles")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (newData && newData.length > 0) {
          console.log(`✅ Successfully loaded ${newData.length} vehicles`);
          setVehicles(newData);
        } else {
          console.log("🔄 Database insert failed, using fallback data");
          setVehicles(getFallbackVehicles());
        }
        return;
      }

      console.log(`✅ Successfully loaded ${data.length} vehicles from database`);
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);

      console.log("🔄 Database error occurred, using fallback data");
      setVehicles(getFallbackVehicles());
      setError(null); // Don't show error to user, just use fallback
    } finally {
      setLoading(false);
    }
  };

  // Fallback vehicles data when database is not available
  const getFallbackVehicles = (): Vehicle[] => {
    return [
      {
        id: 'fallback-1',
        make: 'BMW',
        model: 'M3',
        year: 2022,
        price: 85000,
        mileage: 15000,
        vin: 'WBA3B1C50DF123456',
        status: 'available',
        images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
        specs: { hp: 473, torque: 600, acceleration: '4.1s' },
        features: ['Premium Sound', 'Navigation', 'Heated Seats'],
        tags: ['NEW', 'FEATURED'],
        description: 'High-performance luxury sedan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        make: 'Mercedes',
        model: 'C63 AMG',
        year: 2021,
        price: 92000,
        mileage: 8500,
        vin: 'WDD2050461F123456',
        status: 'available',
        images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
        specs: { hp: 503, torque: 700, acceleration: '3.9s' },
        features: ['AMG Performance', 'Premium Interior', 'Sport Exhaust'],
        tags: ['PERFORMANCE'],
        description: 'AMG performance sedan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        make: 'PORSCHE',
        model: '911 Turbo S',
        year: 2023,
        price: 245000,
        mileage: 2500,
        vin: 'WP0AB2A99NS123456',
        status: 'available',
        images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
        specs: { hp: 640, torque: 800, acceleration: '2.7s' },
        features: ['Sport Chrono', 'Carbon Fiber', 'Premium Audio'],
        tags: ['NEW', 'LUXURY'],
        description: 'Ultimate sports car',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-4',
        make: 'FERRARI',
        model: 'F8 Tributo',
        year: 2022,
        price: 325000,
        mileage: 1200,
        vin: 'ZFF9A2A5000123456',
        status: 'available',
        images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'],
        specs: { hp: 710, torque: 770, acceleration: '2.9s' },
        features: ['Carbon Fiber', 'Racing Seats', 'Track Package'],
        tags: ['EXOTIC', 'PERFORMANCE'],
        description: 'Exotic supercar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };
  const addVehicle = async (vehicleData: VehicleInsert) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("vehicles")
        .insert([vehicleData])
        .select()
        .single();

      if (error) throw error;

      setVehicles((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setError(err instanceof Error ? err.message : "Failed to add vehicle");
      throw err;
    }
  };

  const updateVehicle = async (id: string, updates: VehicleUpdate) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("vehicles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle.id === id ? data : vehicle))
      );
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError(err instanceof Error ? err.message : "Failed to update vehicle");
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setError(err instanceof Error ? err.message : "Failed to delete vehicle");
      throw err;
    }
  };

  const getVehicleById = (id: string) => {
    return vehicles.find((vehicle) => vehicle.id === id);
  };

  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  useEffect(() => {
    fetchVehicles();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("vehicles_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        (payload) => {
          console.log("Vehicle change received:", payload);
          fetchVehicles(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

export type { Vehicle, VehicleInsert, VehicleUpdate };
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

      // Check if Supabase is properly configured
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Add some sample data if no vehicles exist
      const { count } = await supabase
        .from("vehicles")
        .select("*", { count: 'exact', head: true });

      if (count === 0) {

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

        // If no data, add sample vehicles
        if (!data || data.length === 0) {
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
              features: ['Premium Sound', 'Navigation', 'Heated Seats']
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
              features: ['AMG Performance', 'Premium Interior', 'Sport Exhaust']
            }
          ];

          for (const vehicle of sampleVehicles) {
            try {
              await supabase.from("vehicles").insert([vehicle]);
            } catch (insertError) {
              console.warn("Could not insert sample vehicle:", insertError);
            }
          }

          // Fetch again after inserting samples
          const { data: newData } = await supabase
            .from("vehicles")
            .select("*")
            .order("created_at", { ascending: false });
          
          setVehicles(newData || []);
          return;
        }
      }

      setVehicles(data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to fetch vehicles";
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
      setVehicles([]);
    } finally {
      setLoading(false);
    }
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

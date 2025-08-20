import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

export interface Settings {
  businessName: string;
  phone: string;
  address: string;
  currency: 'CAD' | 'USD' | 'EUR';
  distanceUnit: 'km' | 'miles';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  notifications: {
    newBookings: boolean;
    payments: boolean;
    serviceReminders: boolean;
    inventory: boolean;
    customerMessages: boolean;
  };
  twoFactorAuth: boolean;
  autoBackup: boolean;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<{ success: boolean; error?: string }>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULTS: Settings = {
    businessName: 'Apex Auto Sales & Repair',
    phone: '(416) 916-6475',
    address: '179 Weston Rd, Toronto, ON M6N 3A5, Canada',
    currency: 'CAD',
    distanceUnit: 'km',
    primaryColor: '#D7FF00',
    secondaryColor: '#C8FF1A',
    backgroundColor: '#0B0B0C',
    notifications: {
      newBookings: true,
      payments: true,
      serviceReminders: true,
      inventory: true,
      customerMessages: true
    },
    twoFactorAuth: false,
    autoBackup: true
};

// Helper to transform flat DB rows into a nested Settings object
const transformRowsToSettings = (rows: any[]): Settings => {
  const settingsObject: any = {};
  rows.forEach(row => {
      // The value from the DB is a JSON string, so we need to parse it.
      // For simple strings from the DB like "Apex Name", the value is `'"Apex Name"'`. JSON.parse handles this.
      // For JSON objects like '{"newBookings": true}', it also works.
      try {
        settingsObject[row.key] = row.value;
      } catch (e) {
        console.error(`Failed to parse setting key "${row.key}" with value:`, row.value);
        settingsObject[row.key] = DEFAULTS[row.key as keyof Settings];
      }
  });
  return { ...DEFAULTS, ...settingsObject };
};


export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase client not available.");

      const { data, error } = await supabase.from("business_settings").select("key, value");

      if (error) throw error;

      const transformedSettings = transformRowsToSettings(data || []);
      setSettings(transformedSettings);

    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message);
      setSettings(DEFAULTS); // Fallback to defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) {
        const err = "Settings not loaded yet.";
        setError(err);
        return { success: false, error: err };
    }

    setLoading(true);
    try {
        if (!supabase) throw new Error("Supabase not available.");

        const updates = Object.entries(newSettings).map(([key, value]) => ({
            key,
            value
        }));

        const { error } = await supabase.from('business_settings').upsert(updates, { onConflict: 'key' });

        if (error) throw error;

        await fetchSettings(); // Refresh data after update
        return { success: true };
    } catch (err: any) {
        console.error("Error updating settings:", err);
        setError(err.message);
        return { success: false, error: err.message };
    } finally {
        setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

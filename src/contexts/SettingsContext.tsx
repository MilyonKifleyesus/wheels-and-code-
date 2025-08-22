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
const transformRowsToSettings = (rows: {key: string, value: any}[] | null): Settings => {
  const settingsObject: any = {};
  if (rows) {
    rows.forEach(row => {
        // The `value` column is of type jsonb, so supabase-js automatically parses it.
        // No need for JSON.parse here.
        settingsObject[row.key] = row.value;
    });
  }
  // Merge fetched settings over defaults to ensure all keys are present
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

      const transformedSettings = transformRowsToSettings(data);
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

        // We need to handle nested objects like 'notifications' correctly.
        // The DB expects a key and a value. If we update a nested property,
        // we must update the top-level key.
        const currentSettings = { ...settings, ...newSettings };

        const updates = Object.entries(currentSettings).map(([key, value]) => ({
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

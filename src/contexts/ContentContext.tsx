import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

export interface ContentSection {
  id: string;
  type:
    | "hero"
    | "services"
    | "inventory"
    | "testimonials"
    | "contact"
    | "about"
    | "finance"
    | "trust"
    | "promo"
    | "map";
  title: string;
  visible: boolean;
  sort_order: number;
  content: {
    heading?: string;
    subheading?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

interface ContentContextType {
  sections: ContentSection[];
  loading: boolean;
  error: string | null;
  updateSection: (id: string, updates: Partial<Omit<ContentSection, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ success: boolean; error?: string }>;
  updateSectionContent: (id: string, content: Partial<ContentSection["content"]>) => Promise<{ success: boolean; error?: string }>;
  toggleSectionVisibility: (id: string, visible: boolean) => Promise<{ success: boolean; error?: string }>;
  reorderSections: (sections: ContentSection[]) => Promise<{ success: boolean; error?: string }>;
  addSection: (section: Omit<ContentSection, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
  deleteSection: (id: string) => Promise<{ success: boolean; error?: string }>;
  getSectionById: (id: string) => ContentSection | undefined;
  getSectionByType: (type: string) => ContentSection | undefined;
  getVisibleSections: () => ContentSection[];
  refreshSections: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Supabase client is not available.");
      }
      console.log("📄 Fetching content sections from database...");
      const { data, error } = await supabase
        .from("content_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      setSections(data || []);
      console.log("✅ Content sections loaded:", data?.length || 0);
    } catch (err: any) {
      console.error("❌ Error fetching content sections:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const addSection = async (sectionData: Omit<ContentSection, "id" | "created_at" | "updated_at">) => {
    try {
      if (!supabase) throw new Error("Supabase not available");
      setLoading(true);
      const { data, error } = await supabase
        .from("content_sections")
        .insert([sectionData])
        .select();

      if (error) throw error;
      if (!data) throw new Error("No data returned after insert.");

      console.log("✅ Section added successfully:", data[0]);
      await fetchSections(); // Refresh data
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error adding section:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, updates: Partial<Omit<ContentSection, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      if (!supabase) throw new Error("Supabase not available");
      setLoading(true);
      const { data, error } = await supabase
        .from("content_sections")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data) throw new Error("No data returned after update.");

      console.log("✅ Section updated successfully:", data[0]);
      await fetchSections(); // Refresh data
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error updating section:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    try {
      if (!supabase) throw new Error("Supabase not available");
      setLoading(true);
      const { error } = await supabase
        .from("content_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log("✅ Section deleted successfully:", id);
      await fetchSections(); // Refresh data
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error deleting section:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateSectionContent = async (id: string, contentUpdates: Partial<ContentSection["content"]>) => {
    const section = sections.find(s => s.id === id);
    if (!section) {
      const errorMsg = "Section not found for content update.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    const newContent = { ...section.content, ...contentUpdates };
    return updateSection(id, { content: newContent });
  };

  const toggleSectionVisibility = async (id: string, visible: boolean) => {
    return updateSection(id, { visible });
  };

  const reorderSections = async (newSections: ContentSection[]) => {
    try {
        if (!supabase) throw new Error("Supabase not available");
        setLoading(true);

        const updates = newSections.map((section, index) => ({
            id: section.id,
            sort_order: index + 1,
        }));

        const { error } = await supabase.from('content_sections').upsert(updates);

        if (error) throw error;

        console.log("✅ Sections reordered successfully");
        await fetchSections(); // Refresh data
        return { success: true };
    } catch (err: any) {
        console.error("❌ Error reordering sections:", err);
        setError(err.message);
        return { success: false, error: err.message };
    } finally {
        setLoading(false);
    }
  };

  const getSectionById = (id: string) => {
    return sections.find((section) => section.id === id);
  };

  const getSectionByType = (type: string) => {
    return sections.find((section) => section.type === type);
  };

  const getVisibleSections = () => {
    return sections
      .filter((section) => section.visible)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const refreshSections = () => {
    fetchSections();
  };

  return (
    <ContentContext.Provider
      value={{
        sections,
        loading,
        error,
        updateSection,
        updateSectionContent,
        toggleSectionVisibility,
        reorderSections,
        addSection,
        deleteSection,
        getSectionById,
        getSectionByType,
        getVisibleSections,
        refreshSections,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};

export type { ContentSection };

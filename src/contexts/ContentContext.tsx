import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface ContentSection {
  id: string;
  type: 'hero' | 'services' | 'inventory' | 'testimonials' | 'contact' | 'about' | 'finance' | 'trust' | 'promo' | 'map';
  title: string;
  visible: boolean;
  order: number;
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
}

interface ContentContextType {
  sections: ContentSection[];
  loading: boolean;
  error: string | null;
  updateSection: (id: string, updates: Partial<ContentSection>) => void;
  updateSectionContent: (id: string, content: Partial<ContentSection['content']>) => void;
  toggleSectionVisibility: (id: string) => void;
  reorderSections: (sections: ContentSection[]) => void;
  addSection: (section: Omit<ContentSection, 'id'>) => void;
  deleteSection: (id: string) => void;
  getSectionById: (id: string) => ContentSection | undefined;
  getSectionByType: (type: string) => ContentSection | undefined;
  getVisibleSections: () => ContentSection[];
  refreshSections: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Default content sections that always work
const getDefaultSections = (): ContentSection[] => [
  {
    id: 'hero',
    type: 'hero',
    title: 'Hero Section',
    visible: true,
    order: 1,
    content: {
      heading: 'PRECISION PERFORMANCE PERFECTION',
      subheading: 'Where automotive excellence meets cutting-edge service',
      description: 'Experience the pinnacle of automotive luxury and performance',
      buttonText: 'BROWSE CARS',
      buttonLink: '/inventory',
      backgroundColor: '#0B0B0C',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'services',
    type: 'services',
    title: 'Services Section',
    visible: true,
    order: 2,
    content: {
      heading: 'PRECISION SERVICE',
      description: 'Expert automotive service with state-of-the-art equipment and certified technicians',
      backgroundColor: '#0B0B0C',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'inventory',
    type: 'inventory',
    title: 'Inventory Section',
    visible: true,
    order: 3,
    content: {
      heading: 'NEW ARRIVALS',
      description: 'Latest additions to our premium collection',
      backgroundColor: '#141518',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'trust',
    type: 'trust',
    title: 'Trust Section',
    visible: true,
    order: 4,
    content: {
      heading: 'TRUSTED BY THOUSANDS',
      description: 'Join thousands of satisfied customers who trust us with their automotive needs',
      backgroundColor: '#0B0B0C',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'finance',
    type: 'finance',
    title: 'Finance Section',
    visible: true,
    order: 5,
    content: {
      heading: 'FINANCE OPTIONS',
      description: 'Get pre-qualified in minutes with competitive CAD rates and flexible terms',
      backgroundColor: '#1A1B1E',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'promo',
    type: 'promo',
    title: 'Promo Section',
    visible: true,
    order: 6,
    content: {
      heading: 'PERFORMANCE SERVICE SPECIAL',
      description: 'Complete performance package including diagnostics, tune-up, and optimization',
      backgroundColor: '#0B0B0C',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  },
  {
    id: 'map',
    type: 'map',
    title: 'Map Section',
    visible: true,
    order: 7,
    content: {
      heading: 'VISIT US',
      description: 'Experience our state-of-the-art facility and meet our expert team',
      backgroundColor: '#1A1B1E',
      textColor: '#FFFFFF',
      accentColor: '#D7FF00'
    }
  }
];

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    console.log("📄 Starting content fetch process...");
    
    // Always start with default sections
    const defaultSections = getDefaultSections();
    setSections(defaultSections);
    console.log("✅ Default content sections loaded:", defaultSections.length);

    // Try to enhance with database data if available
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log("⚠️ Supabase not configured, using default content only");
        return;
      }

      console.log("🔄 Attempting to fetch content from database...");
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn("⚠️ Database content fetch failed, keeping defaults:", error.message);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("✅ Database content loaded:", data.length);
        // Convert database format to UI format
        const convertedSections: ContentSection[] = data.map(dbSection => ({
          id: dbSection.id,
          type: dbSection.section_type as ContentSection['type'],
          title: dbSection.title,
          visible: dbSection.visible,
          order: dbSection.sort_order,
          content: dbSection.content as ContentSection['content']
        }));
        
        setSections(convertedSections);
      }
    } catch (err) {
      console.warn("⚠️ Database error, keeping default content:", err);
    }
  };

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
    console.log("✅ Section updated:", id);
  };

  const updateSectionContent = (id: string, content: Partial<ContentSection['content']>) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, content: { ...section.content, ...content } } : section
    ));
    console.log("✅ Section content updated:", id);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, visible: !section.visible } : section
    ));
    console.log("✅ Section visibility toggled:", id);
  };

  const reorderSections = (newSections: ContentSection[]) => {
    setSections(newSections);
    console.log("✅ Sections reordered");
  };

  const addSection = (sectionData: Omit<ContentSection, 'id'>) => {
    const newSection: ContentSection = {
      ...sectionData,
      id: Date.now().toString(),
    };
    setSections(prev => [...prev, newSection].sort((a, b) => a.order - b.order));
    console.log("✅ Section added:", newSection.title);
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
    console.log("✅ Section deleted:", id);
  };

  const getSectionById = (id: string) => {
    return sections.find(section => section.id === id);
  };

  const getSectionByType = (type: string) => {
    return sections.find(section => section.type === type);
  };

  const getVisibleSections = () => {
    return sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
  };

  const refreshSections = () => {
    fetchSections();
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <ContentContext.Provider value={{
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
      refreshSections
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export type { ContentSection };
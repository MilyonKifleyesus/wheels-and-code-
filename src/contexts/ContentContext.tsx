import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ContentSection = Database['public']['Tables']['content_sections']['Row'];
type ContentSectionInsert = Database['public']['Tables']['content_sections']['Insert'];
type ContentSectionUpdate = Database['public']['Tables']['content_sections']['Update'];

interface ContentContextType {
  sections: ContentSection[];
  loading: boolean;
  error: string | null;
  updateSection: (id: string, updates: ContentSectionUpdate) => Promise<void>;
  updateSectionContent: (id: string, content: any) => Promise<void>;
  toggleSectionVisibility: (id: string) => Promise<void>;
  reorderSections: (sections: ContentSection[]) => Promise<void>;
  addSection: (section: ContentSectionInsert) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  getSectionById: (id: string) => ContentSection | undefined;
  getSectionByType: (type: string) => ContentSection | undefined;
  getVisibleSections: () => ContentSection[];
  refreshSections: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // If no data, create default sections
      if (!data || data.length === 0) {
        const defaultSections = [
          {
            section_type: 'hero',
            title: 'Hero Section',
            visible: true,
            sort_order: 1,
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
            section_type: 'services',
            title: 'Services Section',
            visible: true,
            sort_order: 2,
            content: {
              heading: 'PRECISION SERVICE',
              description: 'Expert automotive service with state-of-the-art equipment and certified technicians',
              backgroundColor: '#0B0B0C',
              textColor: '#FFFFFF',
              accentColor: '#D7FF00'
            }
          },
          {
            section_type: 'inventory',
            title: 'Inventory Section',
            visible: true,
            sort_order: 3,
            content: {
              heading: 'NEW ARRIVALS',
              description: 'Latest additions to our premium collection',
              backgroundColor: '#141518',
              textColor: '#FFFFFF',
              accentColor: '#D7FF00'
            }
          },
          {
            section_type: 'trust',
            title: 'Trust Section',
            visible: true,
            sort_order: 4,
            content: {
              heading: 'TRUSTED BY THOUSANDS',
              description: 'Join thousands of satisfied customers who trust us with their automotive needs',
              backgroundColor: '#0B0B0C',
              textColor: '#FFFFFF',
              accentColor: '#D7FF00'
            }
          }
        ];

        // Insert default sections
        for (const section of defaultSections) {
          try {
            await supabase.from('content_sections').insert([section]);
          } catch (insertError) {
            console.warn('Could not insert default section:', insertError);
          }
        }

        // Fetch again after inserting defaults
        const { data: newData } = await supabase
          .from('content_sections')
          .select('*')
          .order('sort_order', { ascending: true });
        
        setSections(newData || []);
        return;
      }
      
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching content sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content sections');
      
      // Set fallback sections if database fails
      setSections([
        {
          id: 'hero-fallback',
          section_type: 'hero',
          title: 'Hero Section',
          visible: true,
          sort_order: 1,
          content: {
            heading: 'PRECISION PERFORMANCE PERFECTION',
            subheading: 'Where automotive excellence meets cutting-edge service',
            buttonText: 'BROWSE CARS',
            buttonLink: '/inventory',
            accentColor: '#D7FF00'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, updates: ContentSectionUpdate) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('content_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSections(prev => prev.map(section => 
        section.id === id ? data : section
      ));
    } catch (err) {
      console.error('Error updating section:', err);
      setError(err instanceof Error ? err.message : 'Failed to update section');
      throw err;
    }
  };

  const updateSectionContent = async (id: string, content: any) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const updatedContent = { ...section.content, ...content };
    await updateSection(id, { content: updatedContent });
  };

  const toggleSectionVisibility = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    await updateSection(id, { visible: !section.visible });
  };

  const reorderSections = async (newSections: ContentSection[]) => {
    try {
      setError(null);
      
      // Update sort_order for each section
      const updates = newSections.map((section, index) => ({
        id: section.id,
        sort_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('content_sections')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      // Refresh sections to get updated order
      await fetchSections();
    } catch (err) {
      console.error('Error reordering sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder sections');
      throw err;
    }
  };

  const addSection = async (sectionData: ContentSectionInsert) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('content_sections')
        .insert([sectionData])
        .select()
        .single();

      if (error) throw error;
      
      setSections(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      console.error('Error adding section:', err);
      setError(err instanceof Error ? err.message : 'Failed to add section');
      throw err;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSections(prev => prev.filter(section => section.id !== id));
    } catch (err) {
      console.error('Error deleting section:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete section');
      throw err;
    }
  };

  const getSectionById = (id: string) => {
    return sections.find(section => section.id === id);
  };

  const getSectionByType = (type: string) => {
    return sections.find(section => section.section_type === type);
  };

  const getVisibleSections = () => {
    return sections.filter(section => section.visible).sort((a, b) => a.sort_order - b.sort_order);
  };

  const refreshSections = async () => {
    await fetchSections();
  };

  useEffect(() => {
    fetchSections();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('content_sections_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content_sections' },
        (payload) => {
          console.log('Content section change received:', payload);
          fetchSections(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

export type { ContentSection, ContentSectionInsert, ContentSectionUpdate };
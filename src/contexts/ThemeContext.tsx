import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeContextType {
  applyTokens: (tokens: any) => void;
  loadAndApplyActiveTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const applyTokens = (tokens: any) => {
    const root = document.documentElement;

    if (tokens.colors) {
        Object.entries(tokens.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value as string);
        });
    }
    if (tokens.typography) {
        root.style.setProperty('--font-family', tokens.typography.fontFamily);
        root.style.setProperty('--heading-font', tokens.typography.headingFont);
        if (tokens.typography.fontSize) {
            Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
                root.style.setProperty(`--font-size-${key}`, value as string);
            });
        }
        if (tokens.typography.fontWeight) {
            Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
                root.style.setProperty(`--font-weight-${key}`, value as string);
            });
        }
    }
    if (tokens.spacing) {
        Object.entries(tokens.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, value as string);
        });
    }
    if (tokens.borderRadius) {
        Object.entries(tokens.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--border-radius-${key}`, value as string);
        });
    }
  };

  const loadAndApplyActiveTheme = async () => {
    const { data: themeData, error: themeError } = await supabase
      .from('themes')
      .select('*, design_tokens(tokens)')
      .eq('is_active', true)
      .single();

    if (themeError || !themeData) {
      console.error('Error fetching active theme:', themeError?.message);
      return;
    }

    const tokens = Array.isArray(themeData.design_tokens) && themeData.design_tokens.length > 0
      ? themeData.design_tokens[0].tokens
      : null;

    if (tokens) {
      applyTokens(tokens);
    } else {
        console.warn("No design tokens found for the active theme.");
    }
  };

  useEffect(() => {
    loadAndApplyActiveTheme();
  }, []);

  const value = { applyTokens, loadAndApplyActiveTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

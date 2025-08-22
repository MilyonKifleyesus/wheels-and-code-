import React, { useState, useEffect } from 'react';
import { Palette, Type, Ruler, Save, RefreshCw, Eye, Download, Upload, Loader2, Plus, CheckCircle } from 'lucide-react';
import Toast from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

interface DesignTokens {
  colors: { [key: string]: string };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: { [key: string]: string };
    fontWeight: { [key: string]: string };
  };
  spacing: { [key: string]: string };
  borderRadius: { [key: string]: string };
}

interface Theme {
  id: string;
  name: string;
  is_active: boolean;
  is_staging: boolean;
  design_tokens: { id: string, tokens: DesignTokens }[];
}

const DesignTokenManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const { applyTokens: applyTokensGlobally, loadAndApplyActiveTheme } = useTheme();

  const fetchThemes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('themes')
      .select('*, design_tokens(id, tokens)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching themes:', error);
      setToastMessage('Failed to fetch themes.');
      setToastType('error');
      setShowToast(true);
    } else {
      setThemes(data as Theme[]);
      const activeTheme = data.find(t => t.is_active);
      if (activeTheme) {
        setSelectedThemeId(activeTheme.id);
        const activeTokens = activeTheme.design_tokens[0]?.tokens;
        if (activeTokens) {
          setTokens(activeTokens);
        }
      } else if (data.length > 0) {
        setSelectedThemeId(data[0].id);
        const firstTokens = data[0].design_tokens[0]?.tokens;
        if (firstTokens) {
          setTokens(firstTokens);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleTokenChange = (category: keyof DesignTokens, key: string, value: string) => {
    if (!tokens) return;
    setTokens(prev => {
        if (!prev) return null;
        const newTokens = { ...prev };
        (newTokens[category] as any)[key] = value;
        return newTokens;
    });
  };

  const handleNestedTokenChange = (category: keyof DesignTokens, subCategory: string, key: string, value: string) => {
    if (!tokens) return;
    setTokens(prev => {
        if (!prev) return null;
        const newTokens = { ...prev };
        ((newTokens[category] as any)[subCategory] as any)[key] = value;
        return newTokens;
    });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value;
    setSelectedThemeId(themeId);
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      const selectedTokens = selectedTheme.design_tokens[0]?.tokens;
      if (selectedTokens) {
        setTokens(selectedTokens);
      } else {
        setTokens(null);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedThemeId || !tokens) {
      setToastMessage('No theme selected or no tokens to save.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const theme = themes.find(t => t.id === selectedThemeId);
    const designTokenId = theme?.design_tokens[0]?.id;

    if (!designTokenId) {
        setToastMessage('Could not find the design token record to update.');
        setToastType('error');
        setShowToast(true);
        return;
    }

    const { error } = await supabase
      .from('design_tokens')
      .update({ tokens: tokens })
      .match({ id: designTokenId });

    if (error) {
        console.error('Error saving design tokens:', error);
        setToastMessage('Failed to save changes.');
        setToastType('error');
    } else {
        setToastMessage('Changes saved successfully!');
        setToastType('success');
        if (theme?.is_active) {
            loadAndApplyActiveTheme();
        }
    }
    setShowToast(true);
  };

  const handleSetActive = async () => {
    if (!selectedThemeId) return;

    const { error } = await supabase.rpc('set_active_theme', { theme_id_to_set: selectedThemeId });

    if (error) {
        console.error('Error setting active theme:', error);
        setToastMessage(`Failed to activate theme: ${error.message}`);
        setToastType('error');
    } else {
        setToastMessage('Theme activated successfully!');
        setToastType('success');
        await loadAndApplyActiveTheme();
        await fetchThemes();
    }
    setShowToast(true);
  };


  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Ruler },
  ];

  return (
    <div className="space-y-6">
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Design Token Manager</h2>
          <p className="text-gray-400 mt-1">Select a theme to edit, or create a new one.</p>
        </div>
        <div className="flex items-center space-x-3">
            <select
                value={selectedThemeId || ''}
                onChange={handleThemeChange}
                className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                disabled={loading}
            >
                {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                        {theme.name} {theme.is_active && '(Active)'}
                    </option>
                ))}
            </select>
            <button
                onClick={() => { /* TODO */ }}
                className="bg-white/10 text-white px-4 py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
            >
                <Plus className="w-4 h-4" />
                <span>New Theme</span>
            </button>
            <button
                onClick={handleSetActive}
                disabled={loading || themes.find(t => t.id === selectedThemeId)?.is_active}
                className="bg-blue-600 text-white px-4 py-3 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <CheckCircle className="w-4 h-4" />
                <span>Set Active</span>
            </button>
            <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
            >
                <Save className="w-5 h-5" />
                <span>SAVE CHANGES</span>
            </button>
        </div>
      </div>

      {loading && (
        <div className="text-center p-12">
            <Loader2 className="w-10 h-10 animate-spin text-acid-yellow inline-block" />
            <p className="text-gray-400 mt-2">Loading Themes...</p>
        </div>
      )}

      {!loading && !tokens && (
        <div className="text-center p-12 bg-dark-graphite rounded-lg border border-gray-800">
            <p className="text-white font-bold">No Theme Selected or No Tokens Found</p>
            <p className="text-gray-400 mt-2">Please select a theme from the dropdown or create a new one.</p>
        </div>
      )}

      {!loading && tokens && (
        <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-800">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-6 py-4 font-medium tracking-wider transition-colors duration-300 ${activeTab === tab.id ? 'text-acid-yellow border-b-2 border-acid-yellow bg-acid-yellow/5' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="p-8">
            {activeTab === 'colors' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(tokens.colors).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <label className="block text-gray-400 text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex items-center space-x-3">
                      <input type="color" value={value} onChange={(e) => handleTokenChange('colors', key, e.target.value)} className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"/>
                      <input type="text" value={value} onChange={(e) => handleTokenChange('colors', key, e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"/>
                    </div>
                    <div className="w-full h-8 rounded-sm border border-gray-700" style={{ backgroundColor: value }}></div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'typography' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-bold mb-4">Font Sizes</h4>
                    <div className="space-y-4">
                      {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-4">
                          <label className="w-16 text-gray-400 text-sm">{key}</label>
                          <input type="text" value={value} onChange={(e) => handleNestedTokenChange('typography', 'fontSize', key, e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"/>
                          <div className="w-24 text-white" style={{ fontSize: value }}>Sample</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Font Weights</h4>
                    <div className="space-y-4">
                      {Object.entries(tokens.typography.fontWeight).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-4">
                          <label className="w-16 text-gray-400 text-sm">{key}</label>
                          <input type="text" value={value} onChange={(e) => handleNestedTokenChange('typography', 'fontWeight', key, e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"/>
                          <div className="w-24 text-white" style={{ fontWeight: value }}>Sample</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'spacing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-bold mb-4">Spacing Values</h4>
                  <div className="space-y-4">
                    {Object.entries(tokens.spacing).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-4">
                        <label className="w-16 text-gray-400 text-sm">{key}</label>
                        <input type="text" value={value} onChange={(e) => handleTokenChange('spacing', key, e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"/>
                        <div className="bg-acid-yellow" style={{ width: value, height: '1rem' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-4">Border Radius</h4>
                  <div className="space-y-4">
                    {Object.entries(tokens.borderRadius).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-4">
                        <label className="w-16 text-gray-400 text-sm">{key}</label>
                        <input type="text" value={value} onChange={(e) => handleTokenChange('borderRadius', key, e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"/>
                        <div className="w-8 h-8 bg-acid-yellow" style={{ borderRadius: value }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignTokenManager;
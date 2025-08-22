import React, { useState } from 'react';
import { Palette, Type, Spacing, Save, RefreshCw, Eye, Download, Upload } from 'lucide-react';
import Toast from '../ui/Toast';

interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
      black: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const DesignTokenManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);

  const [tokens, setTokens] = useState<DesignTokens>({
    colors: {
      primary: '#D7FF00',
      secondary: '#C8FF1A',
      accent: '#39FF14',
      background: '#0B0B0C',
      surface: '#1A1B1E',
      text: '#FFFFFF',
      textSecondary: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700',
        black: '900'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    }
  });

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Spacing },
  ];

  const handleTokenChange = (category: keyof DesignTokens, key: string, value: string) => {
    setTokens(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleNestedTokenChange = (category: keyof DesignTokens, subCategory: string, key: string, value: string) => {
    setTokens(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...(prev[category] as any)[subCategory],
          [key]: value
        }
      }
    }));
  };

  const applyTokens = () => {
    // Apply CSS custom properties to the document
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', tokens.typography.fontFamily);
    root.style.setProperty('--heading-font', tokens.typography.headingFont);
    
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });

    // Apply spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    setToastMessage('Design tokens applied successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const exportTokens = () => {
    const data = JSON.stringify(tokens, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToastMessage('Design tokens exported successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all design tokens to defaults?')) {
      // Reset to default tokens
      setTokens({
        colors: {
          primary: '#D7FF00',
          secondary: '#C8FF1A',
          accent: '#39FF14',
          background: '#0B0B0C',
          surface: '#1A1B1E',
          text: '#FFFFFF',
          textSecondary: '#9CA3AF',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          headingFont: 'Inter, system-ui, sans-serif',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          },
          fontWeight: {
            normal: '400',
            medium: '500',
            bold: '700',
            black: '900'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
          '4xl': '6rem'
        },
        borderRadius: {
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem'
        }
      });
      
      setToastMessage('Design tokens reset to defaults!');
      setToastType('success');
      setShowToast(true);
    }
  };

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
          <h2 className="text-2xl font-bold text-white">Design Tokens</h2>
          <p className="text-gray-400 mt-1">Centralize and manage your design system tokens</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'EDIT' : 'PREVIEW'}</span>
          </button>
          <button
            onClick={exportTokens}
            className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-gray-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESET</span>
          </button>
          <button
            onClick={applyTokens}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>APPLY TOKENS</span>
          </button>
        </div>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium tracking-wider transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'text-acid-yellow border-b-2 border-acid-yellow bg-acid-yellow/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Color Palette</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(tokens.colors).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <label className="block text-gray-400 text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleTokenChange('colors', key, e.target.value)}
                        className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleTokenChange('colors', key, e.target.value)}
                        className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      />
                    </div>
                    <div 
                      className="w-full h-8 rounded-sm border border-gray-700"
                      style={{ backgroundColor: value }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Typography Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Body Font Family</label>
                    <input
                      type="text"
                      value={tokens.typography.fontFamily}
                      onChange={(e) => handleTokenChange('typography', 'fontFamily', e.target.value)}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Heading Font Family</label>
                    <input
                      type="text"
                      value={tokens.typography.headingFont}
                      onChange={(e) => handleTokenChange('typography', 'headingFont', e.target.value)}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-bold mb-4">Font Sizes</h4>
                    <div className="space-y-4">
                      {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-4">
                          <label className="w-16 text-gray-400 text-sm">{key}</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleNestedTokenChange('typography', 'fontSize', key, e.target.value)}
                            className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                          />
                          <div className="w-24 text-white" style={{ fontSize: value }}>
                            Sample
                          </div>
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
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleNestedTokenChange('typography', 'fontWeight', key, e.target.value)}
                            className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                          />
                          <div className="w-24 text-white" style={{ fontWeight: value }}>
                            Sample
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spacing' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Spacing Scale</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-bold mb-4">Spacing Values</h4>
                  <div className="space-y-4">
                    {Object.entries(tokens.spacing).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-4">
                        <label className="w-16 text-gray-400 text-sm">{key}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleTokenChange('spacing', key, e.target.value)}
                          className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                        <div 
                          className="bg-acid-yellow"
                          style={{ width: value, height: '1rem' }}
                        ></div>
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
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleTokenChange('borderRadius', key, e.target.value)}
                          className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                        <div 
                          className="w-8 h-8 bg-acid-yellow"
                          style={{ borderRadius: value }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {previewMode && (
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-6">Design Token Preview</h3>
          
          <div className="space-y-6" style={{
            fontFamily: tokens.typography.fontFamily,
            backgroundColor: tokens.colors.background,
            color: tokens.colors.text,
            padding: tokens.spacing.lg,
            borderRadius: tokens.borderRadius.lg
          }}>
            <div>
              <h1 style={{ 
                fontFamily: tokens.typography.headingFont,
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.black,
                color: tokens.colors.primary,
                marginBottom: tokens.spacing.md
              }}>
                Sample Heading
              </h1>
              <p style={{ 
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.textSecondary,
                marginBottom: tokens.spacing.lg
              }}>
                This is how your typography and colors will look with the current design tokens.
              </p>
            </div>

            <div className="flex space-x-4">
              <button style={{
                backgroundColor: tokens.colors.primary,
                color: tokens.colors.background,
                padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
                borderRadius: tokens.borderRadius.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                fontSize: tokens.typography.fontSize.base
              }}>
                Primary Button
              </button>
              <button style={{
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
                borderRadius: tokens.borderRadius.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                fontSize: tokens.typography.fontSize.base,
                border: `1px solid ${tokens.colors.primary}`
              }}>
                Secondary Button
              </button>
            </div>

            <div style={{
              backgroundColor: tokens.colors.surface,
              padding: tokens.spacing.lg,
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.primary}20`
            }}>
              <h3 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                marginBottom: tokens.spacing.sm,
                color: tokens.colors.accent
              }}>
                Card Component
              </h3>
              <p style={{ 
                color: tokens.colors.textSecondary,
                fontSize: tokens.typography.fontSize.sm
              }}>
                This card demonstrates how your design tokens work together to create a cohesive design system.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignTokenManager;
import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Shield, Bell, Globe, Palette, Database, Loader2, CheckCircle } from 'lucide-react';
import Toast from '../ui/Toast';
import { useSettings, Settings } from '../../contexts/SettingsContext';
import { useDebounce } from '../../hooks/useDebounce';

type SavingStatus = 'idle' | 'saving' | 'saved' | 'error';

const SystemSettings: React.FC = () => {
  const { settings: initialSettings, loading, error: contextError, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [localSettings, setLocalSettings] = useState<Settings | null>(initialSettings);
  const [status, setStatus] = useState<SavingStatus>('idle');

  const debouncedSettings = useDebounce(localSettings, 1000);

  useEffect(() => {
    setLocalSettings(initialSettings);
  }, [initialSettings]);

  const triggerUpdate = useCallback(async (settingsToUpdate: Partial<Settings>) => {
      setStatus('saving');
      const { success, error } = await updateSettings(settingsToUpdate);
      if (success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
        setToastMessage(`Error: ${error}`);
        setToastType('error');
        setShowToast(true);
      }
  }, [updateSettings]);

  useEffect(() => {
    if (debouncedSettings && initialSettings && JSON.stringify(debouncedSettings) !== JSON.stringify(initialSettings)) {
      triggerUpdate(debouncedSettings);
    }
  }, [debouncedSettings, initialSettings, triggerUpdate]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setLocalSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleNotificationChange = (key: keyof Settings['notifications'], value: boolean) => {
    setLocalSettings(prev => {
        if (!prev) return null;
        const newNotifications = { ...prev.notifications, [key]: value };
        return { ...prev, notifications: newNotifications };
    });
  };

  const SavingIndicator = () => {
    switch (status) {
        case 'saving':
            return <div className="flex items-center text-yellow-400"><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span>Saving...</span></div>;
        case 'saved':
            return <div className="flex items-center text-green-400"><CheckCircle className="w-4 h-4 mr-2" /><span>Saved</span></div>;
        case 'error':
            return <div className="flex items-center text-red-400"><span>Error</span></div>;
        default:
            return <div className="h-6"></div>; // Placeholder for alignment
    }
  };

  if (loading && !localSettings) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-acid-yellow" /></div>;
  }

  if (contextError) {
    return <div className="text-red-400 p-8">Error loading settings: {contextError}</div>;
  }

  if (!localSettings) {
    return <div className="text-gray-400 p-8">No settings available.</div>;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <Toast type={toastType} message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-gray-400 mt-1">Changes are saved automatically.</p>
        </div>
        <SavingIndicator />
      </div>
      <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-6 py-4 font-medium tracking-wider transition-colors duration-300 whitespace-nowrap ${ activeTab === tab.id ? 'text-acid-yellow border-b-2 border-acid-yellow bg-acid-yellow/5' : 'text-gray-400 hover:text-white hover:bg-gray-800' }`}>
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Business Name</label>
                  <input type="text" value={localSettings.businessName} onChange={(e) => handleSettingChange('businessName', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'appearance' && (
             <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Appearance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input type="color" value={localSettings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm" />
                    <input type="text" value={localSettings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Notification Settings</h3>
              <div className="space-y-4">
                {Object.entries(localSettings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                    <h4 className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => handleNotificationChange(key as keyof Settings['notifications'], e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-acid-yellow"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
           {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                <div className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button onClick={() => handleSettingChange('twoFactorAuth', !localSettings.twoFactorAuth)} className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${ localSettings.twoFactorAuth ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-acid-yellow text-black hover:bg-neon-lime' }`}>
                    {localSettings.twoFactorAuth ? 'ENABLED' : 'ENABLE'}
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
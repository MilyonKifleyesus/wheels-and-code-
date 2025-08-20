import React, { useState, useEffect } from 'react';
import { Save, Upload, Download, Shield, Bell, Globe, Palette, Database, Loader2 } from 'lucide-react';
import Toast from '../ui/Toast';
import { useSettings, Settings } from '../../contexts/SettingsContext';

const SystemSettings: React.FC = () => {
  const { settings: initialSettings, loading, error, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState<Settings | null>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  const handleSaveSettings = async () => {
    if (!settings) {
        setToastMessage('Settings not loaded yet.');
        setToastType('error');
        setShowToast(true);
        return;
    }
    setIsSubmitting(true);
    const { success, error } = await updateSettings(settings);
    if (success) {
        setToastMessage('Settings saved successfully!');
        setToastType('success');
    } else {
        setToastMessage(`Error: ${error}`);
        setToastType('error');
    }
    setShowToast(true);
    setIsSubmitting(false);
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    if (settings) {
        setSettings(prev => ({
          ...prev!,
          [key]: value
        }));
    }
  };

  const handleNotificationChange = (key: keyof Settings['notifications'], value: boolean) => {
    if (settings) {
        setSettings(prev => ({
          ...prev!,
          notifications: {
            ...prev!.notifications,
            [key]: value
          }
        }));
    }
  };

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToastMessage('System backup downloaded successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setToastMessage('Backup restore feature would be implemented with proper validation');
      setToastType('success');
      setShowToast(true);
    }
  };

  if (loading && !settings) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-acid-yellow" />
            <p className="ml-4 text-white">Loading settings...</p>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-400">Error loading settings: {error}</div>;
  }

  if (!settings) {
    return <div className="text-gray-400">No settings available.</div>
  }

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
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-gray-400 mt-1">Configure your business settings and preferences</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>SAVE ALL CHANGES</span>
        </button>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium tracking-wider transition-colors duration-300 whitespace-nowrap ${
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

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Business Name</label>
                  <input type="text" value={settings.businessName} onChange={(e) => handleSettingChange('businessName', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number</label>
                  <input type="tel" value={settings.phone} onChange={(e) => handleSettingChange('phone', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Business Address</label>
                <textarea rows={3} value={settings.address} onChange={(e) => handleSettingChange('address', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Currency</label>
                  <select value={settings.currency} onChange={(e) => handleSettingChange('currency', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Distance Unit</label>
                  <select value={settings.distanceUnit} onChange={(e) => handleSettingChange('distanceUnit', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
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
                    <input type="color" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm" />
                    <input type="text" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input type="color" value={settings.secondaryColor} onChange={(e) => handleSettingChange('secondaryColor', e.target.value)} className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm" />
                    <input type="text" value={settings.secondaryColor} onChange={(e) => handleSettingChange('secondaryColor', e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input type="color" value={settings.backgroundColor} onChange={(e) => handleSettingChange('backgroundColor', e.target.value)} className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm" />
                    <input type="text" value={settings.backgroundColor} onChange={(e) => handleSettingChange('backgroundColor', e.target.value)} className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Notification Settings</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
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
                  <button onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)} className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${ settings.twoFactorAuth ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-acid-yellow text-black hover:bg-neon-lime' }`}>
                    {settings.twoFactorAuth ? 'ENABLED' : 'ENABLE'}
                  </button>
                </div>
            </div>
          )}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Backup & Data Management</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-3">Create Backup</h4>
                  <p className="text-gray-400 text-sm mb-4">Export all your business data</p>
                  <button onClick={exportData} className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD BACKUP</span>
                  </button>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-3">Restore Data</h4>
                  <p className="text-gray-400 text-sm mb-4">Import data from backup file</p>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="backup-upload" />
                  <label htmlFor="backup-upload" className="w-full bg-white/10 text-white py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>UPLOAD BACKUP</span>
                  </label>
                </div>
              </div>
              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-3">Automatic Backups</h4>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">Automatically backup your data daily</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.autoBackup} onChange={(e) => handleSettingChange('autoBackup', e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-acid-yellow"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
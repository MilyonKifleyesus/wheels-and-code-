import React, { useState } from 'react';
import { Save, Upload, Download, Shield, Bell, Globe, Palette, Database, Check } from 'lucide-react';
import Toast from '../ui/Toast';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState({
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
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    setToastMessage('Settings saved successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
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
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>SAVE ALL CHANGES</span>
        </button>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
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

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleSettingChange('businessName', e.target.value)}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Business Address</label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Currency</label>
                  <select 
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  >
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Distance Unit</label>
                  <select 
                    value={settings.distanceUnit}
                    onChange={(e) => handleSettingChange('distanceUnit', e.target.value)}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  >
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
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                      className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                      className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Logo Upload</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-acid-yellow transition-colors duration-300">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Upload your business logo</p>
                  <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 2MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setToastMessage('Logo upload feature would be implemented with cloud storage');
                        setToastType('success');
                        setShowToast(true);
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="mt-4 inline-block bg-acid-yellow text-black px-4 py-2 rounded-sm font-medium cursor-pointer hover:bg-neon-lime transition-colors duration-300"
                  >
                    CHOOSE FILE
                  </label>
                </div>
              </div>

              {/* Color Preview */}
              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-white font-bold mb-4">COLOR PREVIEW</h4>
                <div className="p-6 rounded-lg border border-gray-700" style={{ backgroundColor: settings.backgroundColor }}>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: settings.primaryColor }}>
                    Sample Heading
                  </h3>
                  <p className="text-white mb-4">This is how your website colors will look.</p>
                  <button 
                    className="px-6 py-2 rounded-sm font-bold text-black"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Notification Settings</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'newBookings', label: 'New Booking Notifications', description: 'Get notified when customers book services' },
                  { key: 'payments', label: 'Payment Confirmations', description: 'Receive alerts for successful payments' },
                  { key: 'serviceReminders', label: 'Service Reminders', description: 'Automated reminders for upcoming services' },
                  { key: 'inventory', label: 'Inventory Alerts', description: 'Notifications for low stock or new arrivals' },
                  { key: 'customerMessages', label: 'Customer Messages', description: 'Alerts for new customer inquiries' },
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                    <div>
                      <h4 className="text-white font-medium">{notification.label}</h4>
                      <p className="text-gray-400 text-sm">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                        onChange={(e) => handleNotificationChange(notification.key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-acid-yellow"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Primary notification email"
                    className="w-full bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                  <input
                    type="email"
                    placeholder="Secondary notification email (optional)"
                    className="w-full bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Change Password</h4>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <button 
                      onClick={() => {
                        setToastMessage('Password updated successfully!');
                        setToastType('success');
                        setShowToast(true);
                      }}
                      className="bg-acid-yellow text-black px-6 py-2 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                    >
                      UPDATE PASSWORD
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button 
                    onClick={() => {
                      handleSettingChange('twoFactorAuth', !settings.twoFactorAuth);
                      setToastMessage(`Two-factor authentication ${!settings.twoFactorAuth ? 'enabled' : 'disabled'}!`);
                      setToastType('success');
                      setShowToast(true);
                    }}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                      settings.twoFactorAuth 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-acid-yellow text-black hover:bg-neon-lime'
                    }`}
                  >
                    {settings.twoFactorAuth ? 'ENABLED' : 'ENABLE'}
                  </button>
                </div>

                <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-3">Login Activity</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <div>
                        <p className="text-white text-sm">Current Session</p>
                        <p className="text-gray-400 text-xs">Toronto, Canada • Chrome</p>
                      </div>
                      <span className="text-green-400 text-xs font-medium">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <div>
                        <p className="text-white text-sm">Previous Login</p>
                        <p className="text-gray-400 text-xs">2 hours ago • Toronto, Canada</p>
                      </div>
                      <span className="text-gray-400 text-xs">ENDED</span>
                    </div>
                  </div>
                </div>
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
                  <button 
                    onClick={exportData}
                    className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD BACKUP</span>
                  </button>
                </div>

                <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-3">Restore Data</h4>
                  <p className="text-gray-400 text-sm mb-4">Import data from backup file</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="backup-upload"
                  />
                  <label
                    htmlFor="backup-upload"
                    className="w-full bg-white/10 text-white py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>UPLOAD BACKUP</span>
                  </label>
                </div>
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-3">Automatic Backups</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Automatically backup your data daily</p>
                    <p className="text-gray-500 text-xs mt-1">Last backup: Today at 3:00 AM</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-acid-yellow"></div>
                  </label>
                </div>
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-3">Data Export Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-white/10 text-white py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                    EXPORT CUSTOMERS
                  </button>
                  <button className="bg-white/10 text-white py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                    EXPORT BOOKINGS
                  </button>
                  <button className="bg-white/10 text-white py-3 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                    EXPORT INVENTORY
                  </button>
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
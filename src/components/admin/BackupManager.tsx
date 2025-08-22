import React, { useState } from 'react';
import { Download, Upload, RefreshCw, Clock, Shield, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import Toast from '../ui/Toast';

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'content' | 'settings' | 'media';
  size: string;
  created: string;
  status: 'completed' | 'in_progress' | 'failed';
  includes: string[];
  downloadUrl?: string;
}

interface HealthCheck {
  category: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
  autoFix?: boolean;
}

const BackupManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState('backups');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: '1',
      name: 'Full Site Backup - Jan 20, 2024',
      type: 'full',
      size: '45.2 MB',
      created: '2024-01-20 03:00:00',
      status: 'completed',
      includes: ['Content', 'Settings', 'Media', 'Database'],
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Content Only - Jan 19, 2024',
      type: 'content',
      size: '2.1 MB',
      created: '2024-01-19 15:30:00',
      status: 'completed',
      includes: ['Pages', 'Sections', 'Templates'],
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'Settings Backup - Jan 18, 2024',
      type: 'settings',
      size: '156 KB',
      created: '2024-01-18 12:00:00',
      status: 'completed',
      includes: ['System Settings', 'User Roles', 'Integrations'],
      downloadUrl: '#'
    }
  ]);

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      category: 'Database Connection',
      status: 'healthy',
      message: 'All database connections are responding normally',
      lastChecked: '2024-01-20 16:45:00'
    },
    {
      category: 'Broken Links',
      status: 'warning',
      message: '3 broken internal links found',
      lastChecked: '2024-01-20 16:40:00',
      autoFix: true
    },
    {
      category: 'Image Optimization',
      status: 'warning',
      message: '12 images could be optimized for better performance',
      lastChecked: '2024-01-20 16:35:00',
      autoFix: true
    },
    {
      category: 'SEO Issues',
      status: 'error',
      message: '5 pages missing meta descriptions',
      lastChecked: '2024-01-20 16:30:00',
      autoFix: false
    },
    {
      category: 'Security Headers',
      status: 'healthy',
      message: 'All security headers are properly configured',
      lastChecked: '2024-01-20 16:25:00'
    },
    {
      category: 'Performance',
      status: 'healthy',
      message: 'Page load times are within acceptable range',
      lastChecked: '2024-01-20 16:20:00'
    }
  ]);

  const tabs = [
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'health', label: 'Health Checks', icon: Shield },
    { id: 'staging', label: 'Staging', icon: RefreshCw }
  ];

  const createBackup = async (type: BackupItem['type']) => {
    setIsCreatingBackup(true);
    
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBackup: BackupItem = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${new Date().toLocaleDateString()}`,
      type,
      size: `${Math.floor(Math.random() * 50) + 10}.${Math.floor(Math.random() * 9)} MB`,
      created: new Date().toISOString(),
      status: 'completed',
      includes: type === 'full' ? ['Content', 'Settings', 'Media', 'Database'] : 
                type === 'content' ? ['Pages', 'Sections', 'Templates'] :
                type === 'settings' ? ['System Settings', 'User Roles'] : ['Images', 'Documents'],
      downloadUrl: '#'
    };

    setBackups([newBackup, ...backups]);
    setIsCreatingBackup(false);
    setToastMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} backup created successfully!`);
    setToastType('success');
    setShowToast(true);
  };

  const downloadBackup = (backup: BackupItem) => {
    setToastMessage(`Downloading ${backup.name}...`);
    setToastType('success');
    setShowToast(true);
  };

  const runHealthCheck = async () => {
    setToastMessage('Running comprehensive health check...');
    setToastType('success');
    setShowToast(true);

    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setToastMessage('Health check completed! Found 2 issues that can be auto-fixed.');
    setToastType('success');
    setShowToast(true);
  };

  const autoFixIssue = (category: string) => {
    setHealthChecks(healthChecks.map(check => 
      check.category === category ? { ...check, status: 'healthy', message: 'Issue resolved automatically' } : check
    ));
    setToastMessage(`${category} issues fixed automatically!`);
    setToastType('success');
    setShowToast(true);
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackupTypeColor = (type: BackupItem['type']) => {
    switch (type) {
      case 'full': return 'bg-blue-500/20 text-blue-400';
      case 'content': return 'bg-green-500/20 text-green-400';
      case 'settings': return 'bg-purple-500/20 text-purple-400';
      case 'media': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
          <h2 className="text-2xl font-bold text-white">Backup & Health Manager</h2>
          <p className="text-gray-400 mt-1">Manage backups, monitor site health, and maintain staging environments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runHealthCheck}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>RUN HEALTH CHECK</span>
          </button>
          <button
            onClick={() => createBackup('full')}
            disabled={isCreatingBackup}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <Database className="w-5 h-5" />
            <span>{isCreatingBackup ? 'CREATING...' : 'CREATE BACKUP'}</span>
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
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Backup Management</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => createBackup('content')}
                    disabled={isCreatingBackup}
                    className="bg-green-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-green-700 transition-colors duration-300 disabled:opacity-50"
                  >
                    CONTENT ONLY
                  </button>
                  <button
                    onClick={() => createBackup('settings')}
                    disabled={isCreatingBackup}
                    className="bg-purple-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                  >
                    SETTINGS ONLY
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="bg-matte-black border border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-bold">{backup.name}</h4>
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium ${getBackupTypeColor(backup.type)}`}>
                            {backup.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Size: </span>
                            <span className="text-white">{backup.size}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Created: </span>
                            <span className="text-white">{new Date(backup.created).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Status: </span>
                            <span className="text-green-400">{backup.status}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {backup.includes.map((item) => (
                            <span key={item} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadBackup(backup)}
                          className="bg-acid-yellow text-black px-4 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>DOWNLOAD</span>
                        </button>
                        <button className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                          RESTORE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Site Health Monitoring</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    Last check: {new Date().toLocaleString()}
                  </div>
                  <button
                    onClick={runHealthCheck}
                    className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RUN CHECK</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-500">
                    {healthChecks.filter(h => h.status === 'healthy').length}
                  </p>
                  <p className="text-gray-400 text-sm">Healthy</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-yellow-500">
                    {healthChecks.filter(h => h.status === 'warning').length}
                  </p>
                  <p className="text-gray-400 text-sm">Warnings</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-red-500">
                    {healthChecks.filter(h => h.status === 'error').length}
                  </p>
                  <p className="text-gray-400 text-sm">Errors</p>
                </div>
              </div>

              <div className="space-y-4">
                {healthChecks.map((check, index) => (
                  <div key={index} className="bg-matte-black border border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(check.status)}
                        <div>
                          <h4 className="text-white font-bold">{check.category}</h4>
                          <p className="text-gray-400 text-sm">{check.message}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Last checked: {new Date(check.lastChecked).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {check.autoFix && check.status !== 'healthy' && (
                          <button
                            onClick={() => autoFixIssue(check.category)}
                            className="bg-acid-yellow text-black px-4 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300"
                          >
                            AUTO-FIX
                          </button>
                        )}
                        <button className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                          DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'staging' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Staging Environment</h3>
              
              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-white font-bold">Staging Site</h4>
                    <p className="text-gray-400 text-sm">Test changes before going live</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 font-medium">ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-medium mb-3">Staging URL</h5>
                    <div className="bg-dark-graphite border border-gray-700 rounded-sm p-3">
                      <code className="text-acid-yellow text-sm">https://staging.apexauto.com</code>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-medium mb-3">Last Sync</h5>
                    <div className="bg-dark-graphite border border-gray-700 rounded-sm p-3">
                      <span className="text-white text-sm">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300">
                    SYNC TO STAGING
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-green-700 transition-colors duration-300">
                    DEPLOY TO PRODUCTION
                  </button>
                  <button className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300">
                    VIEW STAGING
                  </button>
                </div>
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-4">Deployment History</h4>
                <div className="space-y-3">
                  {[
                    { version: 'v2.1.3', date: '2024-01-20 14:30', status: 'success', changes: '5 content updates, 2 bug fixes' },
                    { version: 'v2.1.2', date: '2024-01-18 10:15', status: 'success', changes: 'New vehicle listings, SEO improvements' },
                    { version: 'v2.1.1', date: '2024-01-15 16:45', status: 'success', changes: 'Performance optimizations' }
                  ].map((deployment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-dark-graphite rounded-sm">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">{deployment.version}</span>
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                            deployment.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {deployment.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{deployment.changes}</p>
                        <p className="text-gray-500 text-xs">{deployment.date}</p>
                      </div>
                      <button className="bg-white/10 text-white px-3 py-1 rounded-sm text-sm hover:bg-white/20 transition-colors duration-300">
                        ROLLBACK
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
import React, { useState } from 'react';
import { Calendar, Clock, Play, Pause, Eye, EyeOff, Plus, Edit, Trash2 } from 'lucide-react';
import Toast from '../ui/Toast';

interface ScheduledContent {
  id: string;
  name: string;
  type: 'page' | 'section' | 'promotion' | 'announcement';
  target: string;
  action: 'publish' | 'unpublish' | 'update';
  schedule: {
    publishDate: string;
    publishTime: string;
    unpublishDate?: string;
    unpublishTime?: string;
    timezone: string;
    recurring?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      endDate?: string;
    };
  };
  status: 'scheduled' | 'published' | 'expired' | 'cancelled';
  content?: any;
  approvals?: {
    required: boolean;
    approvers: string[];
    approved: boolean;
  };
}

const ContentScheduler: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedView, setSelectedView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState('all');

  const [scheduledItems, setScheduledItems] = useState<ScheduledContent[]>([
    {
      id: '1',
      name: 'Winter Service Special',
      type: 'promotion',
      target: 'Homepage Promo Section',
      action: 'publish',
      schedule: {
        publishDate: '2024-02-01',
        publishTime: '09:00',
        unpublishDate: '2024-02-29',
        unpublishTime: '23:59',
        timezone: 'America/Toronto'
      },
      status: 'scheduled',
      approvals: {
        required: true,
        approvers: ['manager@company.com'],
        approved: false
      }
    },
    {
      id: '2',
      name: 'New BMW M4 Arrival',
      type: 'announcement',
      target: 'Hero Section',
      action: 'publish',
      schedule: {
        publishDate: '2024-01-25',
        publishTime: '10:00',
        unpublishDate: '2024-01-31',
        unpublishTime: '18:00',
        timezone: 'America/Toronto'
      },
      status: 'published'
    },
    {
      id: '3',
      name: 'Holiday Hours Update',
      type: 'page',
      target: 'Contact Page',
      action: 'update',
      schedule: {
        publishDate: '2024-12-23',
        publishTime: '08:00',
        unpublishDate: '2024-01-02',
        unpublishTime: '09:00',
        timezone: 'America/Toronto',
        recurring: {
          enabled: true,
          frequency: 'yearly',
          endDate: '2026-12-31'
        }
      },
      status: 'expired'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'published': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <Eye className="w-4 h-4" />;
      case 'section': return <Layout className="w-4 h-4" />;
      case 'promotion': return <Gift className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredItems = scheduledItems.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newSchedule: ScheduledContent = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as ScheduledContent['type'],
      target: formData.get('target') as string,
      action: formData.get('action') as ScheduledContent['action'],
      schedule: {
        publishDate: formData.get('publishDate') as string,
        publishTime: formData.get('publishTime') as string,
        unpublishDate: formData.get('unpublishDate') as string || undefined,
        unpublishTime: formData.get('unpublishTime') as string || undefined,
        timezone: formData.get('timezone') as string || 'America/Toronto'
      },
      status: 'scheduled'
    };

    setScheduledItems([newSchedule, ...scheduledItems]);
    setShowCreateForm(false);
    setToastMessage('Content scheduled successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const cancelSchedule = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled content?')) {
      setScheduledItems(scheduledItems.map(item => 
        item.id === id ? { ...item, status: 'cancelled' } : item
      ));
      setToastMessage('Schedule cancelled successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const executeNow = (id: string) => {
    if (confirm('Are you sure you want to execute this scheduled content now?')) {
      setScheduledItems(scheduledItems.map(item => 
        item.id === id ? { ...item, status: 'published' } : item
      ));
      setToastMessage('Content published immediately!');
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
          <h2 className="text-2xl font-bold text-white">Content Scheduler</h2>
          <p className="text-gray-400 mt-1">Schedule content publishing and updates with automated workflows</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex border border-gray-700 rounded-sm overflow-hidden">
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 transition-colors duration-300 ${
                selectedView === 'list' ? 'bg-acid-yellow text-black' : 'bg-matte-black text-white hover:bg-gray-800'
              }`}
            >
              LIST
            </button>
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-4 py-2 transition-colors duration-300 ${
                selectedView === 'calendar' ? 'bg-acid-yellow text-black' : 'bg-matte-black text-white hover:bg-gray-800'
              }`}
            >
              CALENDAR
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>SCHEDULE CONTENT</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="text-sm text-gray-400">
            {filteredItems.length} scheduled items
          </div>
        </div>
      </div>

      {/* Scheduled Content List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-acid-yellow/10 rounded-sm">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <p className="text-gray-400 text-sm">{item.target}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-sm text-sm font-medium border ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Action</p>
                    <p className="text-white font-medium capitalize">{item.action}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Publish</p>
                    <p className="text-white font-medium">
                      {item.schedule.publishDate} at {item.schedule.publishTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Unpublish</p>
                    <p className="text-white font-medium">
                      {item.schedule.unpublishDate ? 
                        `${item.schedule.unpublishDate} at ${item.schedule.unpublishTime}` : 
                        'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Timezone</p>
                    <p className="text-white font-medium">{item.schedule.timezone}</p>
                  </div>
                </div>

                {item.schedule.recurring?.enabled && (
                  <div className="bg-matte-black border border-gray-700 rounded-sm p-3 mb-4">
                    <p className="text-acid-yellow text-sm font-medium">
                      🔄 Recurring {item.schedule.recurring.frequency}
                      {item.schedule.recurring.endDate && ` until ${item.schedule.recurring.endDate}`}
                    </p>
                  </div>
                )}

                {item.approvals?.required && (
                  <div className={`p-3 rounded-sm border ${
                    item.approvals.approved ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <p className={`text-sm font-medium ${
                      item.approvals.approved ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {item.approvals.approved ? '✅ Approved' : '⏳ Pending Approval'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Approvers: {item.approvals.approvers.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {item.status === 'scheduled' && (
                  <button
                    onClick={() => executeNow(item.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-green-600 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>PUBLISH NOW</span>
                  </button>
                )}
                <button className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => cancelSchedule(item.id)}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-sm font-medium hover:bg-red-500/30 transition-colors duration-300 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>CANCEL</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">SCHEDULE CONTENT</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-white font-bold">Content Details</h4>
                <input
                  name="name"
                  type="text"
                  placeholder="Schedule Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="type"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="">Content Type</option>
                    <option value="page">Page</option>
                    <option value="section">Section</option>
                    <option value="promotion">Promotion</option>
                    <option value="announcement">Announcement</option>
                  </select>
                  <select
                    name="action"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="">Action</option>
                    <option value="publish">Publish</option>
                    <option value="unpublish">Unpublish</option>
                    <option value="update">Update</option>
                  </select>
                </div>
                
                <input
                  name="target"
                  type="text"
                  placeholder="Target Page/Section"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Schedule Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Publish Date</label>
                    <input
                      name="publishDate"
                      type="date"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Publish Time</label>
                    <input
                      name="publishTime"
                      type="time"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Unpublish Date (Optional)</label>
                    <input
                      name="unpublishDate"
                      type="date"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Unpublish Time</label>
                    <input
                      name="unpublishTime"
                      type="time"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>

                <select
                  name="timezone"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                >
                  <option value="America/Toronto">America/Toronto</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  SCHEDULE CONTENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentScheduler;
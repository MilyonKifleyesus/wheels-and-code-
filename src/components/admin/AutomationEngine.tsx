import React, { useState } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Zap, Mail, MessageSquare, Webhook, Calendar } from 'lucide-react';
import Toast from '../ui/Toast';

interface AutomationTrigger {
  type: 'form_submit' | 'booking_created' | 'vehicle_inquiry' | 'page_visit' | 'time_based';
  conditions: any;
}

interface AutomationAction {
  type: 'email' | 'sms' | 'webhook' | 'create_ticket' | 'slack_notification' | 'update_crm';
  config: any;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  status: 'active' | 'paused' | 'draft';
  stats: {
    triggered: number;
    successful: number;
    failed: number;
    lastRun?: string;
  };
  created: string;
  lastModified: string;
}

const AutomationEngine: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger['type']>('form_submit');

  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'New Booking Notification',
      description: 'Send notifications when a new service booking is created',
      trigger: {
        type: 'booking_created',
        conditions: { service_type: 'any' }
      },
      actions: [
        {
          type: 'email',
          config: {
            to: 'admin@company.com',
            subject: 'New Service Booking',
            template: 'booking_notification'
          }
        },
        {
          type: 'sms',
          config: {
            to: '+14169166475',
            message: 'New booking: {{customer_name}} - {{service}} on {{date}}'
          }
        },
        {
          type: 'slack_notification',
          config: {
            channel: '#bookings',
            message: 'New booking received from {{customer_name}}'
          }
        }
      ],
      status: 'active',
      stats: {
        triggered: 156,
        successful: 154,
        failed: 2,
        lastRun: '2024-01-20 14:30'
      },
      created: '2024-01-01',
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Vehicle Inquiry Follow-up',
      description: 'Automated follow-up sequence for vehicle inquiries',
      trigger: {
        type: 'form_submit',
        conditions: { form_type: 'vehicle_inquiry' }
      },
      actions: [
        {
          type: 'email',
          config: {
            to: '{{customer_email}}',
            subject: 'Thank you for your interest in {{vehicle_name}}',
            template: 'inquiry_followup',
            delay: 0
          }
        },
        {
          type: 'create_ticket',
          config: {
            priority: 'high',
            category: 'sales',
            assignee: 'sales_team'
          }
        },
        {
          type: 'email',
          config: {
            to: '{{customer_email}}',
            subject: 'Special financing offer for {{vehicle_name}}',
            template: 'financing_offer',
            delay: 86400 // 24 hours
          }
        }
      ],
      status: 'active',
      stats: {
        triggered: 89,
        successful: 87,
        failed: 2,
        lastRun: '2024-01-20 16:45'
      },
      created: '2024-01-05',
      lastModified: '2024-01-18'
    },
    {
      id: '3',
      name: 'Weekly Inventory Report',
      description: 'Send weekly inventory summary to management',
      trigger: {
        type: 'time_based',
        conditions: { 
          schedule: 'weekly',
          day: 'monday',
          time: '09:00',
          timezone: 'America/Toronto'
        }
      },
      actions: [
        {
          type: 'email',
          config: {
            to: 'management@company.com',
            subject: 'Weekly Inventory Report',
            template: 'inventory_report'
          }
        },
        {
          type: 'webhook',
          config: {
            url: 'https://api.company.com/reports/inventory',
            method: 'POST',
            headers: { 'Authorization': 'Bearer {{api_key}}' }
          }
        }
      ],
      status: 'active',
      stats: {
        triggered: 12,
        successful: 12,
        failed: 0,
        lastRun: '2024-01-15 09:00'
      },
      created: '2024-01-01',
      lastModified: '2024-01-10'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTriggerIcon = (type: AutomationTrigger['type']) => {
    switch (type) {
      case 'form_submit': return <Mail className="w-4 h-4" />;
      case 'booking_created': return <Calendar className="w-4 h-4" />;
      case 'vehicle_inquiry': return <MessageSquare className="w-4 h-4" />;
      case 'page_visit': return <Eye className="w-4 h-4" />;
      case 'time_based': return <Clock className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: AutomationAction['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'webhook': return <Webhook className="w-3 h-3" />;
      case 'slack_notification': return <MessageSquare className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      trigger: {
        type: selectedTrigger,
        conditions: {}
      },
      actions: [],
      status: 'draft',
      stats: {
        triggered: 0,
        successful: 0,
        failed: 0
      },
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    setAutomations([newAutomation, ...automations]);
    setShowCreateForm(false);
    setToastMessage('Automation created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(automation => {
      if (automation.id === id) {
        const newStatus = automation.status === 'active' ? 'paused' : 'active';
        return { ...automation, status: newStatus };
      }
      return automation;
    }));
    
    setToastMessage('Automation status updated!');
    setToastType('success');
    setShowToast(true);
  };

  const deleteAutomation = (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      setAutomations(automations.filter(a => a.id !== id));
      setToastMessage('Automation deleted successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const testAutomation = (id: string) => {
    setToastMessage('Automation test completed successfully!');
    setToastType('success');
    setShowToast(true);
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
          <h2 className="text-2xl font-bold text-white">Automation Engine</h2>
          <p className="text-gray-400 mt-1">Create automated workflows for bookings, inquiries, and business processes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE AUTOMATION</span>
        </button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <div key={automation.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-acid-yellow/10 rounded-sm">
                  {getTriggerIcon(automation.trigger.type)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{automation.name}</h3>
                  <p className="text-gray-400 text-sm">{automation.description}</p>
                  <span className={`inline-block px-3 py-1 rounded-sm text-sm font-medium border mt-2 ${getStatusColor(automation.status)}`}>
                    {automation.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => testAutomation(automation.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300"
                >
                  TEST
                </button>
                <button
                  onClick={() => toggleAutomation(automation.id)}
                  className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                    automation.status === 'active' 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {automation.status === 'active' ? 'PAUSE' : 'ACTIVATE'}
                </button>
                <button
                  onClick={() => setEditingAutomation(automation)}
                  className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAutomation(automation.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-matte-black border border-gray-700 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-acid-yellow">{automation.stats.triggered}</p>
                <p className="text-gray-400 text-sm">Triggered</p>
              </div>
              <div className="bg-matte-black border border-gray-700 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-green-500">{automation.stats.successful}</p>
                <p className="text-gray-400 text-sm">Successful</p>
              </div>
              <div className="bg-matte-black border border-gray-700 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{automation.stats.failed}</p>
                <p className="text-gray-400 text-sm">Failed</p>
              </div>
              <div className="bg-matte-black border border-gray-700 rounded-sm p-3 text-center">
                <p className="text-lg font-bold text-white">
                  {automation.stats.triggered > 0 ? 
                    ((automation.stats.successful / automation.stats.triggered) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-gray-400 text-sm">Success Rate</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {automation.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-matte-black border border-gray-700 rounded-sm">
                  {getActionIcon(action.type)}
                  <span className="text-white text-sm capitalize">{action.type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>

            {automation.stats.lastRun && (
              <div className="mt-4 text-sm text-gray-400">
                Last run: {automation.stats.lastRun}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Automation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE AUTOMATION</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAutomation} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-white font-bold">Basic Information</h4>
                <input
                  name="name"
                  type="text"
                  placeholder="Automation Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Automation Description"
                  rows={2}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Trigger</h4>
                <select
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value as AutomationTrigger['type'])}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                >
                  <option value="form_submit">Form Submission</option>
                  <option value="booking_created">Booking Created</option>
                  <option value="vehicle_inquiry">Vehicle Inquiry</option>
                  <option value="page_visit">Page Visit</option>
                  <option value="time_based">Time Based</option>
                </select>

                {selectedTrigger === 'time_based' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <select className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>
                    <input
                      type="time"
                      className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: 'email', label: 'Send Email', icon: Mail },
                    { type: 'sms', label: 'Send SMS', icon: MessageSquare },
                    { type: 'webhook', label: 'Webhook', icon: Webhook },
                    { type: 'slack_notification', label: 'Slack Notification', icon: MessageSquare }
                  ].map((actionType) => {
                    const Icon = actionType.icon;
                    return (
                      <label key={actionType.type} className="flex items-center space-x-3 p-3 bg-matte-black border border-gray-700 rounded-sm cursor-pointer hover:border-gray-600 transition-colors duration-300">
                        <input type="checkbox" className="w-4 h-4" />
                        <Icon className="w-4 h-4 text-acid-yellow" />
                        <span className="text-white">{actionType.label}</span>
                      </label>
                    );
                  })}
                </div>
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
                  CREATE AUTOMATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationEngine;
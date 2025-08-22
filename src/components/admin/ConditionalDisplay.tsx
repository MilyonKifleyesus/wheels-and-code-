import React, { useState } from 'react';
import { Calendar, MapPin, Smartphone, Link, Eye, EyeOff, Plus, Edit, Trash2 } from 'lucide-react';
import Toast from '../ui/Toast';

interface DisplayRule {
  id: string;
  name: string;
  type: 'schedule' | 'geo' | 'device' | 'utm' | 'user-segment';
  conditions: {
    schedule?: {
      startDate: string;
      endDate: string;
      timezone: string;
      daysOfWeek?: string[];
      timeRange?: { start: string; end: string };
    };
    geo?: {
      countries: string[];
      regions: string[];
      cities: string[];
      radius?: { lat: number; lng: number; km: number };
    };
    device?: {
      types: string[];
      browsers?: string[];
      os?: string[];
    };
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
    };
    userSegment?: {
      segments: string[];
      excludeSegments?: string[];
    };
  };
  action: 'show' | 'hide';
  priority: number;
  isActive: boolean;
}

interface ConditionalSection {
  id: string;
  name: string;
  type: string;
  rules: string[];
  defaultVisibility: boolean;
  currentStatus: 'visible' | 'hidden' | 'conditional';
}

const ConditionalDisplay: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [editingRule, setEditingRule] = useState<DisplayRule | null>(null);
  const [selectedRuleType, setSelectedRuleType] = useState<DisplayRule['type']>('schedule');

  const [rules, setRules] = useState<DisplayRule[]>([
    {
      id: '1',
      name: 'Holiday Promotion Banner',
      type: 'schedule',
      conditions: {
        schedule: {
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          timezone: 'America/Toronto',
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeRange: { start: '09:00', end: '18:00' }
        }
      },
      action: 'show',
      priority: 1,
      isActive: true
    },
    {
      id: '2',
      name: 'Toronto Area Special Offers',
      type: 'geo',
      conditions: {
        geo: {
          countries: ['Canada'],
          regions: ['Ontario'],
          cities: ['Toronto', 'Mississauga', 'Brampton', 'Markham']
        }
      },
      action: 'show',
      priority: 2,
      isActive: true
    },
    {
      id: '3',
      name: 'Mobile Booking CTA',
      type: 'device',
      conditions: {
        device: {
          types: ['mobile', 'tablet']
        }
      },
      action: 'show',
      priority: 3,
      isActive: true
    }
  ]);

  const [sections, setSections] = useState<ConditionalSection[]>([
    {
      id: '1',
      name: 'Hero Section',
      type: 'hero',
      rules: ['1'],
      defaultVisibility: true,
      currentStatus: 'conditional'
    },
    {
      id: '2',
      name: 'Promotional Banner',
      type: 'promo',
      rules: ['1', '2'],
      defaultVisibility: false,
      currentStatus: 'conditional'
    },
    {
      id: '3',
      name: 'Mobile Booking Widget',
      type: 'booking',
      rules: ['3'],
      defaultVisibility: false,
      currentStatus: 'conditional'
    }
  ]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newRule: DisplayRule = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: selectedRuleType,
      conditions: {},
      action: formData.get('action') as 'show' | 'hide',
      priority: parseInt(formData.get('priority') as string) || 1,
      isActive: true
    };

    // Build conditions based on rule type
    switch (selectedRuleType) {
      case 'schedule':
        newRule.conditions.schedule = {
          startDate: formData.get('startDate') as string,
          endDate: formData.get('endDate') as string,
          timezone: formData.get('timezone') as string || 'America/Toronto'
        };
        break;
      case 'geo':
        newRule.conditions.geo = {
          countries: (formData.get('countries') as string).split(',').map(c => c.trim()).filter(Boolean),
          regions: (formData.get('regions') as string).split(',').map(r => r.trim()).filter(Boolean),
          cities: (formData.get('cities') as string).split(',').map(c => c.trim()).filter(Boolean)
        };
        break;
      case 'device':
        newRule.conditions.device = {
          types: (formData.get('deviceTypes') as string).split(',').map(d => d.trim()).filter(Boolean)
        };
        break;
      case 'utm':
        newRule.conditions.utm = {
          source: formData.get('utmSource') as string || undefined,
          medium: formData.get('utmMedium') as string || undefined,
          campaign: formData.get('utmCampaign') as string || undefined
        };
        break;
      case 'user-segment':
        newRule.conditions.userSegment = {
          segments: (formData.get('segments') as string).split(',').map(s => s.trim()).filter(Boolean)
        };
        break;
    }

    setRules([...rules, newRule]);
    setShowCreateRule(false);
    setToastMessage('Display rule created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
    
    setToastMessage('Rule status updated!');
    setToastType('success');
    setShowToast(true);
  };

  const deleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(r => r.id !== id));
      setToastMessage('Rule deleted successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const getRuleIcon = (type: DisplayRule['type']) => {
    switch (type) {
      case 'schedule': return <Calendar className="w-4 h-4" />;
      case 'geo': return <MapPin className="w-4 h-4" />;
      case 'device': return <Smartphone className="w-4 h-4" />;
      case 'utm': return <Link className="w-4 h-4" />;
      case 'user-segment': return <Users className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const renderRuleConditions = (rule: DisplayRule) => {
    switch (rule.type) {
      case 'schedule':
        return (
          <div className="text-sm text-gray-400">
            {rule.conditions.schedule?.startDate} - {rule.conditions.schedule?.endDate}
            {rule.conditions.schedule?.timeRange && (
              <span className="block">
                {rule.conditions.schedule.timeRange.start} - {rule.conditions.schedule.timeRange.end}
              </span>
            )}
          </div>
        );
      case 'geo':
        return (
          <div className="text-sm text-gray-400">
            {rule.conditions.geo?.cities?.join(', ') || 
             rule.conditions.geo?.regions?.join(', ') || 
             rule.conditions.geo?.countries?.join(', ')}
          </div>
        );
      case 'device':
        return (
          <div className="text-sm text-gray-400">
            {rule.conditions.device?.types?.join(', ')}
          </div>
        );
      case 'utm':
        return (
          <div className="text-sm text-gray-400">
            {Object.entries(rule.conditions.utm || {})
              .filter(([_, value]) => value)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}
          </div>
        );
      case 'user-segment':
        return (
          <div className="text-sm text-gray-400">
            {rule.conditions.userSegment?.segments?.join(', ')}
          </div>
        );
      default:
        return null;
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
          <h2 className="text-2xl font-bold text-white">Conditional Display</h2>
          <p className="text-gray-400 mt-1">Show/hide content based on schedule, location, device, or user segments</p>
        </div>
        <button
          onClick={() => setShowCreateRule(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE RULE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Rules */}
        <div className="space-y-4">
          <h3 className="text-white font-bold">DISPLAY RULES</h3>
          {rules.map((rule) => (
            <div key={rule.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-acid-yellow/10 rounded-sm">
                    {getRuleIcon(rule.type)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{rule.name}</h4>
                    <span className="text-xs text-gray-500 capitalize">{rule.type.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors duration-300 ${
                      rule.isActive 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-1 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1 bg-red-500/20 text-red-400 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                {renderRuleConditions(rule)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                  rule.action === 'show' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {rule.action.toUpperCase()}
                </span>
                <span className="text-gray-400 text-xs">Priority: {rule.priority}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sections with Rules */}
        <div className="space-y-4">
          <h3 className="text-white font-bold">SECTIONS WITH RULES</h3>
          {sections.map((section) => (
            <div key={section.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{section.name}</h4>
                  <p className="text-gray-400 text-sm">{section.rules.length} rule(s) applied</p>
                </div>
                <div className="flex items-center space-x-2">
                  {section.currentStatus === 'visible' ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : section.currentStatus === 'hidden' ? (
                    <EyeOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Target className="w-4 h-4 text-acid-yellow" />
                  )}
                  <span className={`text-sm font-medium ${
                    section.currentStatus === 'visible' ? 'text-green-500' :
                    section.currentStatus === 'hidden' ? 'text-red-500' :
                    'text-acid-yellow'
                  }`}>
                    {section.currentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {section.rules.map((ruleId) => {
                  const rule = rules.find(r => r.id === ruleId);
                  return rule ? (
                    <div key={ruleId} className="flex items-center justify-between p-2 bg-matte-black rounded-sm">
                      <div className="flex items-center space-x-2">
                        {getRuleIcon(rule.type)}
                        <span className="text-white text-sm">{rule.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-sm text-xs ${
                        rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE DISPLAY RULE</h3>
              <button
                onClick={() => setShowCreateRule(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-white font-bold">Rule Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Rule Name"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                  <select
                    value={selectedRuleType}
                    onChange={(e) => setSelectedRuleType(e.target.value as DisplayRule['type'])}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="schedule">Schedule Based</option>
                    <option value="geo">Geographic</option>
                    <option value="device">Device Type</option>
                    <option value="utm">UTM Parameters</option>
                    <option value="user-segment">User Segment</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields Based on Rule Type */}
              {selectedRuleType === 'schedule' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Schedule Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Start Date</label>
                      <input
                        name="startDate"
                        type="date"
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">End Date</label>
                      <input
                        name="endDate"
                        type="date"
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        required
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
              )}

              {selectedRuleType === 'geo' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Geographic Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      name="countries"
                      type="text"
                      placeholder="Countries (comma separated)"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <input
                      name="regions"
                      type="text"
                      placeholder="Regions/States"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <input
                      name="cities"
                      type="text"
                      placeholder="Cities"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
              )}

              {selectedRuleType === 'device' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">Device Conditions</h4>
                  <input
                    name="deviceTypes"
                    type="text"
                    placeholder="Device types: mobile, tablet, desktop"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
              )}

              {selectedRuleType === 'utm' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">UTM Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="utmSource"
                      type="text"
                      placeholder="UTM Source"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                    <input
                      name="utmMedium"
                      type="text"
                      placeholder="UTM Medium"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                  <input
                    name="utmCampaign"
                    type="text"
                    placeholder="UTM Campaign"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
              )}

              {selectedRuleType === 'user-segment' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">User Segment Conditions</h4>
                  <input
                    name="segments"
                    type="text"
                    placeholder="User segments: new-customers, vip-customers, returning-visitors"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="action"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="show">Show Content</option>
                  <option value="hide">Hide Content</option>
                </select>
                <input
                  name="priority"
                  type="number"
                  placeholder="Priority (1-10)"
                  min="1"
                  max="10"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateRule(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  CREATE RULE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionalDisplay;
import React, { useState } from 'react';
import { Users, Target, Eye, Settings, BarChart3, Zap, MapPin, Clock } from 'lucide-react';
import Toast from '../ui/Toast';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  conditions: {
    type: 'behavior' | 'demographic' | 'geographic' | 'temporal';
    rules: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
      value: any;
    }>;
  };
  userCount: number;
  conversionRate: number;
  avgOrderValue: number;
  isActive: boolean;
}

interface PersonalizationRule {
  id: string;
  name: string;
  segment: string;
  target: string;
  changes: {
    hero?: { heading?: string; cta?: string; image?: string };
    pricing?: { discount?: number; highlight?: string };
    content?: { message?: string; urgency?: boolean };
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    lift: number;
  };
  isActive: boolean;
}

const PersonalizationEngine: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState('segments');
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);

  const [segments, setSegments] = useState<UserSegment[]>([
    {
      id: '1',
      name: 'First-Time Visitors',
      description: 'Users visiting the website for the first time',
      conditions: {
        type: 'behavior',
        rules: [
          { field: 'visit_count', operator: 'equals', value: 1 },
          { field: 'session_duration', operator: 'greater_than', value: 30 }
        ]
      },
      userCount: 2456,
      conversionRate: 3.2,
      avgOrderValue: 0,
      isActive: true
    },
    {
      id: '2',
      name: 'Luxury Car Shoppers',
      description: 'Users who viewed vehicles over $200k',
      conditions: {
        type: 'behavior',
        rules: [
          { field: 'viewed_vehicle_price', operator: 'greater_than', value: 200000 },
          { field: 'pages_viewed', operator: 'greater_than', value: 3 }
        ]
      },
      userCount: 567,
      conversionRate: 8.7,
      avgOrderValue: 285000,
      isActive: true
    },
    {
      id: '3',
      name: 'Service Customers',
      description: 'Users who primarily book services',
      conditions: {
        type: 'behavior',
        rules: [
          { field: 'service_bookings', operator: 'greater_than', value: 0 },
          { field: 'vehicle_purchases', operator: 'equals', value: 0 }
        ]
      },
      userCount: 1234,
      conversionRate: 12.4,
      avgOrderValue: 450,
      isActive: true
    },
    {
      id: '4',
      name: 'Toronto Area',
      description: 'Users located in Greater Toronto Area',
      conditions: {
        type: 'geographic',
        rules: [
          { field: 'city', operator: 'in_range', value: ['Toronto', 'Mississauga', 'Brampton', 'Markham'] }
        ]
      },
      userCount: 3456,
      conversionRate: 6.8,
      avgOrderValue: 125000,
      isActive: true
    }
  ]);

  const [rules, setRules] = useState<PersonalizationRule[]>([
    {
      id: '1',
      name: 'First-Time Visitor Welcome',
      segment: 'First-Time Visitors',
      target: 'Hero Section',
      changes: {
        hero: {
          heading: 'Welcome to Apex Auto - Your Trusted Partner',
          cta: 'Explore Our Services',
          image: 'welcome-hero.jpg'
        },
        content: {
          message: 'New to Apex Auto? Get 15% off your first service!',
          urgency: false
        }
      },
      performance: {
        impressions: 12456,
        clicks: 567,
        conversions: 89,
        lift: 23.5
      },
      isActive: true
    },
    {
      id: '2',
      name: 'Luxury Shopper Experience',
      segment: 'Luxury Car Shoppers',
      target: 'Vehicle Listings',
      changes: {
        hero: {
          heading: 'Exclusive Luxury Collection',
          cta: 'Schedule Private Viewing'
        },
        pricing: {
          highlight: 'Concierge Service Included'
        }
      },
      performance: {
        impressions: 3456,
        clicks: 234,
        conversions: 45,
        lift: 67.8
      },
      isActive: true
    }
  ]);

  const tabs = [
    { id: 'segments', label: 'User Segments', icon: Users },
    { id: 'rules', label: 'Personalization Rules', icon: Target },
    { id: 'performance', label: 'Performance', icon: BarChart3 }
  ];

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newSegment: UserSegment = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      conditions: {
        type: formData.get('conditionType') as UserSegment['conditions']['type'],
        rules: []
      },
      userCount: 0,
      conversionRate: 0,
      avgOrderValue: 0,
      isActive: true
    };

    setSegments([newSegment, ...segments]);
    setShowCreateSegment(false);
    setToastMessage('User segment created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newRule: PersonalizationRule = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      segment: formData.get('segment') as string,
      target: formData.get('target') as string,
      changes: {},
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        lift: 0
      },
      isActive: true
    };

    setRules([newRule, ...rules]);
    setShowCreateRule(false);
    setToastMessage('Personalization rule created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const toggleSegment = (id: string) => {
    setSegments(segments.map(segment => 
      segment.id === id ? { ...segment, isActive: !segment.isActive } : segment
    ));
    setToastMessage('Segment status updated!');
    setToastType('success');
    setShowToast(true);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
    setToastMessage('Personalization rule updated!');
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
          <h2 className="text-2xl font-bold text-white">Personalization Engine</h2>
          <p className="text-gray-400 mt-1">Create targeted experiences based on user behavior and demographics</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'segments' && (
            <button
              onClick={() => setShowCreateSegment(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300"
            >
              CREATE SEGMENT
            </button>
          )}
          {activeTab === 'rules' && (
            <button
              onClick={() => setShowCreateRule(true)}
              className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300"
            >
              CREATE RULE
            </button>
          )}
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
          {activeTab === 'segments' && (
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.id} className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{segment.name}</h3>
                      <p className="text-gray-400 text-sm">{segment.description}</p>
                    </div>
                    <button
                      onClick={() => toggleSegment(segment.id)}
                      className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                        segment.isActive 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {segment.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-acid-yellow">{segment.userCount.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{segment.conversionRate}%</p>
                      <p className="text-gray-400 text-sm">Conversion Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">${segment.avgOrderValue.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Avg Order Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{segment.conditions.rules.length}</p>
                      <p className="text-gray-400 text-sm">Conditions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-matte-black border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{rule.name}</h3>
                      <p className="text-gray-400 text-sm">Target: {rule.target} • Segment: {rule.segment}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                          rule.isActive 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                      <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{rule.performance.impressions.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Impressions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{rule.performance.clicks.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{rule.performance.conversions}</p>
                      <p className="text-gray-400 text-sm">Conversions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-500">+{rule.performance.lift}%</p>
                      <p className="text-gray-400 text-sm">Lift</p>
                    </div>
                  </div>

                  {/* Changes Preview */}
                  <div className="bg-dark-graphite border border-gray-700 rounded-sm p-4">
                    <h4 className="text-white font-medium mb-2">Personalization Changes</h4>
                    <div className="space-y-2 text-sm">
                      {rule.changes.hero && (
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-acid-yellow" />
                          <span className="text-gray-400">Hero:</span>
                          <span className="text-white">{rule.changes.hero.heading || rule.changes.hero.cta}</span>
                        </div>
                      )}
                      {rule.changes.pricing && (
                        <div className="flex items-center space-x-2">
                          <Target className="w-3 h-3 text-acid-yellow" />
                          <span className="text-gray-400">Pricing:</span>
                          <span className="text-white">{rule.changes.pricing.discount}% discount</span>
                        </div>
                      )}
                      {rule.changes.content && (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-3 h-3 text-acid-yellow" />
                          <span className="text-gray-400">Content:</span>
                          <span className="text-white">{rule.changes.content.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-acid-yellow">4</p>
                  <p className="text-gray-400 text-sm">Active Segments</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-500">2</p>
                  <p className="text-gray-400 text-sm">Active Rules</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-500">+34%</p>
                  <p className="text-gray-400 text-sm">Avg Conversion Lift</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-white">7,890</p>
                  <p className="text-gray-400 text-sm">Personalized Views</p>
                </div>
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-4">Segment Performance Comparison</h4>
                <div className="space-y-4">
                  {segments.map((segment) => (
                    <div key={segment.id} className="flex items-center justify-between p-4 bg-dark-graphite rounded-sm">
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{segment.name}</h5>
                        <p className="text-gray-400 text-sm">{segment.userCount.toLocaleString()} users</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-white font-bold">{segment.conversionRate}%</p>
                          <p className="text-gray-400 text-xs">Conversion</p>
                        </div>
                        <div className="text-center">
                          <p className="text-acid-yellow font-bold">${segment.avgOrderValue.toLocaleString()}</p>
                          <p className="text-gray-400 text-xs">AOV</p>
                        </div>
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div 
                            className="h-full bg-acid-yellow rounded-full"
                            style={{ width: `${Math.min(segment.conversionRate * 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Segment Modal */}
      {showCreateSegment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE USER SEGMENT</h3>
              <button
                onClick={() => setShowCreateSegment(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Segment Name"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />
              
              <textarea
                name="description"
                placeholder="Segment Description"
                rows={2}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                required
              ></textarea>

              <select
                name="conditionType"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              >
                <option value="behavior">Behavior Based</option>
                <option value="demographic">Demographic</option>
                <option value="geographic">Geographic</option>
                <option value="temporal">Time Based</option>
              </select>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSegment(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  CREATE SEGMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE PERSONALIZATION RULE</h3>
              <button
                onClick={() => setShowCreateRule(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Rule Name"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="segment"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Segment</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.name}>{segment.name}</option>
                  ))}
                </select>
                <select
                  name="target"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Target Element</option>
                  <option value="Hero Section">Hero Section</option>
                  <option value="Vehicle Listings">Vehicle Listings</option>
                  <option value="Service Pricing">Service Pricing</option>
                  <option value="Contact Form">Contact Form</option>
                </select>
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

export default PersonalizationEngine;
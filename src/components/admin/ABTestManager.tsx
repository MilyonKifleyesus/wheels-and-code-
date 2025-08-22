import React, { useState } from 'react';
import { Plus, Play, Pause, BarChart3, Target, TrendingUp, Eye, Settings } from 'lucide-react';
import Toast from '../ui/Toast';

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'page' | 'section' | 'element';
  target: string;
  variants: Array<{
    id: string;
    name: string;
    traffic: number;
    conversions: number;
    conversionRate: number;
    isControl: boolean;
  }>;
  metrics: {
    primaryGoal: string;
    secondaryGoals: string[];
  };
  schedule: {
    startDate: string;
    endDate?: string;
    minSampleSize: number;
    confidenceLevel: number;
  };
  results: {
    winner?: string;
    significance: number;
    improvement: number;
  };
}

const ABTestManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Hero CTA Button Test',
      status: 'running',
      type: 'element',
      target: 'Hero Section CTA',
      variants: [
        { id: 'control', name: 'Browse Cars', traffic: 2456, conversions: 123, conversionRate: 5.01, isControl: true },
        { id: 'variant-a', name: 'View Inventory', traffic: 2389, conversions: 145, conversionRate: 6.07, isControl: false },
        { id: 'variant-b', name: 'Explore Vehicles', traffic: 2401, conversions: 134, conversionRate: 5.58, isControl: false }
      ],
      metrics: {
        primaryGoal: 'Click-through Rate',
        secondaryGoals: ['Time on Page', 'Bounce Rate']
      },
      schedule: {
        startDate: '2024-01-15',
        minSampleSize: 1000,
        confidenceLevel: 95
      },
      results: {
        winner: 'variant-a',
        significance: 87.3,
        improvement: 21.2
      }
    },
    {
      id: '2',
      name: 'Service Booking Form Layout',
      status: 'completed',
      type: 'page',
      target: 'Booking Page',
      variants: [
        { id: 'control', name: 'Single Page Form', traffic: 1890, conversions: 89, conversionRate: 4.71, isControl: true },
        { id: 'variant-a', name: 'Multi-step Form', traffic: 1923, conversions: 134, conversionRate: 6.97, isControl: false }
      ],
      metrics: {
        primaryGoal: 'Form Completion Rate',
        secondaryGoals: ['Form Abandonment', 'Time to Complete']
      },
      schedule: {
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        minSampleSize: 500,
        confidenceLevel: 95
      },
      results: {
        winner: 'variant-a',
        significance: 99.2,
        improvement: 48.0
      }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'completed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newTest: ABTest = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      status: 'draft',
      type: formData.get('type') as ABTest['type'],
      target: formData.get('target') as string,
      variants: [
        {
          id: 'control',
          name: 'Control (Original)',
          traffic: 0,
          conversions: 0,
          conversionRate: 0,
          isControl: true
        },
        {
          id: 'variant-a',
          name: formData.get('variantName') as string || 'Variant A',
          traffic: 0,
          conversions: 0,
          conversionRate: 0,
          isControl: false
        }
      ],
      metrics: {
        primaryGoal: formData.get('primaryGoal') as string,
        secondaryGoals: []
      },
      schedule: {
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        minSampleSize: parseInt(formData.get('minSampleSize') as string) || 1000,
        confidenceLevel: parseInt(formData.get('confidenceLevel') as string) || 95
      },
      results: {
        significance: 0,
        improvement: 0
      }
    };

    setTests([newTest, ...tests]);
    setShowCreateForm(false);
    setToastMessage('A/B test created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const toggleTestStatus = (id: string) => {
    setTests(tests.map(test => {
      if (test.id === id) {
        let newStatus: ABTest['status'];
        if (test.status === 'draft') newStatus = 'running';
        else if (test.status === 'running') newStatus = 'paused';
        else if (test.status === 'paused') newStatus = 'running';
        else newStatus = test.status;
        
        return { ...test, status: newStatus };
      }
      return test;
    }));
    
    setToastMessage('Test status updated!');
    setToastType('success');
    setShowToast(true);
  };

  const declareWinner = (testId: string, variantId: string) => {
    setTests(tests.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          status: 'completed',
          results: {
            ...test.results,
            winner: variantId
          }
        };
      }
      return test;
    }));
    
    setToastMessage('Winner declared and test completed!');
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
          <h2 className="text-2xl font-bold text-white">A/B Test Manager</h2>
          <p className="text-gray-400 mt-1">Create and manage A/B tests to optimize conversions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE TEST</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-white font-bold text-lg">{test.name}</h3>
                  <span className={`px-3 py-1 rounded-sm text-sm font-medium border ${getStatusColor(test.status)}`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400">Testing: {test.target}</p>
                <p className="text-gray-400 text-sm">Primary Goal: {test.metrics.primaryGoal}</p>
              </div>
              
              <div className="flex space-x-2">
                {test.status !== 'completed' && (
                  <button
                    onClick={() => toggleTestStatus(test.id)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 flex items-center space-x-2 ${
                      test.status === 'running' 
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {test.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{test.status === 'running' ? 'PAUSE' : 'START'}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
                  className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Variants Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {test.variants.map((variant) => (
                <div key={variant.id} className={`p-4 rounded-sm border ${
                  variant.isControl ? 'bg-gray-800 border-gray-700' : 'bg-matte-black border-gray-700'
                } ${test.results.winner === variant.id ? 'border-acid-yellow bg-acid-yellow/5' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{variant.name}</h4>
                    {variant.isControl && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-sm">CONTROL</span>
                    )}
                    {test.results.winner === variant.id && (
                      <span className="px-2 py-1 bg-acid-yellow text-black text-xs rounded-sm font-bold">WINNER</span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Traffic</span>
                      <span className="text-white">{variant.traffic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conversions</span>
                      <span className="text-white">{variant.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-acid-yellow font-bold">{variant.conversionRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  {test.status === 'running' && !test.results.winner && (
                    <button
                      onClick={() => declareWinner(test.id, variant.id)}
                      className="w-full mt-3 bg-acid-yellow text-black py-2 rounded-sm text-xs font-bold hover:bg-neon-lime transition-colors duration-300"
                    >
                      DECLARE WINNER
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Test Results */}
            {test.results.winner && (
              <div className="bg-matte-black border border-gray-700 rounded-sm p-4">
                <h4 className="text-white font-bold mb-2">TEST RESULTS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Statistical Significance</p>
                    <p className="text-green-400 font-bold">{test.results.significance}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Improvement</p>
                    <p className="text-acid-yellow font-bold">+{test.results.improvement}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Confidence Level</p>
                    <p className="text-white font-medium">{test.schedule.confidenceLevel}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed View */}
            {selectedTest?.id === test.id && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-bold mb-4">CONVERSION TIMELINE</h4>
                    <div className="bg-matte-black border border-gray-700 rounded-sm p-4">
                      <div className="space-y-3">
                        {[
                          { day: 'Day 1', control: 2.1, variant: 3.2 },
                          { day: 'Day 3', control: 3.8, variant: 4.9 },
                          { day: 'Day 7', control: 4.2, variant: 5.8 },
                          { day: 'Day 14', control: 4.8, variant: 6.1 },
                          { day: 'Today', control: 5.01, variant: 6.07 }
                        ].map((data) => (
                          <div key={data.day} className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm w-16">{data.day}</span>
                            <div className="flex-1 mx-4 space-y-1">
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-800 rounded-full h-2">
                                  <div 
                                    className="h-full bg-gray-500 rounded-full"
                                    style={{ width: `${(data.control / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-400 text-xs">{data.control}%</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-800 rounded-full h-2">
                                  <div 
                                    className="h-full bg-acid-yellow rounded-full"
                                    style={{ width: `${(data.variant / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-acid-yellow text-xs font-bold">{data.variant}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-bold mb-4">TEST CONFIGURATION</h4>
                    <div className="bg-matte-black border border-gray-700 rounded-sm p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Test Type</span>
                        <span className="text-white capitalize">{test.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target Element</span>
                        <span className="text-white">{test.target}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Traffic Split</span>
                        <span className="text-white">50/50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Sample Size</span>
                        <span className="text-white">{test.schedule.minSampleSize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence Level</span>
                        <span className="text-white">{test.schedule.confidenceLevel}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Test Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE A/B TEST</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-white font-bold">Test Configuration</h4>
                <input
                  name="name"
                  type="text"
                  placeholder="Test Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="type"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="">Test Type</option>
                    <option value="page">Full Page</option>
                    <option value="section">Page Section</option>
                    <option value="element">Single Element</option>
                  </select>
                  <input
                    name="target"
                    type="text"
                    placeholder="Target Element/Page"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Variant Configuration</h4>
                <input
                  name="variantName"
                  type="text"
                  placeholder="Variant Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Goals & Metrics</h4>
                <select
                  name="primaryGoal"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Primary Goal</option>
                  <option value="Click-through Rate">Click-through Rate</option>
                  <option value="Form Completion">Form Completion</option>
                  <option value="Booking Conversion">Booking Conversion</option>
                  <option value="Time on Page">Time on Page</option>
                  <option value="Bounce Rate">Bounce Rate</option>
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Test Schedule</h4>
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
                    <label className="block text-gray-400 text-sm font-medium mb-2">End Date (Optional)</label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Minimum Sample Size</label>
                    <input
                      name="minSampleSize"
                      type="number"
                      placeholder="1000"
                      min="100"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Confidence Level (%)</label>
                    <select
                      name="confidenceLevel"
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    >
                      <option value="90">90%</option>
                      <option value="95">95%</option>
                      <option value="99">99%</option>
                    </select>
                  </div>
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
                  CREATE TEST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestManager;
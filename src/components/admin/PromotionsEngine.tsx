import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Target, Percent, Gift, Clock, Users } from 'lucide-react';
import Toast from '../ui/Toast';

interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'bogo' | 'free-service' | 'cashback';
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  discount: {
    type: 'percentage' | 'fixed' | 'free';
    value: number;
  };
  conditions: {
    minPurchase?: number;
    maxUses?: number;
    firstTimeOnly?: boolean;
    specificServices?: string[];
    customerSegment?: string;
  };
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
  targeting: {
    audience: string[];
    geoLocation?: string[];
    deviceType?: string[];
  };
  performance: {
    uses: number;
    revenue: number;
    conversions: number;
  };
}

const PromotionsEngine: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'New Customer Oil Change Special',
      type: 'discount',
      status: 'active',
      discount: { type: 'percentage', value: 25 },
      conditions: {
        firstTimeOnly: true,
        specificServices: ['Oil Change'],
        maxUses: 100
      },
      schedule: {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        timezone: 'America/Toronto'
      },
      targeting: {
        audience: ['new-customers'],
        geoLocation: ['Toronto', 'GTA']
      },
      performance: {
        uses: 45,
        revenue: 3200,
        conversions: 67
      }
    },
    {
      id: '2',
      name: 'Performance Package Deal',
      type: 'discount',
      status: 'active',
      discount: { type: 'fixed', value: 200 },
      conditions: {
        minPurchase: 1000,
        specificServices: ['Performance Tune', 'Exhaust Upgrade'],
        maxUses: 50
      },
      schedule: {
        startDate: '2024-01-15',
        endDate: '2024-02-29',
        timezone: 'America/Toronto'
      },
      targeting: {
        audience: ['performance-enthusiasts', 'vip-customers']
      },
      performance: {
        uses: 12,
        revenue: 8900,
        conversions: 23
      }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'scheduled': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'draft': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      case 'free-service': return <Gift className="w-4 h-4" />;
      case 'cashback': return <Target className="w-4 h-4" />;
      default: return <Percent className="w-4 h-4" />;
    }
  };

  const filteredPromotions = promotions.filter(promo => 
    filterStatus === 'all' || promo.status === filterStatus
  );

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as Promotion['type'],
      status: 'draft',
      discount: {
        type: formData.get('discountType') as 'percentage' | 'fixed' | 'free',
        value: parseInt(formData.get('discountValue') as string) || 0
      },
      conditions: {
        minPurchase: parseInt(formData.get('minPurchase') as string) || undefined,
        maxUses: parseInt(formData.get('maxUses') as string) || undefined,
        firstTimeOnly: formData.get('firstTimeOnly') === 'on'
      },
      schedule: {
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        timezone: 'America/Toronto'
      },
      targeting: {
        audience: (formData.get('audience') as string).split(',').map(a => a.trim()).filter(Boolean)
      },
      performance: {
        uses: 0,
        revenue: 0,
        conversions: 0
      }
    };

    setPromotions([newPromotion, ...promotions]);
    setShowCreateForm(false);
    setToastMessage('Promotion created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const togglePromotionStatus = (id: string) => {
    setPromotions(promotions.map(promo => {
      if (promo.id === id) {
        const newStatus = promo.status === 'active' ? 'draft' : 'active';
        return { ...promo, status: newStatus };
      }
      return promo;
    }));
    
    setToastMessage('Promotion status updated!');
    setToastType('success');
    setShowToast(true);
  };

  const deletePromotion = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(p => p.id !== id));
      setToastMessage('Promotion deleted successfully!');
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
          <h2 className="text-2xl font-bold text-white">Promotions Engine</h2>
          <p className="text-gray-400 mt-1">Create and manage targeted promotions with advanced rules</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE PROMOTION</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="text-sm text-gray-400">
            Showing {filteredPromotions.length} of {promotions.length} promotions
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        {filteredPromotions.map((promotion) => (
          <div key={promotion.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-acid-yellow/10 rounded-sm">
                    {getTypeIcon(promotion.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{promotion.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-sm text-sm font-medium border ${getStatusColor(promotion.status)}`}>
                      {promotion.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Discount</p>
                    <p className="text-acid-yellow font-bold">
                      {promotion.discount.type === 'percentage' ? `${promotion.discount.value}%` : 
                       promotion.discount.type === 'fixed' ? `$${promotion.discount.value}` : 'FREE'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Uses</p>
                    <p className="text-white font-medium">
                      {promotion.performance.uses}
                      {promotion.conditions.maxUses && ` / ${promotion.conditions.maxUses}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-green-400 font-bold">${promotion.performance.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Period</p>
                    <p className="text-white text-sm">
                      {promotion.schedule.startDate} - {promotion.schedule.endDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {promotion.targeting.audience.map((audience) => (
                    <span key={audience} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-sm">
                      {audience}
                    </span>
                  ))}
                  {promotion.conditions.firstTimeOnly && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-sm">
                      First-time only
                    </span>
                  )}
                  {promotion.conditions.minPurchase && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-sm">
                      Min ${promotion.conditions.minPurchase}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => togglePromotionStatus(promotion.id)}
                  className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                    promotion.status === 'active' 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {promotion.status === 'active' ? 'PAUSE' : 'ACTIVATE'}
                </button>
                <button
                  onClick={() => setEditingPromotion(promotion)}
                  className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePromotion(promotion.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Promotion Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE PROMOTION</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromotion} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-white font-bold">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Promotion Name"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                  <select
                    name="type"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="discount">Discount</option>
                    <option value="bogo">Buy One Get One</option>
                    <option value="free-service">Free Service</option>
                    <option value="cashback">Cashback</option>
                  </select>
                </div>
              </div>

              {/* Discount Settings */}
              <div className="space-y-4">
                <h4 className="text-white font-bold">Discount Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="discountType"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="free">Free Service</option>
                  </select>
                  <input
                    name="discountValue"
                    type="number"
                    placeholder="Discount Value"
                    min="0"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h4 className="text-white font-bold">Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="minPurchase"
                    type="number"
                    placeholder="Minimum Purchase Amount"
                    min="0"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                  <input
                    name="maxUses"
                    type="number"
                    placeholder="Maximum Uses"
                    min="1"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    name="firstTimeOnly"
                    type="checkbox"
                    className="w-4 h-4"
                  />
                  <span className="text-white">First-time customers only</span>
                </label>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h4 className="text-white font-bold">Schedule</h4>
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
              </div>

              {/* Targeting */}
              <div className="space-y-4">
                <h4 className="text-white font-bold">Targeting</h4>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Target Audience (comma separated)</label>
                  <input
                    name="audience"
                    type="text"
                    placeholder="new-customers, vip-customers, performance-enthusiasts"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
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
                  CREATE PROMOTION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsEngine;
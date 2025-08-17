import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Car, Calendar, BarChart3, PieChart, Activity, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useVehicles } from '../../contexts/VehicleContext';
import { useBookings } from '../../contexts/BookingContext';
import { getConfigurationStatus } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { vehicles } = useVehicles();
  const { bookings } = useBookings();
  const [timeRange, setTimeRange] = useState('30d');
  
  // Check environment configuration
  const config = getConfigurationStatus();
  console.log("🔧 Admin Dashboard - Environment Status:", config);

  // Calculate real metrics from actual data
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
  const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
  const avgPrice = vehicles.length > 0 ? Math.round(totalValue / vehicles.length) : 0;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

  const metrics = [
    { 
      label: 'Total Revenue', 
      value: `$${(soldVehicles * 150000).toLocaleString()}`, 
      change: '+12%', 
      icon: DollarSign, 
      color: 'text-green-500' 
    },
    { 
      label: 'Vehicles Available', 
      value: availableVehicles.toString(), 
      change: `+${Math.floor(availableVehicles * 0.1)}`, 
      icon: Car, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Service Bookings', 
      value: bookings.length.toString(), 
      change: '+15%', 
      icon: Calendar, 
      color: 'text-purple-500' 
    },
    { 
      label: 'New Customers', 
      value: '47', 
      change: '+22%', 
      icon: Users, 
      color: 'text-acid-yellow' 
    },
  ];

  const recentActivities = [
    { 
      action: 'New vehicle added', 
      details: vehicles.length > 0 ? `${vehicles[0].year} ${vehicles[0].make} ${vehicles[0].model}` : 'No vehicles in inventory yet', 
      time: '2 hours ago', 
      type: 'vehicle',
      status: 'success'
    },
    { 
      action: 'New booking received', 
      details: bookings.length > 0 ? `${bookings[bookings.length - 1].service} for ${bookings[bookings.length - 1].customerName}` : 'No recent bookings', 
      time: '1 hour ago', 
      type: 'booking',
      status: 'pending'
    },
    { 
      action: 'Service completed', 
      details: 'Oil change for John Smith', 
      time: '4 hours ago', 
      type: 'service',
      status: 'completed'
    },
    { 
      action: 'Payment received', 
      details: '$599 for brake service', 
      time: '6 hours ago', 
      type: 'payment',
      status: 'success'
    },
    { 
      action: 'New booking', 
      details: 'Engine diagnostics scheduled', 
      time: '8 hours ago', 
      type: 'booking',
      status: 'pending'
    },
    {
      action: 'Vehicle sold',
      details: vehicles.length > 1 ? `${vehicles[1].year} ${vehicles[1].make} ${vehicles[1].model}` : 'No vehicle sales yet',
      time: '1 day ago',
      type: 'sale',
      status: 'success'
    }
  ];

  // Filter out activities that don't have valid data
  const validActivities = recentActivities.filter(activity => {
    if (activity.type === 'vehicle' && vehicles.length === 0) return false;
    if (activity.type === 'booking' && bookings.length === 0) return false;
    if (activity.type === 'sale' && vehicles.length < 2) return false;
    return true;
  });

  const salesData = [
    { month: 'Jan', sales: 245000, services: 32000, vehicles: 3 },
    { month: 'Feb', sales: 320000, services: 28000, vehicles: 4 },
    { month: 'Mar', sales: 180000, services: 35000, vehicles: 2 },
    { month: 'Apr', sales: 410000, services: 42000, vehicles: 5 },
    { month: 'May', sales: 290000, services: 38000, vehicles: 3 },
    { month: 'Jun', sales: 380000, services: 45000, vehicles: 4 },
  ];

  const topServices = [
    { name: 'Oil Change', revenue: 15600, bookings: 89, growth: '+12%' },
    { name: 'Brake Service', revenue: 12400, bookings: 34, growth: '+8%' },
    { name: 'Engine Diagnostics', revenue: 8900, bookings: 28, growth: '+15%' },
    { name: 'Performance Tune', revenue: 7200, bookings: 12, growth: '+25%' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Car className="w-4 h-4" />;
      case 'service': return <Activity className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'sale': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'vehicle': return 'bg-blue-500';
      case 'service': return 'bg-green-500';
      case 'payment': return 'bg-acid-yellow';
      case 'booking': return 'bg-purple-500';
      case 'sale': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-wide">BUSINESS DASHBOARD</h2>
          <p className="text-gray-400 mt-2">Complete overview of your automotive business</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-dark-graphite border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white/10 rounded-sm`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm tracking-wider">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-wide">REVENUE TRENDS</h3>
            <BarChart3 className="w-5 h-5 text-acid-yellow" />
          </div>
          
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-gray-400 w-12 font-medium">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-acid-yellow rounded-full transition-all duration-500"
                        style={{ width: `${(data.sales / 450000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(data.services / 50000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{data.vehicles} vehicles</span>
                    <span>${(data.sales + data.services).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-acid-yellow rounded-full"></div>
              <span className="text-gray-400 text-sm">Vehicle Sales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Service Revenue</span>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-wide">TOP SERVICES</h3>
            <PieChart className="w-5 h-5 text-acid-yellow" />
          </div>
          
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-matte-black rounded-sm hover:bg-gray-800 transition-colors duration-300">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <span className="text-green-400 text-sm font-medium">{service.growth}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{service.bookings} bookings this month</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-acid-yellow font-bold">${service.revenue.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Revenue</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Today's Appointments:</p>
              <span className="text-acid-yellow font-bold">{todayBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-wide">RECENT ACTIVITY</h3>
          <Activity className="w-5 h-5 text-acid-yellow" />
        </div>
        
        <div className="space-y-4">
          {validActivities.length > 0 ? validActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-matte-black rounded-sm hover:bg-gray-800 transition-colors duration-300">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">{activity.action}</p>
                  <span className="text-gray-500 text-sm">{activity.time}</span>
                </div>
                <p className="text-gray-400 text-sm">{activity.details}</p>
              </div>
              <div className={`px-2 py-1 rounded-sm text-xs font-medium ${
                activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                activity.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {activity.status.toUpperCase()}
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recent activity to display</p>
              <p className="text-gray-500 text-sm mt-2">Activity will appear here as you use the system</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white tracking-wide mb-6">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-acid-yellow text-black p-4 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>ADD VEHICLE</span>
          </button>
          <button className="bg-white/10 text-white p-4 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>NEW BOOKING</span>
          </button>
          <button className="bg-white/10 text-white p-4 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>ADD CUSTOMER</span>
          </button>
          <button className="bg-white/10 text-white p-4 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>VIEW REPORTS</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
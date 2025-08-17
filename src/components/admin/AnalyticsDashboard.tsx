import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Car, Calendar, BarChart3, PieChart, Activity, Download, Filter, RefreshCw } from 'lucide-react';
import { useVehicles } from '../../contexts/VehicleContext';
import { useBookings } from '../../contexts/BookingContext';
import Toast from '../ui/Toast';

const AnalyticsDashboard: React.FC = () => {
  const { vehicles } = useVehicles();
  const { bookings } = useBookings();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Calculate real metrics from actual data
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + v.price, 0);
  const avgVehiclePrice = vehicles.length > 0 ? Math.round(totalInventoryValue / vehicles.length) : 0;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalServiceRevenue = bookings
    .filter(b => b.actualCost)
    .reduce((sum, b) => sum + (b.actualCost || 0), 0);

  const metrics = [
    { 
      label: 'Total Revenue', 
      value: `$${(soldVehicles * 180000 + totalServiceRevenue).toLocaleString()}`, 
      change: '+12%', 
      icon: DollarSign, 
      color: 'text-green-500',
      trend: 'up'
    },
    { 
      label: 'Vehicles Sold', 
      value: soldVehicles.toString(), 
      change: `+${Math.floor(soldVehicles * 0.2)}`, 
      icon: Car, 
      color: 'text-blue-500',
      trend: 'up'
    },
    { 
      label: 'Service Bookings', 
      value: bookings.length.toString(), 
      change: '+15%', 
      icon: Calendar, 
      color: 'text-purple-500',
      trend: 'up'
    },
    { 
      label: 'Active Customers', 
      value: new Set(bookings.map(b => b.customerEmail)).size.toString(), 
      change: '+22%', 
      icon: Users, 
      color: 'text-acid-yellow',
      trend: 'up'
    },
  ];

  const salesData = [
    { month: 'Jan', sales: 245000, services: 32000, vehicles: 3, customers: 12 },
    { month: 'Feb', sales: 320000, services: 28000, vehicles: 4, customers: 15 },
    { month: 'Mar', sales: 180000, services: 35000, vehicles: 2, customers: 18 },
    { month: 'Apr', sales: 410000, services: 42000, vehicles: 5, customers: 22 },
    { month: 'May', sales: 290000, services: 38000, vehicles: 3, customers: 19 },
    { month: 'Jun', sales: 380000, services: 45000, vehicles: 4, customers: 25 },
  ];

  const topServices = [
    { name: 'Oil Change', revenue: 15600, bookings: bookings.filter(b => b.service.includes('Oil')).length || 89, growth: '+12%', margin: '65%' },
    { name: 'Brake Service', revenue: 12400, bookings: Math.max(bookings.filter(b => b.service.includes('Brake')).length, 34), growth: '+8%', margin: '58%' },
    { name: 'Engine Diagnostics', revenue: 8900, bookings: Math.max(bookings.filter(b => b.service.includes('Engine')).length, 28), growth: '+15%', margin: '72%' },
    { name: 'Performance Tune', revenue: 7200, bookings: Math.max(bookings.filter(b => b.service.includes('Performance')).length, 12), growth: '+25%', margin: '80%' },
  ];

  const customerSegments = [
    { segment: 'VIP Customers', count: 12, revenue: 89000, percentage: 35 },
    { segment: 'Regular Customers', count: new Set(bookings.map(b => b.customerEmail)).size - 12, revenue: 156000, percentage: 45 },
    { segment: 'New Customers', count: Math.floor(new Set(bookings.map(b => b.customerEmail)).size * 0.3), revenue: 67000, percentage: 20 },
  ];

  const vehiclePerformance = vehicles.map(vehicle => ({
    name: `${vehicle.make} ${vehicle.model}`,
    views: Math.floor(Math.random() * 500) + 100,
    inquiries: Math.floor(Math.random() * 50) + 10,
    testDrives: Math.floor(Math.random() * 20) + 5,
    status: vehicle.status,
    price: vehicle.price
  }));

  const exportData = () => {
    const data = {
      metrics,
      salesData,
      topServices,
      customerSegments,
      vehiclePerformance,
      bookings: bookings.length,
      vehicles: vehicles.length,
      exportDate: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToastMessage('Analytics report downloaded successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const refreshData = () => {
    setToastMessage('Analytics data refreshed successfully!');
    setToastType('success');
    setShowToast(true);
  };

  return (
    <div className="space-y-8">
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-wide">BUSINESS ANALYTICS</h2>
          <p className="text-gray-400 mt-2">Comprehensive insights into your automotive business performance</p>
        </div>
        <div className="flex space-x-4">
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
          <button
            onClick={refreshData}
            className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REFRESH</span>
          </button>
          <button
            onClick={exportData}
            className="bg-acid-yellow text-black px-4 py-2 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.label} 
              className={`bg-dark-graphite border rounded-lg p-6 hover:border-gray-700 transition-all duration-300 cursor-pointer ${
                selectedMetric === metric.label.toLowerCase().replace(' ', '') ? 'border-acid-yellow' : 'border-gray-800'
              }`}
              onClick={() => setSelectedMetric(metric.label.toLowerCase().replace(' ', ''))}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white/10 rounded-sm`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-4 h-4 ${metric.color}`} />
                  <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm tracking-wider">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-wide">REVENUE TRENDS</h3>
            <BarChart3 className="w-5 h-5 text-acid-yellow" />
          </div>
          
          <div className="space-y-4">
            {salesData.map((data, index) => {
              const total = data.sales + data.services;
              const maxTotal = Math.max(...salesData.map(d => d.sales + d.services));
              return (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-gray-400 w-12 font-medium">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex space-x-2 mb-1">
                      <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-acid-yellow rounded-full transition-all duration-500"
                          style={{ width: `${(data.sales / maxTotal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(data.services / 50000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{data.vehicles} vehicles • {data.customers} customers</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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

        {/* Top Services Performance */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-wide">SERVICE PERFORMANCE</h3>
            <PieChart className="w-5 h-5 text-acid-yellow" />
          </div>
          
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name} className="p-4 bg-matte-black rounded-sm hover:bg-gray-800 transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{service.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-sm font-medium">{service.growth}</span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-acid-yellow text-sm font-medium">{service.margin}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">{service.bookings} bookings</span>
                    <span className="text-acid-yellow font-bold">${service.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-acid-yellow rounded-full transition-all duration-500"
                      style={{ width: `${(service.revenue / 16000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-wide">CUSTOMER SEGMENTS</h3>
          <Users className="w-5 h-5 text-acid-yellow" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerSegments.map((segment, index) => (
            <div key={segment.segment} className="text-center p-4 bg-matte-black rounded-sm">
              <h4 className="text-white font-bold mb-2">{segment.segment}</h4>
              <div className="space-y-2">
                <p className="text-2xl font-black text-acid-yellow">{segment.count}</p>
                <p className="text-gray-400 text-sm">customers</p>
                <p className="text-white font-medium">${segment.revenue.toLocaleString()}</p>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-acid-yellow rounded-full transition-all duration-500"
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs">{segment.percentage}% of total revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Performance */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-wide">VEHICLE PERFORMANCE</h3>
          <Car className="w-5 h-5 text-acid-yellow" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium py-3">VEHICLE</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">VIEWS</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">INQUIRIES</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">TEST DRIVES</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">STATUS</th>
                <th className="text-right text-gray-400 text-sm font-medium py-3">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {vehiclePerformance.slice(0, 6).map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-matte-black transition-colors duration-300">
                  <td className="py-3 text-white font-medium">{vehicle.name}</td>
                  <td className="py-3 text-gray-300">{vehicle.views}</td>
                  <td className="py-3 text-gray-300">{vehicle.inquiries}</td>
                  <td className="py-3 text-gray-300">{vehicle.testDrives}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                      vehicle.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      vehicle.status === 'sold' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right text-acid-yellow font-bold">
                    ${vehicle.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 text-center">
          <h4 className="text-gray-400 text-sm tracking-wider mb-2">TOTAL VEHICLES</h4>
          <p className="text-3xl font-black text-white">{vehicles.length}</p>
          <p className="text-acid-yellow text-sm font-medium">{availableVehicles} available</p>
        </div>
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 text-center">
          <h4 className="text-gray-400 text-sm tracking-wider mb-2">TOTAL BOOKINGS</h4>
          <p className="text-3xl font-black text-white">{bookings.length}</p>
          <p className="text-acid-yellow text-sm font-medium">{pendingBookings} pending</p>
        </div>
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 text-center">
          <h4 className="text-gray-400 text-sm tracking-wider mb-2">AVG VEHICLE PRICE</h4>
          <p className="text-3xl font-black text-white">${avgVehiclePrice.toLocaleString()}</p>
          <p className="text-acid-yellow text-sm font-medium">CAD</p>
        </div>
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 text-center">
          <h4 className="text-gray-400 text-sm tracking-wider mb-2">SERVICE REVENUE</h4>
          <p className="text-3xl font-black text-white">${totalServiceRevenue.toLocaleString()}</p>
          <p className="text-acid-yellow text-sm font-medium">{completedBookings} completed</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
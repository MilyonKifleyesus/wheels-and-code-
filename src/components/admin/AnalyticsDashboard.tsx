import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Car, Calendar, BarChart3, PieChart, Download, RefreshCw, Loader2 } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import Toast from '../ui/Toast';
import { Link } from 'react-router-dom';

const AnalyticsDashboard: React.FC = () => {
  const { analytics, loading, error, refreshAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState('30d');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleRefresh = () => {
      refreshAnalytics();
      setToastMessage('Analytics data is being refreshed!');
      setToastType('success');
      setShowToast(true);
  }

  if (loading || !analytics) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-acid-yellow" />
            <p className="ml-4 text-2xl text-white">Calculating Analytics...</p>
        </div>
    );
  }

  if (error) {
      return <div className="text-red-400 text-center p-8">Error loading analytics: {error}</div>;
  }

  const formatChange = (change: number) => {
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
  }

  const metrics = [
    { 
      label: 'Total Revenue', 
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: formatChange(analytics.revenueChange),
      icon: DollarSign, 
      color: 'text-green-500',
    },
    { 
      label: 'Vehicles Sold', 
      value: analytics.vehiclesSold.toString(),
      change: formatChange(analytics.vehiclesSoldChange),
      icon: Car, 
      color: 'text-blue-500',
    },
    { 
      label: 'Service Bookings', 
      value: analytics.totalBookings.toString(),
      change: formatChange(analytics.bookingsChange),
      icon: Calendar, 
      color: 'text-purple-500',
    },
    { 
      label: 'Active Customers', 
      value: analytics.activeCustomers.toString(),
      change: formatChange(analytics.customersChange),
      icon: Users, 
      color: 'text-acid-yellow',
    },
  ];

  const maxMonthlyValue = Math.max(1, ...analytics.monthlyData.map(d => d.sales + d.services));
  const totalCustomerSegmentRevenue = analytics.customerSegments.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="space-y-8">
      <Toast type={toastType} message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-wide">BUSINESS ANALYTICS</h2>
          <p className="text-gray-400 mt-2">Comprehensive insights into your automotive business performance</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={handleRefresh} disabled={loading} className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
            <div key={metric.label} className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-sm"><metric.icon className={`w-6 h-6 ${metric.color}`} /></div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-4 h-4 ${metric.color}`} />
                  <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm tracking-wider">{metric.label}</p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white tracking-wide mb-6">REVENUE TRENDS (LAST 6 MONTHS)</h3>
          <div className="space-y-4">
            {analytics.monthlyData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-gray-400 w-12 font-medium">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2 mb-1">
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden" title={`Sales: $${data.sales.toLocaleString()}`}>
                      <div className="h-full bg-acid-yellow rounded-full" style={{ width: `${(data.sales / maxMonthlyValue) * 100}%` }} />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden" title={`Services: $${data.services.toLocaleString()}`}>
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(data.services / maxMonthlyValue) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white tracking-wide mb-6">TOP SERVICES BY REVENUE</h3>
          <div className="space-y-4">
            {analytics.topServices.map((service) => (
              <div key={service.name} className="p-4 bg-matte-black rounded-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{service.name}</h4>
                  <span className="text-acid-yellow font-bold">${service.revenue.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm">{service.bookings} bookings</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white tracking-wide mb-6">CUSTOMER SEGMENTS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.customerSegments.map((segment) => (
            <div key={segment.segment} className="text-center p-4 bg-matte-black rounded-sm">
              <h4 className="text-white font-bold mb-2">{segment.segment}</h4>
              <p className="text-2xl font-black text-acid-yellow">{segment.count}</p>
              <p className="text-gray-400 text-sm">customers</p>
              <p className="text-white font-medium mt-2">${segment.revenue.toLocaleString()}</p>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-2">
                <div className="h-full bg-acid-yellow rounded-full" style={{ width: `${(segment.revenue / (totalCustomerSegmentRevenue || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white tracking-wide mb-6">VEHICLE PERFORMANCE</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium py-3">VEHICLE</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">STATUS</th>
                <th className="text-right text-gray-400 text-sm font-medium py-3">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {analytics.vehiclePerformance.slice(0, 10).map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-800 hover:bg-matte-black transition-colors duration-300">
                  <td className="py-3 text-white font-medium"><Link to={`/vehicle/${vehicle.id}`} className="hover:text-acid-yellow">{vehicle.name}</Link></td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-sm text-xs font-medium ${ vehicle.status === 'available' ? 'bg-green-500/20 text-green-400' : vehicle.status === 'sold' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right text-acid-yellow font-bold">${vehicle.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
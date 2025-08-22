import React, { useState } from 'react';
import { TrendingUp, Users, Target, Zap, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import Toast from '../ui/Toast';

interface AnalyticsData {
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: string;
    topPages: Array<{ page: string; views: number; conversions: number }>;
  };
  conversions: {
    bookingRate: number;
    inquiryRate: number;
    testDriveRate: number;
    salesRate: number;
    funnelData: Array<{ step: string; visitors: number; dropOff: number }>;
  };
  attribution: {
    channels: Array<{ source: string; visitors: number; conversions: number; revenue: number; roi: number }>;
    campaigns: Array<{ name: string; clicks: number; conversions: number; cost: number; revenue: number }>;
  };
  heatmaps: {
    sections: Array<{ name: string; clicks: number; engagement: number; scrollDepth: number }>;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('traffic');

  const [analyticsData] = useState<AnalyticsData>({
    traffic: {
      pageViews: 45678,
      uniqueVisitors: 12345,
      bounceRate: 32.5,
      avgSessionDuration: '3m 45s',
      topPages: [
        { page: '/inventory', views: 15678, conversions: 234 },
        { page: '/', views: 12345, conversions: 189 },
        { page: '/services', views: 8901, conversions: 156 },
        { page: '/vehicle/bmw-m3', views: 5432, conversions: 89 },
        { page: '/book', views: 4321, conversions: 298 }
      ]
    },
    conversions: {
      bookingRate: 4.2,
      inquiryRate: 8.7,
      testDriveRate: 2.1,
      salesRate: 1.3,
      funnelData: [
        { step: 'Landing Page', visitors: 10000, dropOff: 0 },
        { step: 'Vehicle Details', visitors: 6500, dropOff: 35 },
        { step: 'Contact Form', visitors: 4200, dropOff: 35.4 },
        { step: 'Booking Started', visitors: 2800, dropOff: 33.3 },
        { step: 'Booking Completed', visitors: 1890, dropOff: 32.5 }
      ]
    },
    attribution: {
      channels: [
        { source: 'Google Organic', visitors: 5678, conversions: 234, revenue: 145000, roi: 890 },
        { source: 'Google Ads', visitors: 3456, conversions: 189, revenue: 98000, roi: 245 },
        { source: 'Facebook', visitors: 2345, conversions: 98, revenue: 67000, roi: 156 },
        { source: 'Direct', visitors: 1234, conversions: 67, revenue: 45000, roi: 0 },
        { source: 'Referral', visitors: 890, conversions: 34, revenue: 23000, roi: 0 }
      ],
      campaigns: [
        { name: 'BMW M3 Campaign', clicks: 2345, conversions: 89, cost: 1200, revenue: 45000 },
        { name: 'Service Special', clicks: 1890, conversions: 156, cost: 800, revenue: 23000 },
        { name: 'Luxury Collection', clicks: 1456, conversions: 67, cost: 950, revenue: 34000 }
      ]
    },
    heatmaps: {
      sections: [
        { name: 'Hero Section', clicks: 2345, engagement: 78, scrollDepth: 95 },
        { name: 'Vehicle Grid', clicks: 1890, engagement: 65, scrollDepth: 82 },
        { name: 'Services Preview', clicks: 1456, engagement: 58, scrollDepth: 71 },
        { name: 'Contact Form', clicks: 987, engagement: 89, scrollDepth: 45 },
        { name: 'Footer', clicks: 567, engagement: 23, scrollDepth: 12 }
      ]
    }
  });

  const exportReport = () => {
    const report = {
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToastMessage('Analytics report exported successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const refreshData = () => {
    setToastMessage('Analytics data refreshed successfully!');
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
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-gray-400 mt-1">Comprehensive insights with attribution tracking and conversion funnels</p>
        </div>
        <div className="flex space-x-3">
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
            onClick={exportReport}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-sm">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-green-400 text-sm font-medium">+12.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.traffic.uniqueVisitors.toLocaleString()}</h3>
          <p className="text-gray-400 text-sm">Unique Visitors</p>
        </div>

        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-sm">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-green-400 text-sm font-medium">+8.3%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.conversions.bookingRate}%</h3>
          <p className="text-gray-400 text-sm">Booking Conversion</p>
        </div>

        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-sm">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-green-400 text-sm font-medium">+15.7%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.traffic.bounceRate}%</h3>
          <p className="text-gray-400 text-sm">Bounce Rate</p>
        </div>

        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-acid-yellow/10 rounded-sm">
              <Zap className="w-6 h-6 text-acid-yellow" />
            </div>
            <span className="text-green-400 text-sm font-medium">+5.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.traffic.avgSessionDuration}</h3>
          <p className="text-gray-400 text-sm">Avg Session Duration</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">CONVERSION FUNNEL</h3>
        
        <div className="space-y-4">
          {analyticsData.conversions.funnelData.map((step, index) => {
            const width = (step.visitors / analyticsData.conversions.funnelData[0].visitors) * 100;
            return (
              <div key={step.step} className="flex items-center space-x-4">
                <div className="w-32 text-gray-400 text-sm">{step.step}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full bg-acid-yellow rounded-full transition-all duration-500 flex items-center justify-between px-4"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-black font-bold text-sm">{step.visitors.toLocaleString()}</span>
                    {index > 0 && (
                      <span className="text-black text-xs">-{step.dropOff}%</span>
                    )}
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-white font-medium">{width.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attribution Analysis */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">TRAFFIC ATTRIBUTION</h3>
          
          <div className="space-y-4">
            {analyticsData.attribution.channels.map((channel) => (
              <div key={channel.source} className="p-4 bg-matte-black rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{channel.source}</h4>
                  <span className="text-acid-yellow font-bold">${channel.revenue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Visitors</p>
                    <p className="text-white font-medium">{channel.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Conversions</p>
                    <p className="text-white font-medium">{channel.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">ROI</p>
                    <p className={`font-medium ${channel.roi > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {channel.roi > 0 ? `${channel.roi}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Heatmap */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">SECTION ENGAGEMENT</h3>
          
          <div className="space-y-4">
            {analyticsData.heatmaps.sections.map((section) => (
              <div key={section.name} className="p-4 bg-matte-black rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{section.name}</h4>
                  <span className="text-acid-yellow font-bold">{section.clicks}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Engagement</span>
                    <span className="text-white">{section.engagement}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-acid-yellow rounded-full transition-all duration-500"
                      style={{ width: `${section.engagement}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Scroll Depth</span>
                    <span className="text-white">{section.scrollDepth}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${section.scrollDepth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Performance */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">TOP PAGES PERFORMANCE</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium py-3">PAGE</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">VIEWS</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">CONVERSIONS</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">CONVERSION RATE</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3">ENGAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.traffic.topPages.map((page, index) => {
                const conversionRate = ((page.conversions / page.views) * 100).toFixed(2);
                return (
                  <tr key={page.page} className="border-b border-gray-800 hover:bg-matte-black transition-colors duration-300">
                    <td className="py-3 text-white font-medium">{page.page}</td>
                    <td className="py-3 text-gray-300">{page.views.toLocaleString()}</td>
                    <td className="py-3 text-gray-300">{page.conversions}</td>
                    <td className="py-3 text-acid-yellow font-bold">{conversionRate}%</td>
                    <td className="py-3">
                      <div className="w-20 bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-full bg-acid-yellow rounded-full"
                          style={{ width: `${Math.min(parseFloat(conversionRate) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">CAMPAIGN PERFORMANCE</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsData.attribution.campaigns.map((campaign) => {
            const roi = ((campaign.revenue - campaign.cost) / campaign.cost * 100).toFixed(1);
            const conversionRate = ((campaign.conversions / campaign.clicks) * 100).toFixed(2);
            
            return (
              <div key={campaign.name} className="bg-matte-black border border-gray-700 rounded-sm p-4">
                <h4 className="text-white font-bold mb-3">{campaign.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clicks</span>
                    <span className="text-white">{campaign.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions</span>
                    <span className="text-white">{campaign.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-acid-yellow font-bold">{conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost</span>
                    <span className="text-white">${campaign.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-green-400 font-bold">${campaign.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400">ROI</span>
                    <span className={`font-bold ${parseFloat(roi) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {roi}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
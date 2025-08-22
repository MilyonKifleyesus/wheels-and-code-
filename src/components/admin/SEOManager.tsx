import React, { useState } from 'react';
import { Search, Globe, Image, Code, Link, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Toast from '../ui/Toast';

interface SEOPage {
  id: string;
  path: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  hreflang?: { [key: string]: string };
  schema?: {
    type: 'WebPage' | 'Product' | 'LocalBusiness' | 'FAQ' | 'Article';
    data: any;
  };
  lastUpdated: string;
  seoScore: number;
  issues: string[];
}

const SEOManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null);
  const [activeTab, setActiveTab] = useState('pages');

  const [pages, setPages] = useState<SEOPage[]>([
    {
      id: '1',
      path: '/',
      title: 'Apex Auto Sales & Repair - Premium Automotive Services Toronto',
      metaDescription: 'Premium automotive sales and repair services in Toronto. Expert technicians, luxury vehicles, and exceptional customer service.',
      keywords: ['automotive', 'car sales', 'auto repair', 'Toronto', 'luxury cars'],
      ogImage: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1200',
      schema: {
        type: 'LocalBusiness',
        data: {
          name: 'Apex Auto Sales & Repair',
          address: '179 Weston Rd, Toronto, ON M6N 3A5',
          telephone: '(416) 916-6475'
        }
      },
      lastUpdated: '2024-01-20',
      seoScore: 85,
      issues: ['Missing alt text on 2 images']
    },
    {
      id: '2',
      path: '/inventory',
      title: 'Premium Vehicle Inventory - Luxury Cars Toronto | Apex Auto',
      metaDescription: 'Browse our curated selection of premium and luxury vehicles. BMW, Mercedes, Porsche, and more. Financing available.',
      keywords: ['luxury cars', 'BMW', 'Mercedes', 'Porsche', 'vehicle inventory', 'Toronto'],
      ogImage: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1200',
      schema: {
        type: 'Product',
        data: {
          category: 'Automotive',
          brand: 'Various'
        }
      },
      lastUpdated: '2024-01-18',
      seoScore: 78,
      issues: ['Meta description too long', 'Missing structured data for vehicles']
    },
    {
      id: '3',
      path: '/services',
      title: 'Expert Automotive Services - Oil Change, Brake Service | Apex Auto',
      metaDescription: 'Professional automotive services including oil changes, brake service, engine diagnostics, and performance tuning.',
      keywords: ['auto service', 'oil change', 'brake service', 'engine diagnostics', 'Toronto'],
      schema: {
        type: 'FAQ',
        data: {
          questions: [
            { question: 'What services do you offer?', answer: 'We offer comprehensive automotive services...' }
          ]
        }
      },
      lastUpdated: '2024-01-15',
      seoScore: 92,
      issues: []
    }
  ]);

  const tabs = [
    { id: 'pages', label: 'Pages', icon: Globe },
    { id: 'schema', label: 'Schema Markup', icon: Code },
    { id: 'images', label: 'Image SEO', icon: Image },
    { id: 'redirects', label: 'Redirects', icon: Link },
    { id: 'sitemap', label: 'Sitemap', icon: Search }
  ];

  const handleUpdatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const updatedPage: SEOPage = {
      ...selectedPage,
      title: formData.get('title') as string,
      metaDescription: formData.get('metaDescription') as string,
      keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()).filter(Boolean),
      ogImage: formData.get('ogImage') as string,
      canonicalUrl: formData.get('canonicalUrl') as string,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setPages(pages.map(page => page.id === selectedPage.id ? updatedPage : page));
    setSelectedPage(updatedPage);
    setToastMessage('SEO settings updated successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const runSEOAudit = () => {
    setToastMessage('SEO audit completed! Found 3 optimization opportunities.');
    setToastType('success');
    setShowToast(true);
  };

  const generateSitemap = () => {
    setToastMessage('Sitemap generated and submitted to search engines!');
    setToastType('success');
    setShowToast(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
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
          <h2 className="text-2xl font-bold text-white">SEO Manager</h2>
          <p className="text-gray-400 mt-1">Optimize your website for search engines with advanced SEO tools</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runSEOAudit}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>RUN AUDIT</span>
          </button>
          <button
            onClick={generateSitemap}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>UPDATE SITEMAP</span>
          </button>
        </div>
      </div>

      <div className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium tracking-wider transition-colors duration-300 whitespace-nowrap ${
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
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Page List */}
              <div className="space-y-4">
                <h3 className="text-white font-bold">PAGES</h3>
                {pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`p-4 bg-matte-black border rounded-lg cursor-pointer transition-colors duration-300 ${
                      selectedPage?.id === page.id ? 'border-acid-yellow' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{page.path}</h4>
                      <span className={`text-sm font-bold ${getScoreColor(page.seoScore)}`}>
                        {page.seoScore}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{page.title}</p>
                    {page.issues.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span className="text-yellow-500 text-xs">{page.issues.length} issue(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Page Editor */}
              <div className="lg:col-span-2">
                {selectedPage ? (
                  <form onSubmit={handleUpdatePage} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">SEO Settings: {selectedPage.path}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">SEO Score:</span>
                        <span className={`text-lg font-bold ${getScoreColor(selectedPage.seoScore)}`}>
                          {selectedPage.seoScore}/100
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Page Title</label>
                      <input
                        name="title"
                        type="text"
                        defaultValue={selectedPage.title}
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        maxLength={60}
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedPage.title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        defaultValue={selectedPage.metaDescription}
                        rows={3}
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                        maxLength={160}
                      ></textarea>
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedPage.metaDescription.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Keywords</label>
                      <input
                        name="keywords"
                        type="text"
                        defaultValue={selectedPage.keywords.join(', ')}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Open Graph Image</label>
                        <input
                          name="ogImage"
                          type="url"
                          defaultValue={selectedPage.ogImage}
                          placeholder="https://example.com/image.jpg"
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Canonical URL</label>
                        <input
                          name="canonicalUrl"
                          type="url"
                          defaultValue={selectedPage.canonicalUrl}
                          placeholder="https://example.com/page"
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>

                    {selectedPage.issues.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="text-yellow-500 font-bold mb-2">SEO Issues</h4>
                        <ul className="space-y-1">
                          {selectedPage.issues.map((issue, index) => (
                            <li key={index} className="text-yellow-400 text-sm flex items-center space-x-2">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                    >
                      UPDATE SEO SETTINGS
                    </button>
                  </form>
                ) : (
                  <div className="bg-matte-black border border-gray-700 rounded-lg p-12 text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Select a Page</h3>
                    <p className="text-gray-400">Choose a page from the left to edit its SEO settings</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Schema Markup</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { type: 'LocalBusiness', description: 'Business information and location', implemented: true },
                  { type: 'Product', description: 'Vehicle listings and specifications', implemented: true },
                  { type: 'FAQ', description: 'Frequently asked questions', implemented: false },
                  { type: 'Review', description: 'Customer reviews and ratings', implemented: false },
                  { type: 'Service', description: 'Automotive services offered', implemented: false },
                  { type: 'Organization', description: 'Company information', implemented: true }
                ].map((schema) => (
                  <div key={schema.type} className="bg-matte-black border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold">{schema.type}</h4>
                      {schema.implemented ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{schema.description}</p>
                    <button className={`w-full py-2 rounded-sm font-medium transition-colors duration-300 ${
                      schema.implemented 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-acid-yellow text-black hover:bg-neon-lime'
                    }`}>
                      {schema.implemented ? 'CONFIGURED' : 'IMPLEMENT'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Image SEO Optimization</h3>
              
              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-4">Image Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-green-500">127</p>
                    <p className="text-gray-400 text-sm">Optimized Images</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-500">23</p>
                    <p className="text-gray-400 text-sm">Missing Alt Text</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-500">8</p>
                    <p className="text-gray-400 text-sm">Oversized Images</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">Image Issues</h4>
                {[
                  { image: 'bmw-m3-hero.jpg', issue: 'Missing alt text', severity: 'high' },
                  { image: 'service-bay.jpg', issue: 'File size too large (2.3MB)', severity: 'medium' },
                  { image: 'team-photo.jpg', issue: 'Missing title attribute', severity: 'low' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-sm"></div>
                      <div>
                        <p className="text-white font-medium">{item.image}</p>
                        <p className="text-gray-400 text-sm">{item.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                        item.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        item.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.severity.toUpperCase()}
                      </span>
                      <button className="bg-acid-yellow text-black px-3 py-1 rounded-sm text-sm font-medium hover:bg-neon-lime transition-colors duration-300">
                        FIX
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'redirects' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">URL Redirects</h3>
              
              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-4">Add New Redirect</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="From URL"
                    className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder="To URL"
                    className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                  <button className="bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300">
                    ADD REDIRECT
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { from: '/old-inventory', to: '/inventory', type: '301', hits: 45 },
                  { from: '/contact-us', to: '/contact', type: '301', hits: 23 },
                  { from: '/services/oil-change', to: '/services', type: '301', hits: 12 }
                ].map((redirect, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-matte-black border border-gray-700 rounded-sm">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <span className="text-white font-mono text-sm">{redirect.from}</span>
                      <span className="text-gray-400 font-mono text-sm">→ {redirect.to}</span>
                      <span className="text-gray-400 text-sm">{redirect.hits} hits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-sm">
                        {redirect.type}
                      </span>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Sitemap Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <h4 className="text-white font-bold mb-2">Pages Indexed</h4>
                  <p className="text-3xl font-bold text-acid-yellow">47</p>
                  <p className="text-gray-400 text-sm">of 52 pages</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <h4 className="text-white font-bold mb-2">Last Updated</h4>
                  <p className="text-white">2024-01-20</p>
                  <p className="text-gray-400 text-sm">3 days ago</p>
                </div>
                <div className="bg-matte-black border border-gray-700 rounded-lg p-6 text-center">
                  <h4 className="text-white font-bold mb-2">Status</h4>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">Healthy</span>
                  </div>
                </div>
              </div>

              <div className="bg-matte-black border border-gray-700 rounded-lg p-6">
                <h4 className="text-white font-bold mb-4">Sitemap URLs</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { url: '/', priority: '1.0', lastmod: '2024-01-20', changefreq: 'daily' },
                    { url: '/inventory', priority: '0.9', lastmod: '2024-01-19', changefreq: 'daily' },
                    { url: '/services', priority: '0.8', lastmod: '2024-01-15', changefreq: 'weekly' },
                    { url: '/contact', priority: '0.7', lastmod: '2024-01-10', changefreq: 'monthly' }
                  ].map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-graphite rounded-sm">
                      <span className="text-white font-mono text-sm">{url.url}</span>
                      <div className="flex space-x-4 text-xs text-gray-400">
                        <span>Priority: {url.priority}</span>
                        <span>Modified: {url.lastmod}</span>
                        <span>Frequency: {url.changefreq}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOManager;
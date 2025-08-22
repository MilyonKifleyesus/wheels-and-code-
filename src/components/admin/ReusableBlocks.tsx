import React, { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Eye, Settings, Grid, List } from 'lucide-react';
import Toast from '../ui/Toast';

interface BlockProp {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image';
  value: any;
  options?: string[];
}

interface ReusableBlock {
  id: string;
  name: string;
  category: 'content' | 'layout' | 'interactive' | 'media';
  description: string;
  thumbnail: string;
  props: BlockProp[];
  html: string;
  css: string;
  usageCount: number;
  lastUsed: string;
  tags: string[];
}

const ReusableBlocks: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ReusableBlock | null>(null);
  const [previewBlock, setPreviewBlock] = useState<ReusableBlock | null>(null);

  const [blocks, setBlocks] = useState<ReusableBlock[]>([
    {
      id: '1',
      name: 'FAQ Section',
      category: 'content',
      description: 'Expandable FAQ section with customizable questions and answers',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [
        { name: 'title', type: 'text', value: 'Frequently Asked Questions' },
        { name: 'accentColor', type: 'color', value: '#D7FF00' },
        { name: 'showSearch', type: 'boolean', value: true },
        { name: 'maxItems', type: 'number', value: 6 }
      ],
      html: '<div class="faq-section"><h2>{{title}}</h2><div class="faq-items">{{items}}</div></div>',
      css: '.faq-section { padding: 2rem; } .faq-item { margin-bottom: 1rem; }',
      usageCount: 12,
      lastUsed: '2024-01-18',
      tags: ['faq', 'content', 'interactive']
    },
    {
      id: '2',
      name: 'Team Grid',
      category: 'content',
      description: 'Team member showcase with photos and bios',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [
        { name: 'title', type: 'text', value: 'Our Team' },
        { name: 'columns', type: 'select', value: '3', options: ['2', '3', '4'] },
        { name: 'showBios', type: 'boolean', value: true },
        { name: 'backgroundColor', type: 'color', value: '#1A1B1E' }
      ],
      html: '<div class="team-grid"><h2>{{title}}</h2><div class="team-members">{{members}}</div></div>',
      css: '.team-grid { padding: 3rem; } .team-member { text-align: center; }',
      usageCount: 8,
      lastUsed: '2024-01-15',
      tags: ['team', 'people', 'grid']
    },
    {
      id: '3',
      name: 'Pricing Table',
      category: 'interactive',
      description: 'Responsive pricing table with feature comparison',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [
        { name: 'title', type: 'text', value: 'Service Packages' },
        { name: 'currency', type: 'select', value: 'CAD', options: ['CAD', 'USD', 'EUR'] },
        { name: 'highlightPlan', type: 'number', value: 2 },
        { name: 'showAnnualDiscount', type: 'boolean', value: true }
      ],
      html: '<div class="pricing-table"><h2>{{title}}</h2><div class="pricing-plans">{{plans}}</div></div>',
      css: '.pricing-table { padding: 2rem; } .pricing-plan { border: 1px solid #333; }',
      usageCount: 15,
      lastUsed: '2024-01-20',
      tags: ['pricing', 'table', 'comparison']
    },
    {
      id: '4',
      name: 'Timeline',
      category: 'content',
      description: 'Vertical timeline for company history or process steps',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [
        { name: 'title', type: 'text', value: 'Our Journey' },
        { name: 'orientation', type: 'select', value: 'vertical', options: ['vertical', 'horizontal'] },
        { name: 'accentColor', type: 'color', value: '#D7FF00' },
        { name: 'showDates', type: 'boolean', value: true }
      ],
      html: '<div class="timeline"><h2>{{title}}</h2><div class="timeline-items">{{items}}</div></div>',
      css: '.timeline { position: relative; } .timeline-item { margin-bottom: 2rem; }',
      usageCount: 5,
      lastUsed: '2024-01-12',
      tags: ['timeline', 'history', 'process']
    },
    {
      id: '5',
      name: 'Image Gallery',
      category: 'media',
      description: 'Responsive image gallery with lightbox and filtering',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [
        { name: 'title', type: 'text', value: 'Gallery' },
        { name: 'layout', type: 'select', value: 'masonry', options: ['grid', 'masonry', 'carousel'] },
        { name: 'showFilters', type: 'boolean', value: true },
        { name: 'itemsPerRow', type: 'number', value: 4 }
      ],
      html: '<div class="image-gallery"><h2>{{title}}</h2><div class="gallery-grid">{{images}}</div></div>',
      css: '.image-gallery { padding: 2rem; } .gallery-item { margin-bottom: 1rem; }',
      usageCount: 20,
      lastUsed: '2024-01-19',
      tags: ['gallery', 'images', 'lightbox']
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Blocks', count: blocks.length },
    { id: 'content', name: 'Content', count: blocks.filter(b => b.category === 'content').length },
    { id: 'layout', name: 'Layout', count: blocks.filter(b => b.category === 'layout').length },
    { id: 'interactive', name: 'Interactive', count: blocks.filter(b => b.category === 'interactive').length },
    { id: 'media', name: 'Media', count: blocks.filter(b => b.category === 'media').length }
  ];

  const filteredBlocks = blocks.filter(block => 
    selectedCategory === 'all' || block.category === selectedCategory
  );

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newBlock: ReusableBlock = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      category: formData.get('category') as ReusableBlock['category'],
      description: formData.get('description') as string,
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      props: [],
      html: formData.get('html') as string || '<div>{{content}}</div>',
      css: formData.get('css') as string || '',
      usageCount: 0,
      lastUsed: 'Never',
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setBlocks([newBlock, ...blocks]);
    setShowCreateForm(false);
    setToastMessage('Reusable block created successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const duplicateBlock = (block: ReusableBlock) => {
    const duplicated: ReusableBlock = {
      ...block,
      id: Date.now().toString(),
      name: `${block.name} (Copy)`,
      usageCount: 0,
      lastUsed: 'Never'
    };

    setBlocks([duplicated, ...blocks]);
    setToastMessage('Block duplicated successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const deleteBlock = (id: string) => {
    if (confirm('Are you sure you want to delete this block?')) {
      setBlocks(blocks.filter(b => b.id !== id));
      setToastMessage('Block deleted successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return '📝';
      case 'layout': return '📐';
      case 'interactive': return '⚡';
      case 'media': return '🖼️';
      default: return '📦';
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
          <h2 className="text-2xl font-bold text-white">Reusable Blocks</h2>
          <p className="text-gray-400 mt-1">Create and manage reusable content blocks with customizable properties</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex border border-gray-700 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors duration-300 ${
                viewMode === 'grid' ? 'bg-acid-yellow text-black' : 'bg-matte-black text-white hover:bg-gray-800'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors duration-300 ${
                viewMode === 'list' ? 'bg-acid-yellow text-black' : 'bg-matte-black text-white hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>CREATE BLOCK</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-acid-yellow text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>{category.id !== 'all' ? getCategoryIcon(category.id) : '📦'}</span>
              <span>{category.name}</span>
              <span className="text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blocks Display */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
        {filteredBlocks.map((block) => (
          <div key={block.id} className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors duration-300">
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-video bg-gray-800 relative">
                  <img
                    src={block.thumbnail}
                    alt={block.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-sm font-medium">
                      {getCategoryIcon(block.category)} {block.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => setPreviewBlock(block)}
                      className="p-1 bg-black/70 text-white rounded-sm hover:bg-black/90 transition-colors duration-300"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicateBlock(block)}
                      className="p-1 bg-black/70 text-white rounded-sm hover:bg-black/90 transition-colors duration-300"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-bold">{block.name}</h3>
                    <p className="text-gray-400 text-sm">{block.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {block.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Used {block.usageCount} times</p>
                    <p>Last used: {block.lastUsed}</p>
                    <p>{block.props.length} customizable props</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingBlock(block)}
                      className="flex-1 bg-white/10 text-white py-2 rounded-sm hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="bg-red-500/20 text-red-400 px-3 py-2 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-800 rounded-sm flex items-center justify-center text-2xl">
                  {getCategoryIcon(block.category)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{block.name}</h3>
                  <p className="text-gray-400 text-sm">{block.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span>Used {block.usageCount} times</span>
                    <span>Last: {block.lastUsed}</span>
                    <span>{block.props.length} props</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewBlock(block)}
                    className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingBlock(block)}
                    className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateBlock(block)}
                    className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Block Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE REUSABLE BLOCK</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Block Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <select
                  name="category"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="content">Content</option>
                  <option value="layout">Layout</option>
                  <option value="interactive">Interactive</option>
                  <option value="media">Media</option>
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Block Description"
                rows={2}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                required
              ></textarea>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">HTML Template</label>
                <textarea
                  name="html"
                  placeholder="<div class='custom-block'>{{content}}</div>"
                  rows={4}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none font-mono text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">CSS Styles</label>
                <textarea
                  name="css"
                  placeholder=".custom-block { padding: 2rem; }"
                  rows={3}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none font-mono text-sm"
                ></textarea>
              </div>

              <input
                name="tags"
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              />

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
                  CREATE BLOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewBlock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">PREVIEW: {previewBlock.name}</h3>
              <button
                onClick={() => setPreviewBlock(null)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-bold mb-4">CUSTOMIZABLE PROPERTIES</h4>
                <div className="space-y-4">
                  {previewBlock.props.map((prop) => (
                    <div key={prop.name} className="space-y-2">
                      <label className="block text-gray-400 text-sm font-medium capitalize">
                        {prop.name.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {prop.type === 'text' && (
                        <input
                          type="text"
                          defaultValue={prop.value}
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      )}
                      {prop.type === 'number' && (
                        <input
                          type="number"
                          defaultValue={prop.value}
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      )}
                      {prop.type === 'boolean' && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked={prop.value}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">Enable</span>
                        </label>
                      )}
                      {prop.type === 'select' && (
                        <select
                          defaultValue={prop.value}
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        >
                          {prop.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {prop.type === 'color' && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            defaultValue={prop.value}
                            className="w-12 h-12 bg-matte-black border border-gray-700 rounded-sm"
                          />
                          <input
                            type="text"
                            defaultValue={prop.value}
                            className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">LIVE PREVIEW</h4>
                <div className="bg-white rounded-lg p-6 min-h-64">
                  <div className="text-center text-gray-600">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
                      {getCategoryIcon(previewBlock.category)}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{previewBlock.name}</h3>
                    <p className="text-gray-500 mb-4">{previewBlock.description}</p>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        Interactive preview would render here with live prop updates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-bold mb-2">HTML Template</h4>
                  <pre className="bg-matte-black border border-gray-700 rounded-sm p-4 text-gray-300 text-sm overflow-x-auto">
                    <code>{previewBlock.html}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">CSS Styles</h4>
                  <pre className="bg-matte-black border border-gray-700 rounded-sm p-4 text-gray-300 text-sm overflow-x-auto">
                    <code>{previewBlock.css || '/* No custom styles */'}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableBlocks;
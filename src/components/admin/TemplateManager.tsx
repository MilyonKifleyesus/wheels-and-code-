import React, { useState, useEffect } from 'react';
import { Save, Copy, Trash2, Plus, Layout, Eye, Edit, Download, Upload, Grid, List, Loader2 } from 'lucide-react';
import Toast from '../ui/Toast';
import { supabase } from '../../lib/supabase';

// This interface should match the structure of the `templates` table
export interface Template {
  id: string;
  created_at: string;
  name: string;
  type: 'page' | 'section' | 'block';
  category: string;
  thumbnail?: string;
  sections?: any; // JSONB
  metadata?: any; // JSONB
  user_id: string;
}

const TemplateManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      setToastMessage('Failed to fetch templates.');
      setToastType('error');
      setShowToast(true);
    } else {
      setTemplates(data as Template[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'landing', name: 'Landing Pages' },
    { id: 'booking', name: 'Booking Forms' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'service', name: 'Service Pages' },
    { id: 'custom', name: 'Custom Blocks' }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setToastMessage('You must be logged in to create a template.');
        setToastType('error');
        setShowToast(true);
        return;
    }

    const newTemplateData = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'page' | 'section' | 'block',
      category: formData.get('category') as string,
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      sections: [],
      metadata: {
        description: formData.get('description') as string,
        tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
        lastUsed: 'Never',
        usageCount: 0
      },
      user_id: user.id,
    };

    const { error } = await supabase.from('templates').insert(newTemplateData);

    if (error) {
        console.error('Error creating template:', error);
        setToastMessage('Failed to create template.');
        setToastType('error');
    } else {
        setToastMessage('Template created successfully!');
        setToastType('success');
        setShowCreateForm(false);
        fetchTemplates(); // Refresh the list
    }
    setShowToast(true);
  };

  const handleDuplicateTemplate = async (template: Template) => {
    const { id, created_at, ...templateToCopy } = template;

    const duplicatedData = {
        ...templateToCopy,
        name: `${template.name} (Copy)`,
        metadata: {
            ...template.metadata,
            lastUsed: 'Never',
            usageCount: 0
        }
    };

    const { error } = await supabase.from('templates').insert(duplicatedData);

    if (error) {
        console.error('Error duplicating template:', error);
        setToastMessage('Failed to duplicate template.');
        setToastType('error');
    } else {
        setToastMessage('Template duplicated successfully!');
        setToastType('success');
        fetchTemplates(); // Refresh the list
    }
    setShowToast(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const { error } = await supabase.from('templates').delete().match({ id });

      if (error) {
        console.error('Error deleting template:', error);
        setToastMessage('Failed to delete template.');
        setToastType('error');
      } else {
        setToastMessage('Template deleted successfully!');
        setToastType('success');
        fetchTemplates(); // Refresh the list
      }
      setShowToast(true);
    }
  };

  const exportTemplate = (template: Template) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToastMessage('Template exported successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const importTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const template = JSON.parse(event.target?.result as string);
          template.id = Date.now().toString();
          setTemplates([...templates, template]);
          setToastMessage('Template imported successfully!');
          setToastType('success');
          setShowToast(true);
        } catch (error) {
          setToastMessage('Failed to import template. Invalid file format.');
          setToastType('error');
          setShowToast(true);
        }
      };
      reader.readAsText(file);
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
          <h2 className="text-2xl font-bold text-white">Template Manager</h2>
          <p className="text-gray-400 mt-1">Create and manage reusable page templates and content blocks</p>
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
          <input
            type="file"
            accept=".json"
            onChange={importTemplate}
            className="hidden"
            id="template-import"
          />
          <label
            htmlFor="template-import"
            className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>IMPORT</span>
          </label>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>CREATE TEMPLATE</span>
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
              className={`px-4 py-2 rounded-sm font-medium transition-colors duration-300 ${
                selectedCategory === category.id
                  ? 'bg-acid-yellow text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
            <Loader2 className="w-10 h-10 animate-spin text-acid-yellow" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors duration-300">
                <div className="aspect-video bg-gray-800 relative">
                <img
                    src={template.thumbnail || 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=No+Preview'}
                    alt={template.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-sm text-xs font-bold ${
                    template.type === 'page' ? 'bg-blue-500 text-white' :
                    template.type === 'section' ? 'bg-green-500 text-white' :
                    'bg-purple-500 text-white'
                    }`}>
                    {template.type.toUpperCase()}
                    </span>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                    onClick={() => exportTemplate(template)}
                    className="p-1 bg-black/50 text-white rounded-sm hover:bg-black/70 transition-colors duration-300"
                    >
                    <Download className="w-3 h-3" />
                    </button>
                    <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1 bg-black/50 text-white rounded-sm hover:bg-black/70 transition-colors duration-300"
                    >
                    <Copy className="w-3 h-3" />
                    </button>
                </div>
                </div>

                <div className="p-4 space-y-3">
                <div>
                    <h3 className="text-white font-bold">{template.name}</h3>
                    <p className="text-gray-400 text-sm">{template.metadata?.description || 'No description'}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                    {template.metadata?.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-sm">
                        {tag}
                    </span>
                    ))}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                    <p>Used {template.metadata?.usageCount || 0} times</p>
                    <p>Last used: {template.metadata?.lastUsed || 'Never'}</p>
                </div>

                <div className="flex space-x-2">
                    <button className="flex-1 bg-white/10 text-white py-2 rounded-sm hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>PREVIEW</span>
                    </button>
                    <button
                    onClick={() => setEditingTemplate(template)}
                    className="flex-1 bg-white/10 text-white py-2 rounded-sm hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1"
                    >
                    <Edit className="w-4 h-4" />
                    <span>EDIT</span>
                    </button>
                    <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-500/20 text-red-400 px-3 py-2 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">CREATE NEW TEMPLATE</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Template Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <select
                  name="type"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="page">Full Page</option>
                  <option value="section">Section</option>
                  <option value="block">Content Block</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="category"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="landing">Landing Pages</option>
                  <option value="booking">Booking Forms</option>
                  <option value="inventory">Inventory</option>
                  <option value="service">Service Pages</option>
                  <option value="custom">Custom Blocks</option>
                </select>
                <input
                  name="tags"
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <textarea
                name="description"
                placeholder="Template Description"
                rows={3}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                required
              ></textarea>

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
                  CREATE TEMPLATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
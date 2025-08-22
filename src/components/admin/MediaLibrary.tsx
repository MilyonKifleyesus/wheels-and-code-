import React, { useState } from 'react';
import { Upload, Search, Filter, Grid, List, Trash2, Edit, Download, Tag, Image, Video, FileText } from 'lucide-react';
import Toast from '../ui/Toast';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail: string;
  size: number;
  dimensions?: { width: number; height: number };
  altText: string;
  tags: string[];
  album: string;
  uploadDate: string;
  lastModified: string;
  metadata: {
    description: string;
    license: string;
    expiryDate?: string;
    seoTitle: string;
    seoDescription: string;
  };
}

const MediaLibrary: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);

  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: '1',
      name: 'bmw-m3-hero.jpg',
      type: 'image',
      url: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      size: 2048576,
      dimensions: { width: 1920, height: 1080 },
      altText: 'BMW M3 luxury sedan in showroom',
      tags: ['bmw', 'luxury', 'sedan', 'hero'],
      album: 'vehicle-photos',
      uploadDate: '2024-01-15',
      lastModified: '2024-01-15',
      metadata: {
        description: 'Hero image for BMW M3 vehicle listing',
        license: 'Commercial Use',
        seoTitle: 'BMW M3 Luxury Sedan - Premium Automotive',
        seoDescription: 'High-quality BMW M3 sedan showcasing luxury automotive excellence'
      }
    },
    {
      id: '2',
      name: 'service-bay.jpg',
      type: 'image',
      url: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
      thumbnail: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      size: 1536000,
      dimensions: { width: 1600, height: 900 },
      altText: 'Professional automotive service bay with modern equipment',
      tags: ['service', 'workshop', 'professional'],
      album: 'service-photos',
      uploadDate: '2024-01-12',
      lastModified: '2024-01-12',
      metadata: {
        description: 'Modern service bay showcasing professional equipment',
        license: 'Commercial Use',
        seoTitle: 'Professional Automotive Service Bay',
        seoDescription: 'State-of-the-art automotive service facility with modern equipment'
      }
    }
  ]);

  const albums = [
    { id: 'all', name: 'All Media', count: assets.length },
    { id: 'vehicle-photos', name: 'Vehicle Photos', count: assets.filter(a => a.album === 'vehicle-photos').length },
    { id: 'service-photos', name: 'Service Photos', count: assets.filter(a => a.album === 'service-photos').length },
    { id: 'promotional', name: 'Promotional', count: assets.filter(a => a.album === 'promotional').length },
    { id: 'documents', name: 'Documents', count: assets.filter(a => a.type === 'document').length }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.altText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAlbum = selectedAlbum === 'all' || asset.album === selectedAlbum;
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    
    return matchesSearch && matchesAlbum && matchesType;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newAsset: MediaAsset = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
          url: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file),
          size: file.size,
          altText: '',
          tags: [],
          album: 'vehicle-photos',
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          metadata: {
            description: '',
            license: 'Commercial Use',
            seoTitle: '',
            seoDescription: ''
          }
        };
        
        setAssets(prev => [newAsset, ...prev]);
      });
      
      setToastMessage(`${files.length} file(s) uploaded successfully!`);
      setToastType('success');
      setShowToast(true);
      setShowUploadModal(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedAssets.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedAssets.length} selected asset(s)?`)) {
      setAssets(assets.filter(asset => !selectedAssets.includes(asset.id)));
      setSelectedAssets([]);
      setToastMessage(`${selectedAssets.length} asset(s) deleted successfully!`);
      setToastType('success');
      setShowToast(true);
    }
  };

  const handleAssetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const updatedAsset: MediaAsset = {
      ...editingAsset,
      altText: formData.get('altText') as string,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      album: formData.get('album') as string,
      metadata: {
        ...editingAsset.metadata,
        description: formData.get('description') as string,
        license: formData.get('license') as string,
        seoTitle: formData.get('seoTitle') as string,
        seoDescription: formData.get('seoDescription') as string
      }
    };

    setAssets(assets.map(asset => asset.id === editingAsset.id ? updatedAsset : asset));
    setEditingAsset(null);
    setToastMessage('Asset updated successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <p className="text-gray-400 mt-1">Manage your media assets with advanced organization and optimization</p>
        </div>
        <div className="flex space-x-3">
          {selectedAssets.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>DELETE ({selectedAssets.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>UPLOAD MEDIA</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, alt text, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-matte-black border border-gray-700 text-white rounded-sm pl-12 pr-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
            />
          </div>
          
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            {albums.map(album => (
              <option key={album.id} value={album.id}>
                {album.name} ({album.count})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>

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
        </div>

        <div className="text-sm text-gray-400">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </div>

      {/* Media Grid/List */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}`}>
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className={`bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors duration-300 ${
              selectedAssets.includes(asset.id) ? 'border-acid-yellow' : ''
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-square bg-gray-800 relative">
                  <img
                    src={asset.thumbnail}
                    alt={asset.altText}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <div className="p-1 bg-black/50 rounded-sm text-white">
                      {getFileIcon(asset.type)}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets([...selectedAssets, asset.id]);
                        } else {
                          setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-white font-medium text-sm truncate">{asset.name}</h4>
                  <p className="text-gray-400 text-xs">{formatFileSize(asset.size)}</p>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingAsset(asset)}
                      className="flex-1 bg-white/10 text-white py-1 rounded-sm text-xs hover:bg-white/20 transition-colors duration-300"
                    >
                      EDIT
                    </button>
                    <button className="bg-white/10 text-white px-2 py-1 rounded-sm text-xs hover:bg-white/20 transition-colors duration-300">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAssets([...selectedAssets, asset.id]);
                    } else {
                      setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                    }
                  }}
                  className="w-4 h-4"
                />
                <div className="w-12 h-12 bg-gray-800 rounded-sm flex items-center justify-center">
                  {getFileIcon(asset.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{asset.name}</h4>
                  <p className="text-gray-400 text-sm">{asset.altText}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(asset.size)}</span>
                    <span>{asset.uploadDate}</span>
                    <span>{asset.tags.length} tags</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">UPLOAD MEDIA</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-acid-yellow transition-colors duration-300">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Drag & drop files here or click to browse</p>
                <p className="text-gray-500 text-sm">Supports: JPG, PNG, GIF, MP4, PDF (Max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-block bg-acid-yellow text-black px-6 py-2 rounded-sm font-medium cursor-pointer hover:bg-neon-lime transition-colors duration-300"
                >
                  CHOOSE FILES
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                  <option value="vehicle-photos">Vehicle Photos</option>
                  <option value="service-photos">Service Photos</option>
                  <option value="promotional">Promotional</option>
                  <option value="documents">Documents</option>
                </select>
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">EDIT ASSET</h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssetUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Alt Text</label>
                  <input
                    name="altText"
                    type="text"
                    defaultValue={editingAsset.altText}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Album</label>
                  <select
                    name="album"
                    defaultValue={editingAsset.album}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  >
                    <option value="vehicle-photos">Vehicle Photos</option>
                    <option value="service-photos">Service Photos</option>
                    <option value="promotional">Promotional</option>
                    <option value="documents">Documents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Tags</label>
                <input
                  name="tags"
                  type="text"
                  defaultValue={editingAsset.tags.join(', ')}
                  placeholder="luxury, bmw, sedan, hero"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingAsset.metadata.description}
                  rows={3}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">SEO Title</label>
                  <input
                    name="seoTitle"
                    type="text"
                    defaultValue={editingAsset.metadata.seoTitle}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">License</label>
                  <select
                    name="license"
                    defaultValue={editingAsset.metadata.license}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  >
                    <option value="Commercial Use">Commercial Use</option>
                    <option value="Editorial Use">Editorial Use</option>
                    <option value="Personal Use">Personal Use</option>
                    <option value="Rights Managed">Rights Managed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">SEO Description</label>
                <textarea
                  name="seoDescription"
                  defaultValue={editingAsset.metadata.seoDescription}
                  rows={2}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                ></textarea>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
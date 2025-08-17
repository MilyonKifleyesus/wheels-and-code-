import React, { useState } from 'react';
import { Save, Eye, Edit, Trash2, Plus, Image, Type, Layout, Upload, Palette, Settings } from 'lucide-react';
import Toast from '../ui/Toast';
import { useContent, ContentSection } from '../../contexts/ContentContext';

const ContentManager: React.FC = () => {
  const { 
    sections, 
    updateSection, 
    updateSectionContent, 
    toggleSectionVisibility, 
    reorderSections, 
    addSection, 
    deleteSection 
  } = useContent();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && sectionIndex > 0) ||
      (direction === 'down' && sectionIndex < sections.length - 1)
    ) {
      const newSections = [...sections];
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
      
      reorderSections(newSections);
      setToastMessage('Section order updated successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const handleUpdateSectionContent = (sectionId: string, updates: Partial<ContentSection['content']>) => {
    updateSectionContent(sectionId, updates);
    
    // Update selectedSection if it's the one being edited
    if (selectedSection && selectedSection.id === sectionId) {
      setSelectedSection(prev => ({
        ...prev!,
        content: { ...prev!.content, ...updates }
      }));
    }
    
    setToastMessage('Content updated successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handleAddNewSection = () => {
    const newSection: Omit<ContentSection, 'id'> = {
      type: 'about',
      title: 'New Section',
      visible: true,
      order: sections.length + 1,
      content: {
        heading: 'New Section',
        description: 'Add your content here',
        backgroundColor: '#0B0B0C',
        textColor: '#FFFFFF',
        accentColor: '#D7FF00'
      }
    };
    addSection(newSection);
    setToastMessage('New section added successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteSection(id);
      if (selectedSection?.id === id) {
        setSelectedSection(null);
      }
      setToastMessage('Section deleted successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const handleToggleVisibility = (id: string) => {
    toggleSectionVisibility(id);
    setToastMessage('Section visibility updated successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const saveAllChanges = () => {
    setToastMessage('All changes saved successfully! Website updated.');
    setToastType('success');
    setShowToast(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setToastMessage('Image upload feature would be implemented with cloud storage');
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
          <h2 className="text-2xl font-bold text-white">Website Builder</h2>
          <p className="text-gray-400 mt-1">Customize your website content and appearance</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'EDIT MODE' : 'PREVIEW'}</span>
          </button>
          <button 
            onClick={saveAllChanges}
            className="bg-acid-yellow text-black px-4 py-2 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>PUBLISH CHANGES</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold tracking-wider">PAGE SECTIONS</h3>
            <button
              onClick={handleAddNewSection}
              className="bg-white/10 text-white p-2 rounded-sm hover:bg-white/20 transition-colors duration-300"
              title="Add Section"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`bg-dark-graphite border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                  selectedSection?.id === section.id ? 'border-acid-yellow' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedSection(section)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{section.title}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, 'up');
                      }}
                      className="text-gray-400 hover:text-white text-xs"
                      disabled={section.order === 1}
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, 'down');
                      }}
                      className="text-gray-400 hover:text-white text-xs"
                      disabled={section.order === sections.length}
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${section.visible ? 'text-green-400' : 'text-red-400'}`}>
                    {section.visible ? 'Visible' : 'Hidden'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(section.id);
                    }}
                    className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors duration-300 ${
                      section.visible 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {section.visible ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Editor */}
        <div className="lg:col-span-2">
          {selectedSection ? (
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit: {selectedSection.title}</h3>
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                    <Layout className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                    <Type className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300">
                    <Palette className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Section Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Section Title</label>
                    <input
                      type="text"
                      value={selectedSection.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setSelectedSection(prev => ({ ...prev!, title: newTitle }));
                        updateSection(selectedSection.id, { title: newTitle });
                      }}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Section Type</label>
                    <select 
                      value={selectedSection.type}
                      onChange={(e) => {
                        const newType = e.target.value as ContentSection['type'];
                        setSelectedSection(prev => ({ ...prev!, type: newType }));
                        updateSection(selectedSection.id, { type: newType });
                      }}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    >
                      <option value="hero">Hero Section</option>
                      <option value="services">Services</option>
                      <option value="inventory">Inventory</option>
                      <option value="testimonials">Testimonials</option>
                      <option value="contact">Contact</option>
                      <option value="about">About</option>
                      <option value="finance">Finance</option>
                      <option value="trust">Trust</option>
                      <option value="promo">Promo</option>
                      <option value="map">Map</option>
                    </select>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Heading</label>
                    <input
                      type="text"
                      value={selectedSection.content.heading || ''}
                      onChange={(e) => {
                        const newHeading = e.target.value;
                        handleUpdateSectionContent(selectedSection.id, { heading: newHeading });
                      }}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      placeholder="Section heading"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Subheading</label>
                    <input
                      type="text"
                      value={selectedSection.content.subheading || ''}
                      onChange={(e) => {
                        const newSubheading = e.target.value;
                        handleUpdateSectionContent(selectedSection.id, { subheading: newSubheading });
                      }}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      placeholder="Section subheading"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={selectedSection.content.description || ''}
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        handleUpdateSectionContent(selectedSection.id, { description: newDescription });
                      }}
                      rows={3}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                      placeholder="Section description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Button Text</label>
                      <input
                        type="text"
                        value={selectedSection.content.buttonText || ''}
                        onChange={(e) => handleUpdateSectionContent(selectedSection.id, { buttonText: e.target.value })}
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        placeholder="Button text"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Button Link</label>
                      <input
                        type="text"
                        value={selectedSection.content.buttonLink || ''}
                        onChange={(e) => handleUpdateSectionContent(selectedSection.id, { buttonLink: e.target.value })}
                        className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        placeholder="/page-url"
                      />
                    </div>
                  </div>
                </div>

                {/* Style Controls */}
                <div className="border-t border-gray-800 pt-6">
                  <h4 className="text-white font-bold mb-4">STYLING OPTIONS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Background Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedSection.content.backgroundColor || '#0B0B0C'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { backgroundColor: e.target.value })}
                          className="w-12 h-10 bg-matte-black border border-gray-700 rounded-sm"
                        />
                        <input
                          type="text"
                          value={selectedSection.content.backgroundColor || '#0B0B0C'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Text Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedSection.content.textColor || '#FFFFFF'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { textColor: e.target.value })}
                          className="w-12 h-10 bg-matte-black border border-gray-700 rounded-sm"
                        />
                        <input
                          type="text"
                          value={selectedSection.content.textColor || '#FFFFFF'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { textColor: e.target.value })}
                          className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Accent Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedSection.content.accentColor || '#D7FF00'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { accentColor: e.target.value })}
                          className="w-12 h-10 bg-matte-black border border-gray-700 rounded-sm"
                        />
                        <input
                          type="text"
                          value={selectedSection.content.accentColor || '#D7FF00'}
                          onChange={(e) => handleUpdateSectionContent(selectedSection.id, { accentColor: e.target.value })}
                          className="flex-1 bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Image Upload */}
                <div className="border-t border-gray-800 pt-6">
                  <h4 className="text-white font-bold mb-4">BACKGROUND IMAGE</h4>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-acid-yellow transition-colors duration-300">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Upload background image</p>
                    <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="bg-image-upload"
                    />
                    <label
                      htmlFor="bg-image-upload"
                      className="mt-4 inline-block bg-acid-yellow text-black px-4 py-2 rounded-sm font-medium cursor-pointer hover:bg-neon-lime transition-colors duration-300"
                    >
                      CHOOSE FILE
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t border-gray-800 pt-6">
                  <h4 className="text-white font-bold mb-4">PREVIEW</h4>
                  <div 
                    className="p-8 rounded-lg border border-gray-700"
                    style={{ 
                      backgroundColor: selectedSection.content.backgroundColor || '#0B0B0C',
                      color: selectedSection.content.textColor || '#FFFFFF'
                    }}
                  >
                    <h2 className="text-2xl font-bold mb-2" style={{ color: selectedSection.content.accentColor || '#D7FF00' }}>
                      {selectedSection.content.heading || 'Section Heading'}
                    </h2>
                    {selectedSection.content.subheading && (
                      <h3 className="text-lg mb-4">{selectedSection.content.subheading}</h3>
                    )}
                    <p className="mb-4">{selectedSection.content.description || 'Section description'}</p>
                    {selectedSection.content.buttonText && (
                      <button 
                        className="px-6 py-2 rounded-sm font-bold"
                        style={{ 
                          backgroundColor: selectedSection.content.accentColor || '#D7FF00',
                          color: '#000000'
                        }}
                      >
                        {selectedSection.content.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-12 text-center">
              <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Select a Section to Edit</h3>
              <p className="text-gray-400">Choose a section from the left panel to customize its content and appearance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
import React, { useState, useEffect } from 'react';
import { Save, Eye, Edit, Trash2, Plus, Image, Type, Layout, Upload, Palette, Settings, Loader2 } from 'lucide-react';
import Toast from '../ui/Toast';
import { useContent, ContentSection } from '../../contexts/ContentContext';
import { useDebounce } from '../../hooks/useDebounce';

const ContentManager: React.FC = () => {
  const { 
    sections, 
    loading,
    updateSection, 
    reorderSections, 
    addSection, 
    deleteSection,
    toggleSectionVisibility
  } = useContent();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  // Local state for the editor form
  const [editorState, setEditorState] = useState<ContentSection | null>(null);

  // Debounce the editor state to avoid excessive updates
  const debouncedEditorState = useDebounce(editorState, 1000);

  // Effect to update the database when the debounced state changes
  useEffect(() => {
    if (debouncedEditorState && selectedSection && JSON.stringify(debouncedEditorState) !== JSON.stringify(selectedSection)) {
      const { id, created_at, updated_at, ...updates } = debouncedEditorState;
      handleUpdateSection(id, updates);
    }
  }, [debouncedEditorState]);


  // When the global selectedSection changes, update the local editor state
  useEffect(() => {
    if (selectedSection) {
      setEditorState(JSON.parse(JSON.stringify(selectedSection))); // Deep copy
    } else {
      setEditorState(null);
    }
  }, [selectedSection]);

  // When the global sections data is refreshed, update our selected section and editor
  useEffect(() => {
    if (selectedSection) {
      const updatedSelected = sections.find(s => s.id === selectedSection.id);
      setSelectedSection(updatedSelected || null);
    }
  }, [sections]);

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const moveSection = async (id: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && sectionIndex > 0) ||
      (direction === 'down' && sectionIndex < sections.length - 1)
    ) {
      const newSections = [...sections];
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
      
      setIsSubmitting('reorder');
      const { success, error } = await reorderSections(newSections);
      if (success) {
        showToastMessage('Section order updated!', 'success');
      } else {
        showToastMessage(`Error: ${error}`, 'error');
      }
      setIsSubmitting(null);
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: Partial<Omit<ContentSection, 'id'>>) => {
    setIsSubmitting(`update-${sectionId}`);
    const { success, error } = await updateSection(sectionId, updates);
     if (!success) {
      showToastMessage(`Error updating: ${error}`, 'error');
    }
    setIsSubmitting(null);
  };

  const handleAddNewSection = async () => {
    const newSectionData: Omit<ContentSection, 'id' | 'created_at' | 'updated_at'> = {
      type: 'promo',
      title: 'New Section',
      visible: true,
      sort_order: sections.length + 1,
      content: {
        heading: 'A Fresh New Section',
        description: 'Start by editing this content.',
        backgroundColor: '#1A1B1E',
        textColor: '#FFFFFF',
        accentColor: '#D7FF00'
      }
    };
    setIsSubmitting('add');
    const { success, error } = await addSection(newSectionData);
    if (success) {
      showToastMessage('New section added successfully!', 'success');
    } else {
      showToastMessage(`Error: ${error}`, 'error');
    }
    setIsSubmitting(null);
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm('Are you sure you want to delete this section? This cannot be undone.')) {
      setIsSubmitting(`delete-${id}`);
      const { success, error } = await deleteSection(id);
      if (success) {
        if (selectedSection?.id === id) {
          setSelectedSection(null);
        }
        showToastMessage('Section deleted successfully!', 'success');
      } else {
        showToastMessage(`Error: ${error}`, 'error');
      }
      setIsSubmitting(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    setIsSubmitting(`visibility-${id}`);
    const { success, error } = await toggleSectionVisibility(id, !currentVisibility);
    if (success) {
      showToastMessage('Visibility updated!', 'success');
    } else {
      showToastMessage(`Error: ${error}`, 'error');
    }
    setIsSubmitting(null);
  };

  const handleEditorChange = (field: keyof Omit<ContentSection, 'id' | 'content'>, value: any) => {
    if (editorState) {
        setEditorState({ ...editorState, [field]: value });
    }
  };

  const handleContentChange = (field: string, value: any) => {
      if(editorState) {
          setEditorState({ ...editorState, content: { ...editorState.content, [field]: value } });
      }
  }

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
          <p className="text-gray-400 mt-1">Changes are saved automatically after you stop typing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold tracking-wider">PAGE SECTIONS</h3>
            <button
              onClick={handleAddNewSection}
              disabled={isSubmitting === 'add'}
              className="bg-white/10 text-white p-2 rounded-sm hover:bg-white/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add Section"
            >
              {isSubmitting === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {(loading && sections.length === 0) && <p className="text-gray-400">Loading sections...</p>}
            {sections.map((section, index) => (
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
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} className="text-gray-400 hover:text-white text-xs disabled:opacity-50" disabled={index === 0 || !!isSubmitting}> ↑ </button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} className="text-gray-400 hover:text-white text-xs disabled:opacity-50" disabled={index === sections.length - 1 || !!isSubmitting}> ↓ </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} className="text-red-400 hover:text-red-300 disabled:opacity-50" disabled={isSubmitting === `delete-${section.id}`}>
                      {isSubmitting === `delete-${section.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${section.visible ? 'text-green-400' : 'text-red-400'}`}> {section.visible ? 'Visible' : 'Hidden'} </span>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(section.id, section.visible); }} className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors duration-300 w-16 h-7 flex items-center justify-center disabled:opacity-50 ${ section.visible ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700' }`} disabled={isSubmitting === `visibility-${section.id}`}>
                    {isSubmitting === `visibility-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : (section.visible ? 'HIDE' : 'SHOW')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Editor */}
        <div className="lg:col-span-2">
          {editorState ? (
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit: {editorState.title}</h3>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Section Title</label>
                    <input type="text" value={editorState.title} onChange={(e) => handleEditorChange('title', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Section Type</label>
                    <select value={editorState.type} onChange={(e) => handleEditorChange('type', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Heading</label>
                    <input type="text" value={editorState.content.heading || ''} onChange={(e) => handleContentChange('heading', e.target.value)} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                    <textarea value={editorState.content.description || ''} onChange={(e) => handleContentChange('description', e.target.value)} rows={3} className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"></textarea>
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
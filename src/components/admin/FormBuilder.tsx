import React, { useState } from 'react';
import { Plus, Trash2, Edit, Eye, Save, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import Toast from '../ui/Toast';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    showWhen: string;
    equals: string;
  };
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  settings: {
    multiStep: boolean;
    allowFileUploads: boolean;
    requireSignature: boolean;
    emailNotifications: boolean;
    autoResponder: boolean;
    redirectUrl?: string;
  };
  automation: {
    createTicket: boolean;
    sendSMS: boolean;
    webhookUrl?: string;
    slackChannel?: string;
  };
}

const FormBuilder: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  const [forms, setForms] = useState<FormTemplate[]>([
    {
      id: '1',
      name: 'Service Booking Form',
      description: 'Multi-step service booking with vehicle details and scheduling',
      fields: [
        {
          id: '1',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true
        },
        {
          id: '2',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your@email.com',
          required: true
        },
        {
          id: '3',
          type: 'phone',
          label: 'Phone Number',
          placeholder: '(555) 123-4567',
          required: true
        },
        {
          id: '4',
          type: 'select',
          label: 'Service Type',
          required: true,
          options: ['Oil Change', 'Brake Service', 'Engine Diagnostics', 'Performance Tune']
        },
        {
          id: '5',
          type: 'text',
          label: 'Vehicle Information',
          placeholder: 'Year Make Model',
          required: true
        },
        {
          id: '6',
          type: 'date',
          label: 'Preferred Date',
          required: true
        },
        {
          id: '7',
          type: 'textarea',
          label: 'Additional Notes',
          placeholder: 'Any specific requirements or concerns...',
          required: false
        }
      ],
      settings: {
        multiStep: true,
        allowFileUploads: false,
        requireSignature: false,
        emailNotifications: true,
        autoResponder: true,
        redirectUrl: '/booking-confirmation'
      },
      automation: {
        createTicket: true,
        sendSMS: true,
        webhookUrl: 'https://api.company.com/webhooks/booking',
        slackChannel: '#bookings'
      }
    }
  ]);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'phone', label: 'Phone', icon: '📞' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'date', label: 'Date Picker', icon: '📅' },
    { type: 'time', label: 'Time Picker', icon: '🕐' }
  ];

  const addField = (type: FormField['type']) => {
    if (!selectedForm) return;

    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} Field`,
      required: false
    };

    const updatedForm = {
      ...selectedForm,
      fields: [...selectedForm.fields, newField]
    };

    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
    setSelectedForm(updatedForm);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!selectedForm) return;

    const updatedForm = {
      ...selectedForm,
      fields: selectedForm.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    };

    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
    setSelectedForm(updatedForm);
  };

  const deleteField = (fieldId: string) => {
    if (!selectedForm) return;

    const updatedForm = {
      ...selectedForm,
      fields: selectedForm.fields.filter(field => field.id !== fieldId)
    };

    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
    setSelectedForm(updatedForm);
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    if (!selectedForm) return;

    const fields = [...selectedForm.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }

    const updatedForm = { ...selectedForm, fields };
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
    setSelectedForm(updatedForm);
  };

  const renderFieldPreview = (field: FormField) => {
    const baseClasses = "w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            className={`${baseClasses} resize-none`}
            rows={3}
            disabled
          />
        );
      case 'select':
        return (
          <select className={baseClasses} disabled>
            <option>Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4" disabled />
            <span className="text-white">{field.label}</span>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name={field.id} className="w-4 h-4" disabled />
                <span className="text-white">{option}</span>
              </div>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-700 rounded-sm p-4 text-center">
            <p className="text-gray-400">Click to upload or drag & drop</p>
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className={baseClasses}
            disabled
          />
        );
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
          <h2 className="text-2xl font-bold text-white">Form Builder</h2>
          <p className="text-gray-400 mt-1">Create and customize forms with drag-and-drop interface</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'EDIT' : 'PREVIEW'}</span>
          </button>
          <button
            onClick={() => {
              setToastMessage('Form saved successfully!');
              setToastType('success');
              setShowToast(true);
            }}
            className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>SAVE FORM</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form List */}
        <div className="space-y-4">
          <h3 className="text-white font-bold">FORMS</h3>
          {forms.map((form) => (
            <div
              key={form.id}
              onClick={() => setSelectedForm(form)}
              className={`p-4 bg-dark-graphite border rounded-lg cursor-pointer transition-colors duration-300 ${
                selectedForm?.id === form.id ? 'border-acid-yellow' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <h4 className="text-white font-medium">{form.name}</h4>
              <p className="text-gray-400 text-sm mt-1">{form.description}</p>
              <p className="text-gray-500 text-xs mt-2">{form.fields.length} fields</p>
            </div>
          ))}
        </div>

        {/* Field Types */}
        <div className="space-y-4">
          <h3 className="text-white font-bold">FIELD TYPES</h3>
          <div className="space-y-2">
            {fieldTypes.map((fieldType) => (
              <button
                key={fieldType.type}
                onClick={() => addField(fieldType.type as FormField['type'])}
                disabled={!selectedForm}
                className="w-full p-3 bg-matte-black border border-gray-700 text-white rounded-sm hover:border-acid-yellow transition-colors duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">{fieldType.icon}</span>
                <span className="text-sm">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2">
          {selectedForm ? (
            <div className="space-y-6">
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {previewMode ? 'FORM PREVIEW' : 'FORM BUILDER'}
                </h3>
                
                {!previewMode ? (
                  <div className="space-y-4">
                    {selectedForm.fields.map((field, index) => (
                      <div key={field.id} className="bg-matte-black border border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm">#{index + 1}</span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                            />
                            <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                              field.required ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {field.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => moveField(field.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveField(field.id, 'down')}
                              disabled={index === selectedForm.fields.length - 1}
                              className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteField(field.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Placeholder text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                            className="bg-dark-graphite border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                          >
                            {fieldTypes.map(type => (
                              <option key={type.type} value={type.type}>{type.label}</option>
                            ))}
                          </select>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-white text-sm">Required</span>
                          </label>
                        </div>

                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="mt-3">
                            <label className="block text-gray-400 text-sm mb-2">Options (one per line)</label>
                            <textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                              rows={3}
                              className="w-full bg-dark-graphite border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-2xl font-bold text-white mb-6">{selectedForm.name}</h4>
                    {selectedForm.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-gray-400 text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {renderFieldPreview(field)}
                      </div>
                    ))}
                    <button className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300">
                      SUBMIT FORM
                    </button>
                  </div>
                )}
              </div>

              {/* Form Settings */}
              {!previewMode && (
                <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-4">FORM SETTINGS</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="text-gray-300 font-medium">Display Options</h5>
                      {[
                        { key: 'multiStep', label: 'Multi-step Form' },
                        { key: 'allowFileUploads', label: 'Allow File Uploads' },
                        { key: 'requireSignature', label: 'Require Signature' },
                        { key: 'emailNotifications', label: 'Email Notifications' },
                        { key: 'autoResponder', label: 'Auto-responder' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedForm.settings[setting.key as keyof typeof selectedForm.settings] as boolean}
                            onChange={(e) => {
                              const updatedForm = {
                                ...selectedForm,
                                settings: {
                                  ...selectedForm.settings,
                                  [setting.key]: e.target.checked
                                }
                              };
                              setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
                              setSelectedForm(updatedForm);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">{setting.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-gray-300 font-medium">Automation</h5>
                      {[
                        { key: 'createTicket', label: 'Create Support Ticket' },
                        { key: 'sendSMS', label: 'Send SMS Confirmation' }
                      ].map((automation) => (
                        <label key={automation.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedForm.automation[automation.key as keyof typeof selectedForm.automation] as boolean}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">{automation.label}</span>
                        </label>
                      ))}
                      
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={selectedForm.automation.webhookUrl || ''}
                          placeholder="https://api.company.com/webhooks"
                          className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-3 py-2 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-12 text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Select a Form to Edit</h3>
              <p className="text-gray-400">Choose a form from the left panel to start building</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
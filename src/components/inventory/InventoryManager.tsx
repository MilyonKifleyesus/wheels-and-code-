import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, Eye } from 'lucide-react';
import Toast from '../ui/Toast';
import { useVehicles, Vehicle } from '../../contexts/VehicleContext';

const InventoryManager: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleDelete = (id: number) => {
    deleteVehicle(id);
    setToastMessage('Vehicle deleted successfully');
    setToastType('success');
    setShowToast(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedImages(prev => [...prev, ...fileArray]);
      
      // Create preview URLs
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviewUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Validate required fields
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const year = formData.get('year') as string;
    const price = formData.get('price') as string;
    const mileage = formData.get('mileage') as string;
    const status = formData.get('status') as string;

    if (!make || !model || !year || !price || !mileage || !status) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const vehicleData = {
      make,
      model,
      year: parseInt(year),
      price: parseInt(price),
      mileage: parseInt(mileage),
      status: status as 'available' | 'sold' | 'reserved',
      images: imagePreviewUrls.length > 0 ? imagePreviewUrls : ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400']
    };

    if (editingVehicle) {
      // Update existing vehicle
      updateVehicle(editingVehicle.id, vehicleData);
      setToastMessage('Vehicle updated successfully');
    } else {
      // Add new vehicle
      addVehicle(vehicleData);
      setToastMessage('Vehicle added successfully');
    }
    
    setToastType('success');
    setShowToast(true);
    
    // Reset form
    setShowAddForm(false);
    setEditingVehicle(null);
    setSelectedImages([]);
    setImagePreviewUrls([]);
    } catch (error) {
      setToastMessage('Failed to save vehicle. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const closeModal = () => {
    setShowAddForm(false);
    setEditingVehicle(null);
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-500';
      case 'sold': return 'text-red-500';
      case 'reserved': return 'text-acid-yellow';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Vehicle Inventory</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>ADD VEHICLE</span>
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-800">
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-white font-bold">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-gray-400">{vehicle.mileage.toLocaleString()} km</p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-acid-yellow font-bold text-lg">
                  ${vehicle.price.toLocaleString()} CAD
                </span>
                <span className={`text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-white/10 text-white py-2 rounded-sm hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>VIEW</span>
                </button>
                <button
                  onClick={() => setEditingVehicle(vehicle)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-sm hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="bg-red-500/20 text-red-400 px-3 py-2 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingVehicle) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingVehicle ? 'EDIT VEHICLE' : 'ADD NEW VEHICLE'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="make"
                  type="text"
                  placeholder="Make"
                  defaultValue={editingVehicle?.make}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="model"
                  type="text"
                  placeholder="Model"
                  defaultValue={editingVehicle?.model}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="year"
                  type="number"
                  placeholder="Year"
                  min="1900"
                  max="2025"
                  defaultValue={editingVehicle?.year}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="price"
                  type="number"
                  placeholder="Price (CAD)"
                  min="0"
                  defaultValue={editingVehicle?.price}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="mileage"
                  type="number"
                  placeholder="Mileage (km)"
                  min="0"
                  defaultValue={editingVehicle?.mileage}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>
              
              <select
                name="status"
                defaultValue={editingVehicle?.status}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              >
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
              </select>
              
              <div className="space-y-4">
                <label className="block text-gray-400 text-sm font-medium">Vehicle Images</label>
                
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="image-upload"
                  />
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-acid-yellow transition-colors duration-300">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Upload vehicle images</p>
                    <p className="text-gray-500 text-sm mt-2">Click to browse or drag & drop</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB each</p>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-sm border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium tracking-wider hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300"
                >
                  {editingVehicle ? 'UPDATE' : 'ADD'} VEHICLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
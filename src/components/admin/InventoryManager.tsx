@@ .. @@
import React, { useState } from 'react';
-import { Plus, Edit, Trash2, Upload, Eye } from 'lucide-react';
+import { Plus, Edit, Trash2, Upload, Eye, Tag, Filter, Search } from 'lucide-react';
import Toast from '../ui/Toast';
import { useVehicles, Vehicle } from '../../contexts/VehicleContext';

@@ .. @@
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
+  const [searchTerm, setSearchTerm] = useState('');
+  const [statusFilter, setStatusFilter] = useState('all');
+  const [autoTagging, setAutoTagging] = useState(true);

@@ .. @@
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

+    // Auto-generate tags if enabled
+    let tags: string[] = [];
+    if (autoTagging) {
+      const priceNum = parseInt(price);
+      if (priceNum > 200000) tags.push('LUXURY');
+      if (priceNum > 300000) tags.push('EXOTIC');
+      if (parseInt(year) >= 2022) tags.push('NEW');
+      if (parseInt(mileage) < 5000) tags.push('LOW MILEAGE');
+      if (['BMW', 'MERCEDES', 'AUDI', 'PORSCHE'].includes(make.toUpperCase())) tags.push('PREMIUM');
+      if (['FERRARI', 'LAMBORGHINI', 'MCLAREN'].includes(make.toUpperCase())) tags.push('SUPERCAR');
+    }

    const vehicleData = {
      make,
      model,
      year: parseInt(year),
      price: parseInt(price),
      mileage: parseInt(mileage),
      status: status as 'available' | 'sold' | 'reserved',
-      images: imagePreviewUrls.length > 0 ? imagePreviewUrls : ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400']
+      images: imagePreviewUrls.length > 0 ? imagePreviewUrls : ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400'],
+      tags
    };

@@ .. @@
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-500';
      case 'sold': return 'text-red-500';
      case 'reserved': return 'text-acid-yellow';
      default: return 'text-gray-400';
    }
  };

+  const filteredVehicles = vehicles.filter(vehicle => {
+    const matchesSearch = searchTerm === '' ||
+      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
+      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
+      vehicle.year.toString().includes(searchTerm) ||
+      (vehicle.tags && vehicle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
+    
+    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
+    
+    return matchesSearch && matchesStatus;
+  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Vehicle Inventory</h2>
+        <div className="flex space-x-3">
+          <label className="flex items-center space-x-2 text-white">
+            <input
+              type="checkbox"
+              checked={autoTagging}
+              onChange={(e) => setAutoTagging(e.target.checked)}
+              className="w-4 h-4"
+            />
+            <span className="text-sm">Auto-tagging</span>
+          </label>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>ADD VEHICLE</span>
        </button>
+        </div>
      </div>

+      {/* Search and Filters */}
+      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
+        <div className="flex flex-col md:flex-row gap-4">
+          <div className="flex-1 relative">
+            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
+            <input
+              type="text"
+              placeholder="Search vehicles by make, model, year, or tags..."
+              value={searchTerm}
+              onChange={(e) => setSearchTerm(e.target.value)}
+              className="w-full bg-matte-black border border-gray-700 text-white rounded-sm pl-12 pr-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
+            />
+          </div>
+          
+          <select
+            value={statusFilter}
+            onChange={(e) => setStatusFilter(e.target.value)}
+            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
+          >
+            <option value="all">All Status</option>
+            <option value="available">Available</option>
+            <option value="sold">Sold</option>
+            <option value="reserved">Reserved</option>
+          </select>
+        </div>
+
+        <div className="mt-4 text-sm text-gray-400">
+          Showing {filteredVehicles.length} of {vehicles.length} vehicles
+        </div>
+      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
-        {vehicles.map((vehicle) => (
+        {filteredVehicles.map((vehicle) => (
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
+                {vehicle.tags && vehicle.tags.length > 0 && (
+                  <div className="flex flex-wrap gap-1 mt-2">
+                    {vehicle.tags.map((tag) => (
+                      <span key={tag} className="px-2 py-1 bg-acid-yellow/20 text-acid-yellow text-xs rounded-sm font-medium">
+                        {tag}
+                      </span>
+                    ))}
+                  </div>
+                )}
              </div>
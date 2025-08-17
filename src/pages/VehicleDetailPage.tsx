import React, { useState } from 'react';
import { ArrowLeft, Heart, BarChart3, Share2, Phone, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useVehicles } from '../contexts/VehicleContext';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVehicleById } = useVehicles();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const vehicle = id ? getVehicleById(id) : null;

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-20 bg-matte-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Vehicle Not Found</h1>
          <p className="text-gray-400 mb-8">The vehicle you're looking for doesn't exist.</p>
          <Link to="/inventory" className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300">
            BACK TO INVENTORY
          </Link>
        </div>
      </div>
    );
  }

  // Default specs and features if not provided
  const defaultSpecs = {
    engine: 'High Performance Engine',
    power: `${vehicle.specs?.hp || 500} HP`,
    torque: `${vehicle.specs?.torque || 600} NM`,
    acceleration: vehicle.specs?.acceleration || '3.5s',
    topSpeed: '300+ km/h',
    transmission: 'Automatic',
    drivetrain: 'All-Wheel Drive',
    fuel: 'Premium Unleaded'
  };

  const defaultFeatures = vehicle.features || [
    'Premium Sound System',
    'Navigation System',
    'Parking Sensors',
    'Backup Camera',
    'Heated Seats',
    'Leather Interior',
    'Sport Exhaust',
    'Performance Brakes'
  ];

  return (
    <div className="min-h-screen pt-20 bg-matte-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/inventory"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-acid-yellow transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium tracking-wider">BACK TO INVENTORY</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-dark-graphite rounded-lg overflow-hidden">
              <img
                src={vehicle.images[currentImage]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-sm backdrop-blur-sm transition-all duration-300 ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-white/20 text-white rounded-sm backdrop-blur-sm hover:bg-white/30 transition-colors duration-300">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/20 text-white rounded-sm backdrop-blur-sm hover:bg-white/30 transition-colors duration-300">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-3">
              {vehicle.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-24 h-16 rounded-sm overflow-hidden border-2 transition-all duration-300 ${
                    currentImage === index ? 'border-acid-yellow' : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                {vehicle.year} {vehicle.make}
              </h1>
              <p className="text-2xl text-gray-300 font-medium">{vehicle.model}</p>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-4xl font-black text-acid-yellow">
                  ${vehicle.price.toLocaleString()} CAD
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">MILEAGE</p>
                  <p className="text-white font-bold">{vehicle.mileage.toLocaleString()} km</p>
                </div>
              </div>
            </div>

            {/* Key Specs */}
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
              <h3 className="text-white font-bold tracking-wider mb-4">KEY SPECIFICATIONS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-acid-yellow">{vehicle.specs?.hp || 500}</p>
                  <p className="text-gray-400 text-sm tracking-wider">HP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-acid-yellow">{vehicle.specs?.torque || 600}</p>
                  <p className="text-gray-400 text-sm tracking-wider">NM</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-acid-yellow">{vehicle.specs?.acceleration || '3.5s'}</p>
                  <p className="text-gray-400 text-sm tracking-wider">0-100</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-acid-yellow">300+</p>
                  <p className="text-gray-400 text-sm tracking-wider">KM/H</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/book" className="bg-acid-yellow text-black py-4 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>SCHEDULE TEST DRIVE</span>
              </Link>
              
              <a href="tel:+14169166475" className="border-2 border-white text-white py-4 rounded-sm font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>CALL ABOUT VEHICLE</span>
              </a>
            </div>

            {/* VIN */}
            <div className="bg-carbon-gray border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm tracking-wider mb-1">VIN</p>
              <p className="text-white font-mono text-lg">{vehicle.vin || 'Available upon request'}</p>
            </div>
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="mt-16 bg-dark-graphite border border-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-8">
            COMPLETE SPECIFICATIONS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-acid-yellow tracking-wider">ENGINE & PERFORMANCE</h3>
              <div className="space-y-3">
                {Object.entries(defaultSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400 capitalize tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-acid-yellow tracking-wider">FEATURES & OPTIONS</h3>
              <div className="grid grid-cols-1 gap-2">
                {defaultFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3 py-2">
                    <div className="w-2 h-2 bg-acid-yellow rounded-full"></div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
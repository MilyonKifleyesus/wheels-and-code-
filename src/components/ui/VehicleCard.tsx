import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BarChart3, Eye, Star } from 'lucide-react';
import type { Vehicle } from '../../contexts/VehicleContext';


interface VehicleCardProps {
  vehicle: Vehicle & { image?: string };
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get the first image or use default
  const imageUrl = vehicle.image || vehicle.images?.[0] || 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800';
  
  // Ensure specs exist with defaults
  const specs = vehicle.specs || { hp: 500, torque: 600, acceleration: '3.5s' };
  const tags = vehicle.tags || [];
  return (
    <div className="group bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"></div>
        )}
        <img
          src={imageUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Tags */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 text-xs font-bold tracking-wider rounded-sm ${
                tag === 'NEW' 
                  ? 'bg-acid-yellow text-black' 
                  : tag === 'PRICE DROP'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-black'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-sm backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            aria-label="Save vehicle"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            className="p-2 bg-white/20 text-white rounded-sm backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            aria-label="Compare vehicle"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title & Price */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {vehicle.year} {vehicle.make}
            </h3>
            <p className="text-gray-400 font-medium">{vehicle.model}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-acid-yellow">
              ${vehicle.price.toLocaleString()} CAD
            </p>
            <p className="text-xs text-gray-400">{vehicle.mileage.toLocaleString()} km</p>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{specs.hp}</p>
            <p className="text-xs text-gray-400 tracking-wider">HP</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{specs.torque}</p>
            <p className="text-xs text-gray-400 tracking-wider">NM</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{specs.acceleration}</p>
            <p className="text-xs text-gray-400 tracking-wider">0-100</p>
          </div>
        </div>

        {/* CTA */}
        <Link to={`/vehicle/${vehicle.id}`} className="w-full bg-white/10 text-white py-3 rounded-sm font-bold tracking-wider hover:bg-acid-yellow hover:text-black transition-all duration-300 flex items-center justify-center space-x-2 group">
          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span>VIEW DETAILS</span>
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
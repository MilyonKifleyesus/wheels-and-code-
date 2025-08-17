import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from '../ui/VehicleCard';
import { useContent } from '../../contexts/ContentContext';
import { useVehicles } from '../../contexts/VehicleContext';

const NewArrivals: React.FC = () => {
  const { vehicles } = useVehicles();
  const { getSectionByType } = useContent();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const inventoryContent = getSectionByType('inventory');
  
  // Always show inventory section with fallback content
  const content = inventoryContent?.content || {
    heading: 'NEW ARRIVALS',
    description: 'Latest additions to our premium collection'
  };

  // Show only the first 4 vehicles for the homepage
  const displayVehicles = vehicles.slice(0, 4);

  return (
    <section className="py-16 bg-carbon-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {content.heading || 'NEW ARRIVALS'}
            </h2>
            <p className="text-gray-400 mt-2">{content.description || 'Latest additions to our premium collection'}</p>
          </div>
          <Link to="/inventory" className="hidden md:block text-acid-yellow hover:text-neon-lime transition-colors duration-300 text-sm font-bold tracking-wider">
            VIEW ALL →
          </Link>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayVehicles.length > 0 ? (
            displayVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            // Show loading placeholders
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-dark-graphite border border-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 md:hidden text-center">
          <Link to="/inventory" className="text-acid-yellow hover:text-neon-lime transition-colors duration-300 text-sm font-bold tracking-wider">
            VIEW ALL INVENTORY →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
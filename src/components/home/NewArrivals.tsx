import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BarChart3, Eye } from 'lucide-react';
import VehicleCard from '../ui/VehicleCard';
import { useContent } from '../../contexts/ContentContext';
import { useVehicles } from '../../contexts/VehicleContext';

const NewArrivals: React.FC = () => {
  const { vehicles } = useVehicles();
  const { getSectionByType, loading } = useContent();
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

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayVehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex-none w-80 sm:w-96 snap-center">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
          
          {/* Show message if no vehicles */}
          {displayVehicles.length === 0 && (
            <div className="w-full text-center py-12">
              <p className="text-gray-400">Loading premium vehicles...</p>
            </div>
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
import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import VehicleCard from '../components/ui/VehicleCard';
import { useVehicles } from '../contexts/VehicleContext';

const InventoryPage: React.FC = () => {
  const { vehicles } = useVehicles();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [makeFilter, setMakeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [mileageFilter, setMileageFilter] = useState('');

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' || 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm);
    
    const matchesMake = makeFilter === '' || makeFilter === 'All Makes' || 
      vehicle.make.toLowerCase() === makeFilter.toLowerCase();
    
    const matchesPrice = priceFilter === '' || priceFilter === 'Price Range' ||
      (priceFilter === 'Under $100k' && vehicle.price < 100000) ||
      (priceFilter === '$100k - $200k' && vehicle.price >= 100000 && vehicle.price < 200000) ||
      (priceFilter === '$200k - $300k' && vehicle.price >= 200000 && vehicle.price < 300000) ||
      (priceFilter === '$300k+' && vehicle.price >= 300000);
    
    const matchesYear = yearFilter === '' || yearFilter === 'Year' ||
      vehicle.year.toString() === yearFilter;
    
    const matchesMileage = mileageFilter === '' || mileageFilter === 'Mileage' ||
      (mileageFilter === 'Under 5k' && vehicle.mileage < 5000) ||
      (mileageFilter === '5k - 15k' && vehicle.mileage >= 5000 && vehicle.mileage < 15000) ||
      (mileageFilter === '15k - 30k' && vehicle.mileage >= 15000 && vehicle.mileage < 30000) ||
      (mileageFilter === '30k+' && vehicle.mileage >= 30000);
    
    return matchesSearch && matchesMake && matchesPrice && matchesYear && matchesMileage;
  });

  return (
    <div className="min-h-screen pt-20 bg-matte-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            PREMIUM INVENTORY
          </h1>
          <p className="text-gray-400 text-lg">
            Discover our curated collection of exceptional vehicles
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make, model, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm pl-12 pr-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300"
            >
              <Filter className="w-5 h-5" />
              <span>FILTERS</span>
            </button>
            
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
              <select 
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              >
                <option>All Makes</option>
                <option>FERRARI</option>
                <option>LAMBORGHINI</option>
                <option>PORSCHE</option>
                <option>BMW</option>
              </select>
              
              <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              >
                <option>Price Range</option>
                <option>Under $100k</option>
                <option>$100k - $200k</option>
                <option>$200k - $300k</option>
                <option>$300k+</option>
              </select>
              
              <select 
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              >
                <option>Year</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
              </select>
              
              <select 
                value={mileageFilter}
                onChange={(e) => setMileageFilter(e.target.value)}
                className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              >
                <option>Mileage</option>
                <option>Under 5k</option>
                <option>5k - 15k</option>
                <option>15k - 30k</option>
                <option>30k+</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{filteredVehicles.length}</span> of{' '}
            <span className="text-white font-medium">{vehicles.length}</span> vehicles
          </p>
          <div className="text-gray-400 text-sm">
            {searchTerm && <span>Search: "{searchTerm}" • </span>}
            {(makeFilter && makeFilter !== 'All Makes') && <span>Make: {makeFilter} • </span>}
            {(priceFilter && priceFilter !== 'Price Range') && <span>Price: {priceFilter} • </span>}
            {(yearFilter && yearFilter !== 'Year') && <span>Year: {yearFilter} • </span>}
            {(mileageFilter && mileageFilter !== 'Mileage') && <span>Mileage: {mileageFilter}</span>}
          </div>
        </div>

        {/* Vehicle Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
              <h3 className="text-white font-bold text-xl mb-2">No Vehicles Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || makeFilter || priceFilter || yearFilter || mileageFilter
                  ? 'Try adjusting your search criteria or filters'
                  : 'No vehicles available at the moment'
                }
              </p>
              {(searchTerm || makeFilter || priceFilter || yearFilter || mileageFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMakeFilter('');
                    setPriceFilter('');
                    setYearFilter('');
                    setMileageFilter('');
                  }}
                  className="bg-acid-yellow text-black px-6 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300"
                >
                  CLEAR FILTERS
                </button>
              )}
            </div>
          </div>
        ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
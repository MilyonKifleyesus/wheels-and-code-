import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Phone } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { useVehicles } from '../../contexts/VehicleContext';
import Car3D from '../ui/Car3D';
import SpecTicker from '../ui/SpecTicker';

const HeroSection: React.FC = () => {
  const { getSectionByType } = useContent();
  const { vehicles } = useVehicles();
  const [isLoaded, setIsLoaded] = useState(true); // Start as loaded
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const heroContent = getSectionByType('hero');
  const featuredVehicle = vehicles.find(v => v.status === 'available') || vehicles[0];
  
  // Always show hero section with fallback content
  const content = heroContent?.content || {
    heading: 'PRECISION PERFORMANCE PERFECTION',
    subheading: 'Where automotive excellence meets cutting-edge service',
    description: 'Experience the pinnacle of automotive luxury and performance',
    buttonText: 'BROWSE CARS',
    buttonLink: '/inventory',
    backgroundColor: '#0B0B0C',
    textColor: '#FFFFFF',
    accentColor: '#D7FF00'
  };

  useEffect(() => {
    // Ensure component is marked as loaded
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          alt="Luxury automotive showroom"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Fallback gradient while image loads */}
        <div className={`absolute inset-0 bg-gradient-to-br from-background via-carbon-gray to-surface transition-opacity duration-1000 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}></div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40"></div>
      </div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center min-h-screen py-20">
          {/* Content Column */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-none">
                <span className="block text-text drop-shadow-2xl">PRECISION</span>
                <span className="block text-primary drop-shadow-2xl animate-pulse">PERFORMANCE</span>
                <span className="block text-text drop-shadow-2xl">PERFECTION</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-text-secondary max-w-2xl font-light leading-relaxed drop-shadow-lg">
                {content.subheading || 'Where automotive excellence meets cutting-edge service'}
              </p>
              
              <p className="text-lg text-text-secondary max-w-xl drop-shadow-md">
                {content.description || 'Experience the pinnacle of automotive luxury and performance'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                to={content.buttonLink || '/inventory'} 
                className="group bg-primary text-background px-10 py-5 rounded-sm font-bold tracking-wider hover:bg-secondary transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-primary/25 hover:scale-105"
              >
                <span>{content.buttonText || 'BROWSE CARS'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              
              <Link to="/book" className="group border-2 border-text/80 text-text px-10 py-5 rounded-sm font-bold tracking-wider hover:bg-text hover:text-background transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm hover:scale-105">
                <Play className="w-6 h-6" />
                <span>BOOK SERVICE</span>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-8 pt-6">
              <a href="tel:+14169166475" className="text-text-secondary hover:text-primary transition-colors duration-300 flex items-center space-x-3 group">
                <div className="p-2 bg-text/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold tracking-wider">CALL NOW</span>
              </a>
              <a href="https://maps.google.com/?q=179+Weston+Rd,+Toronto,+ON+M6N+3A5" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors duration-300 text-sm font-bold tracking-wider">
                GET DIRECTIONS
              </a>
            </div>

            {/* Featured Vehicle Info */}
            {featuredVehicle && (
              <div className="bg-black/40 backdrop-blur-md border border-text/20 rounded-lg p-6 max-w-md">
                <h3 className="text-primary font-bold tracking-wider mb-2">FEATURED VEHICLE</h3>
                <p className="text-text text-lg font-bold">
                  {featuredVehicle.year} {featuredVehicle.make} {featuredVehicle.model}
                </p>
                <p className="text-text-secondary text-sm mb-3">
                  {featuredVehicle.specs?.hp || 500} HP • {featuredVehicle.mileage.toLocaleString()} km
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-black text-xl">
                    ${featuredVehicle.price.toLocaleString()} CAD
                  </span>
                  <Link 
                    to={`/vehicle/${featuredVehicle.id}`}
                    className="text-text hover:text-primary transition-colors duration-300 text-sm font-medium"
                  >
                    VIEW DETAILS →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Stats Column */}
          <div className="order-1 lg:order-2 flex flex-col items-center justify-center space-y-8">
            <SpecTicker />
            
            {/* Quick Stats */}
            <div className="bg-black/40 backdrop-blur-md border border-text/20 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-text font-bold tracking-wider mb-4 text-center">BUSINESS STATS</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-primary">{vehicles.length}</p>
                  <p className="text-text-secondary text-xs tracking-wider">VEHICLES</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">15+</p>
                  <p className="text-text-secondary text-xs tracking-wider">YEARS</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">500+</p>
                  <p className="text-text-secondary text-xs tracking-wider">CUSTOMERS</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">4.8★</p>
                  <p className="text-text-secondary text-xs tracking-wider">RATING</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-1 h-16 bg-gradient-to-b from-primary to-transparent rounded-full shadow-lg"></div>
        <p className="text-text text-xs tracking-widest mt-2 text-center">SCROLL</p>
      </div>
    </section>
  );
};

export default HeroSection;
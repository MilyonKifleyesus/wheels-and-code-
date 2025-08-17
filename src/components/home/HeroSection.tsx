import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Phone } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import Car3D from '../ui/Car3D';
import SpecTicker from '../ui/SpecTicker';

const HeroSection: React.FC = () => {
  const { getSectionByType, loading } = useContent();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const heroContent = getSectionByType('hero');
  
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
    // Simulate loading delay for hero assets
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-matte-black via-carbon-gray to-dark-graphite"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Content Column */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-none">
                {content.heading?.split(' ').map((word, index) => (
                  <span 
                    key={index} 
                    className={`block ${index === 1 ? 'text-acid-yellow' : 'text-white'}`}
                    style={{ color: index === 1 ? content.accentColor : content.textColor }}
                  >
                    {word}
                  </span>
                )) || (
                  <>
                    <span className="block text-white">PRECISION</span>
                    <span className="block text-acid-yellow">PERFORMANCE</span>
                    <span className="block text-white">PERFECTION</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl text-gray-300 max-w-lg font-light leading-relaxed">
                {content.subheading || 'Where automotive excellence meets cutting-edge service'}
              </p>
              
              {content.description && (
                <p className="text-lg text-gray-400 max-w-lg">
                  {content.description}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={content.buttonLink || '/inventory'} 
                className="group bg-acid-yellow text-black px-8 py-4 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-all duration-300 flex items-center justify-center space-x-2"
                style={{ backgroundColor: content.accentColor }}
              >
                <span>{content.buttonText || 'BROWSE CARS'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link to="/book" className="group border-2 border-white text-white px-8 py-4 rounded-sm font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>BOOK SERVICE</span>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-6 pt-4">
              <a href="tel:+14169166475" className="text-gray-400 hover:text-acid-yellow transition-colors duration-300 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">CALL NOW</span>
              </a>
              <a href="https://maps.google.com/?q=179+Weston+Rd,+Toronto,+ON+M6N+3A5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-acid-yellow transition-colors duration-300 text-sm font-medium">
                GET DIRECTIONS
              </a>
            </div>

            {/* Spec Ticker */}
            <SpecTicker />
          </div>

          {/* 3D Car Column */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Car3D />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-16 bg-gradient-to-b from-acid-yellow to-transparent rounded-full"></div>
      </div>
    </section>
  );
};

export default HeroSection;
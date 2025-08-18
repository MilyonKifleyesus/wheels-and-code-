import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

const PromoSection: React.FC = () => {
  const { getSectionById } = useContent();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });
  
  const promoContent = getSectionById('promo');
  
  // Ensure hooks are always called in the same order across renders
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // Don't render if section is hidden
  if (!promoContent?.visible) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-acid-yellow/20 to-neon-lime/20"></div>
      <div className="absolute inset-0 bg-matte-black/80"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-acid-yellow/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-acid-yellow rounded-sm flex items-center justify-center">
              <Zap className="w-8 h-8 text-black" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {promoContent.content.heading || 'PERFORMANCE SERVICE SPECIAL'}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {promoContent.content.description || 'Complete performance package including diagnostics, tune-up, and optimization'}
            </p>
            <div className="text-4xl md:text-5xl font-black">
              <span className="text-gray-400 line-through">$899</span>
              <span className="text-acid-yellow ml-4">$599</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                <span className="text-2xl font-black text-acid-yellow">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-2 tracking-wider">HOURS</p>
            </div>
            
            <div className="text-center">
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                <span className="text-2xl font-black text-acid-yellow">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-2 tracking-wider">MINUTES</p>
            </div>
            
            <div className="text-center">
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                <span className="text-2xl font-black text-acid-yellow">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-2 tracking-wider">SECONDS</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <Link to="/book" className="bg-acid-yellow text-black px-12 py-4 rounded-sm font-black tracking-wider text-lg hover:bg-neon-lime transition-all duration-300 hover:scale-105 flex items-center space-x-3 mx-auto">
              <Clock className="w-5 h-5" />
              <span>CLAIM OFFER NOW</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
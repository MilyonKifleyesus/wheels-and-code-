import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Zap, Settings, ShieldCheck, Gauge, Clock, Star } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const serviceCategories = [
    {
      title: 'MAINTENANCE',
      icon: Wrench,
      services: [
        { name: 'Oil Change', price: 'FROM $89 CAD', duration: '30 MIN' },
        { name: 'Brake Service', price: 'FROM $299 CAD', duration: '90 MIN' },
        { name: 'Tire Service', price: 'FROM $149 CAD', duration: '45 MIN' },
        { name: 'Battery Service', price: 'FROM $199 CAD', duration: '60 MIN' },
      ]
    },
    {
      title: 'DIAGNOSTICS',
      icon: Settings,
      services: [
        { name: 'Engine Diagnostics', price: 'FROM $149 CAD', duration: '45 MIN' },
        { name: 'Transmission Check', price: 'FROM $199 CAD', duration: '60 MIN' },
        { name: 'Electrical Diagnostics', price: 'FROM $179 CAD', duration: '75 MIN' },
        { name: 'AC System Check', price: 'FROM $129 CAD', duration: '40 MIN' },
      ]
    },
    {
      title: 'PERFORMANCE',
      icon: Zap,
      services: [
        { name: 'ECU Tuning', price: 'FROM $599 CAD', duration: '180 MIN' },
        { name: 'Exhaust Upgrade', price: 'FROM $899 CAD', duration: '240 MIN' },
        { name: 'Cold Air Intake', price: 'FROM $399 CAD', duration: '120 MIN' },
        { name: 'Suspension Tuning', price: 'FROM $1299 CAD', duration: '360 MIN' },
      ]
    },
  ];

  return (
    <div className="min-h-screen pt-20 bg-matte-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
            PRECISION SERVICE
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            State-of-the-art automotive service with certified technicians and premium equipment
          </p>
          
          <div className="flex justify-center mt-8">
            <Link to="/book" className="bg-acid-yellow text-black px-8 py-4 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300">
              BOOK SERVICE NOW
            </Link>
          </div>
        </div>

        {/* Service Categories */}
        <div className="space-y-12">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
                <div className="flex items-center mb-8">
                  <div className="p-4 bg-acid-yellow/10 rounded-sm mr-4">
                    <Icon className="w-8 h-8 text-acid-yellow" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.services.map((service) => (
                    <div key={service.name} className="bg-matte-black border border-gray-800 rounded-lg p-6 hover:border-acid-yellow transition-colors duration-300 group">
                      <h3 className="text-white font-bold mb-3 tracking-wide">
                        {service.name}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-acid-yellow font-bold">{service.price}</p>
                        <p className="text-gray-400 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {service.duration}
                        </p>
                      </div>

                      <Link to="/book" className="w-full bg-white/10 text-white py-2 rounded-sm font-medium tracking-wider hover:bg-acid-yellow hover:text-black transition-all duration-300 flex items-center justify-center">
                        BOOK NOW
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
            <ShieldCheck className="w-12 h-12 text-acid-yellow mx-auto mb-4" />
            <h3 className="text-white font-bold tracking-wider mb-2">CERTIFIED TECHNICIANS</h3>
            <p className="text-gray-400 text-sm">ASE certified professionals with years of experience</p>
          </div>
          
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
            <Star className="w-12 h-12 text-acid-yellow mx-auto mb-4" />
            <h3 className="text-white font-bold tracking-wider mb-2">LIFETIME WARRANTY</h3>
            <p className="text-gray-400 text-sm">Comprehensive warranty on all major repairs</p>
          </div>
          
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
            <Gauge className="w-12 h-12 text-acid-yellow mx-auto mb-4" />
            <h3 className="text-white font-bold tracking-wider mb-2">PERFORMANCE FOCUS</h3>
            <p className="text-gray-400 text-sm">Specialized in high-performance and luxury vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
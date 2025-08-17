import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Zap, Settings, ShieldCheck, Gauge, Clock } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

interface Service {
  id: number;
  icon: React.ElementType;
  name: string;
  price: string;
  duration: string;
  description: string;
}

const ServicesPreview: React.FC = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const { getSectionByType } = useContent();
  
  const servicesContent = getSectionByType('services');
  
  // Always show services section with fallback content
  const content = servicesContent?.content || {
    heading: 'PRECISION SERVICE',
    description: 'Expert automotive service with state-of-the-art equipment and certified technicians'
  };

  const services: Service[] = [
    {
      id: 1,
      icon: Wrench,
      name: 'Oil Change',
      price: 'FROM $89 CAD',
      duration: '30 MIN',
      description: 'Premium synthetic oil change with multi-point inspection'
    },
    {
      id: 2,
      icon: Settings,
      name: 'Brake Service',
      price: 'FROM $299 CAD',
      duration: '90 MIN',
      description: 'Complete brake system inspection and service'
    },
    {
      id: 3,
      icon: Zap,
      name: 'Engine Diagnostics',
      price: 'FROM $149 CAD',
      duration: '45 MIN',
      description: 'Advanced computerized engine diagnostics'
    },
    {
      id: 4,
      icon: Gauge,
      name: 'Performance Tune',
      price: 'FROM $599 CAD',
      duration: '180 MIN',
      description: 'ECU optimization and performance enhancement'
    },
    {
      id: 5,
      icon: ShieldCheck,
      name: 'Safety Inspection',
      price: 'FROM $79 CAD',
      duration: '25 MIN',
      description: 'Comprehensive safety and emissions testing'
    },
    {
      id: 6,
      icon: Clock,
      name: 'Express Service',
      price: 'FROM $199 CAD',
      duration: '60 MIN',
      description: 'Quick maintenance package for busy schedules'
    },
  ];

  return (
    <section className="py-16 bg-matte-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            {content.heading || 'PRECISION SERVICE'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {content.description || 'Expert automotive service with state-of-the-art equipment and certified technicians'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className={`group bg-dark-graphite border border-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-acid-yellow hover:-translate-y-1 ${
                  selectedService === service.id ? 'border-acid-yellow bg-acid-yellow/5' : ''
                }`}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-acid-yellow/10 rounded-sm group-hover:bg-acid-yellow/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-acid-yellow" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{service.duration}</p>
                    <p className="font-bold text-acid-yellow">{service.price}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                  {service.name}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                <Link to="/book" className="w-full bg-white/10 text-white py-2 rounded-sm font-medium tracking-wider hover:bg-acid-yellow hover:text-black transition-all duration-300 flex items-center justify-center">
                  BOOK NOW
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mini Booking Widget */}
        <div className="bg-dark-graphite/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6 tracking-wide text-center">
            QUICK BOOKING
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                SELECT SERVICE
              </label>
              <select className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300">
                <option>Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                PREFERRED DATE
              </label>
              <input
                type="date"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              />
            </div>
            
            <div className="flex items-end">
              <Link to="/book" className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center">
                CHECK AVAILABILITY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
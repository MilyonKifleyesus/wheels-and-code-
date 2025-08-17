import React from 'react';
import { Star, Shield, Award, Users } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

const TrustSection: React.FC = () => {
  const { getSectionById } = useContent();
  
  const trustContent = getSectionById('trust');
  
  // Don't render if section is hidden
  if (!trustContent?.visible) {
    return null;
  }

  const reviews = [
    {
      id: 1,
      name: 'Sarah Chen',
      rating: 5,
      text: 'Exceptional service and attention to detail. My Porsche has never run better.',
      service: 'Performance Tune'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      rating: 5,
      text: 'Professional team, transparent pricing, and incredible results. Highly recommended.',
      service: 'Engine Rebuild'
    },
    {
      id: 3,
      name: 'Emily Johnson',
      rating: 5,
      text: 'Quick turnaround and quality work. The perfect place for luxury car maintenance.',
      service: 'Brake Service'
    },
  ];

  const badges = [
    { icon: Shield, title: 'CERTIFIED TECHS', description: 'ASE Certified Professionals' },
    { icon: Award, title: 'LIFETIME WARRANTY', description: 'On All Major Repairs' },
    { icon: Users, title: 'NO HIDDEN FEES', description: 'Transparent Pricing Always' },
  ];

  return (
    <section className="py-16 bg-matte-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-acid-yellow fill-current" />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">4.8</span>
            <span className="text-gray-400">/ 187 reviews</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            {trustContent.content.heading || 'TRUSTED BY THOUSANDS'}
          </h2>
          
          {trustContent.content.description && (
            <p className="text-gray-400 max-w-2xl mx-auto">
              {trustContent.content.description}
            </p>
          )}
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-acid-yellow fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 tracking-wider">{review.service}</span>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              
              <p className="text-white font-medium text-sm">— {review.name}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="text-center group">
                <div className="w-16 h-16 bg-acid-yellow/10 rounded-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-acid-yellow/20 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-acid-yellow" />
                </div>
                <h3 className="text-white font-bold tracking-wider mb-2">{badge.title}</h3>
                <p className="text-gray-400 text-sm">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
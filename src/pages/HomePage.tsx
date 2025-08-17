import React from 'react';
import { useContent } from '../contexts/ContentContext';
import HeroSection from '../components/home/HeroSection';
import QuickActions from '../components/home/QuickActions';
import NewArrivals from '../components/home/NewArrivals';
import ServicesPreview from '../components/home/ServicesPreview';
import FinanceSection from '../components/home/FinanceSection';
import RepairStatusWidget from '../components/home/RepairStatusWidget';
import TrustSection from '../components/home/TrustSection';
import PromoSection from '../components/home/PromoSection';
import MapSection from '../components/home/MapSection';

const HomePage: React.FC = () => {
  const { getVisibleSections } = useContent();
  const visibleSections = getVisibleSections();
  
  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'hero': return <HeroSection key="hero" />;
      case 'services': return <ServicesPreview key="services" />;
      case 'inventory': return <NewArrivals key="inventory" />;
      case 'finance': return <FinanceSection key="finance" />;
      case 'trust': return <TrustSection key="trust" />;
      case 'promo': return <PromoSection key="promo" />;
      case 'map': return <MapSection key="map" />;
      default: return null;
    }
  };

  return (
    <div className="homepage">
      <QuickActions />
      {visibleSections.map(section => renderSection(section.type))}
      <RepairStatusWidget />
    </div>
  );
};

export default HomePage;
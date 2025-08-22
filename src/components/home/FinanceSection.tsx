import React, { useState } from 'react';
import { Calculator, Camera, CreditCard, FileText } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

const FinanceSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'trade'>('finance');
  const { getSectionById } = useContent();
  
  const financeContent = getSectionById('finance');
  
  // Don't render if section is hidden
  if (!financeContent?.visible) {
    return null;
  }

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Finance Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text mb-4">
                {financeContent.content.heading || 'FINANCE OPTIONS'}
              </h2>
              <p className="text-text-secondary">
                {financeContent.content.description || 'Get pre-qualified in minutes with competitive CAD rates and flexible terms'}
              </p>
            </div>

            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-text mb-6 tracking-wide flex items-center">
                <CreditCard className="w-5 h-5 text-primary mr-3" />
                PRE-QUALIFICATION
              </h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                />
                
                <select className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300">
                  <option>Annual Income Range</option>
                  <option>$30,000 - $50,000 CAD</option>
                  <option>$50,000 - $75,000 CAD</option>
                  <option>$75,000 - $100,000 CAD</option>
                  <option>$100,000+ CAD</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-primary text-background py-3 rounded-sm font-bold tracking-wider hover:bg-secondary transition-colors duration-300"
                >
                  GET PRE-QUALIFIED
                </button>
              </form>
            </div>
          </div>

          {/* Trade-In Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text mb-4">
                TRADE-IN VALUE
              </h2>
              <p className="text-text-secondary">
                Get an instant estimate for your current vehicle
              </p>
            </div>

            <div className="bg-background border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-text mb-6 tracking-wide flex items-center">
                <Calculator className="w-5 h-5 text-primary mr-3" />
                QUICK ESTIMATE
              </h3>

              <div className="space-y-6">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-carbon-gray p-1 rounded-sm">
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`py-2 px-4 rounded-sm text-sm font-bold tracking-wider transition-all duration-300 ${
                      activeTab === 'finance'
                        ? 'bg-primary text-background'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    BY VIN
                  </button>
                  <button
                    onClick={() => setActiveTab('trade')}
                    className={`py-2 px-4 rounded-sm text-sm font-bold tracking-wider transition-all duration-300 ${
                      activeTab === 'trade'
                        ? 'bg-primary text-background'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    BY DETAILS
                  </button>
                </div>

                {activeTab === 'finance' ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter VIN Number"
                      className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                    />
                    <button className="w-full bg-text/10 text-text py-3 rounded-sm font-medium tracking-wider hover:bg-text/20 transition-colors duration-300 flex items-center justify-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>SCAN VIN WITH CAMERA</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select className="bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300">
                        <option>Year</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                        <option>2020</option>
                      </select>
                      <select className="bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300">
                        <option>Make</option>
                        <option>BMW</option>
                        <option>Mercedes</option>
                        <option>Audi</option>
                        <option>Porsche</option>
                      </select>
                    </div>
                    <select className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300">
                      <option>Model</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Mileage"
                      className="w-full bg-carbon-gray border border-gray-700 text-text rounded-sm px-4 py-3 focus:border-primary focus:outline-none transition-colors duration-300"
                    />
                  </div>
                )}

                <button className="w-full bg-primary text-background py-3 rounded-sm font-bold tracking-wider hover:bg-secondary transition-colors duration-300">
                  GET INSTANT ESTIMATE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinanceSection;
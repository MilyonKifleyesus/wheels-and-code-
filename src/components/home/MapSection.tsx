import React, { useState } from 'react';
import { MapPin, Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

const MapSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { getSectionById } = useContent();
  
  const mapContent = getSectionById('map');
  
  // Don't render if section is hidden
  if (!mapContent?.visible) {
    return null;
  }

  const faqs = [
    {
      question: 'What brands do you service?',
      answer: 'We service all luxury and performance brands including BMW, Mercedes, Audi, Porsche, Ferrari, Lamborghini, and more.'
    },
    {
      question: 'Do you offer warranty on repairs?',
      answer: 'Yes, we provide a comprehensive warranty on all major repairs and use only OEM or premium aftermarket parts.'
    },
    {
      question: 'Can I get financing for vehicle purchases?',
      answer: 'We offer competitive financing options through multiple lenders with rates as low as 2.9% APR for qualified buyers.'
    },
    {
      question: 'How long does a typical service take?',
      answer: 'Service times vary by complexity. Oil changes take 30 minutes, while major repairs can take 1-3 days. We provide accurate estimates upfront.'
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-16 bg-dark-graphite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact & Location */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                {mapContent.content.heading || 'VISIT US'}
              </h2>
              <p className="text-gray-400">
                {mapContent.content.description || 'Experience our state-of-the-art facility and meet our expert team'}
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-matte-black border border-gray-800 rounded-lg p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-acid-yellow/10 rounded-sm">
                  <MapPin className="w-6 h-6 text-acid-yellow" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">ADDRESS</h3>
                  <p className="text-gray-400 mt-1">
                    179 Weston Rd<br />
                    Toronto, ON<br />
                    M6N 3A5, Canada
                  </p>
                  <a href="https://maps.google.com/?q=179+Weston+Rd,+Toronto,+ON+M6N+3A5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-acid-yellow transition-colors duration-300 text-sm font-medium">
                    GET DIRECTIONS
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-acid-yellow/10 rounded-sm">
                  <Phone className="w-6 h-6 text-acid-yellow" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">PHONE</h3>
                  <a 
                    href="tel:+14169166475"
                    className="text-gray-400 hover:text-acid-yellow transition-colors duration-300 mt-1 block"
                  >
                    (416) 916-6475
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-acid-yellow/10 rounded-sm">
                  <Clock className="w-6 h-6 text-acid-yellow" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide">HOURS</h3>
                  <div className="text-gray-400 mt-1 space-y-1">
                    <p>Monday - Friday: 9:30 AM - 7:00 PM</p>
                    <p>Saturday: 9:30 AM - 3:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-500 text-sm font-medium">OPEN NOW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                FREQUENTLY ASKED
              </h2>
              <p className="text-gray-400">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-matte-black border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-dark-graphite transition-colors duration-300"
                  >
                    <span className="text-white font-medium tracking-wide">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-acid-yellow" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-6 border-t border-gray-800">
                      <p className="text-gray-400 leading-relaxed pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
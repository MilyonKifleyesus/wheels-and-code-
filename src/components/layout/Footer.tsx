import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-graphite border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-acid-yellow to-neon-lime rounded-sm flex items-center justify-center">
                <Car className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-wider">MIKEY G AUTO</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium automotive sales and service. Where precision meets performance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider">QUICK LINKS</h4>
            <nav className="space-y-2">
              {[
                { name: 'Inventory', href: '/inventory' },
                { name: 'Services', href: '/services' },
                { name: 'Book Service', href: '/book' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-gray-400 hover:text-acid-yellow transition-colors duration-300 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider">SERVICES</h4>
            <div className="space-y-2">
              {[
                'Oil Change',
                'Brake Service',
                'Engine Diagnostics',
                'Performance Tuning',
              ].map((service) => (
                <div key={service} className="text-gray-400 text-sm">
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider">CONTACT</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-acid-yellow" />
                <span>(416) 916-6475</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-acid-yellow" />
                <span>Call for email contact</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-acid-yellow" />
                <span>179 Weston Rd, Toronto, ON M6N 3A5</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-acid-yellow" />
                <span>Mon-Fri: 9:30AM-7PM, Sat: 9:30AM-3PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © {currentYear} APEX AUTO SALES & REPAIR. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-acid-yellow text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-acid-yellow text-sm transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
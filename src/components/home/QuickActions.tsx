import React from 'react';
import { Phone, MapPin, Car, Wrench } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    { icon: Phone, label: 'CALL', href: 'tel:+14169166475', primary: true },
    { icon: MapPin, label: 'DIRECTIONS', href: 'https://maps.google.com/?q=179+Weston+Rd,+Toronto,+ON+M6N+3A5', primary: false },
    { icon: Car, label: 'BROWSE', href: '/inventory', primary: false },
    { icon: Wrench, label: 'BOOK', href: '/book', primary: false },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <div className="bg-dark-graphite/95 backdrop-blur-lg border border-gray-800 rounded-lg p-2">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-sm transition-all duration-300 active:scale-95 ${
                  action.primary
                    ? 'bg-acid-yellow text-black hover:bg-neon-lime'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold tracking-wider">{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
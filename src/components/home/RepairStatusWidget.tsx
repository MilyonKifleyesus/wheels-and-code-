import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Wrench, Car } from 'lucide-react';

const RepairStatusWidget: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<any>(null);

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate status lookup
    setStatus({
      orderNumber: orderNumber,
      vehicle: '2022 BMW M3',
      status: 'In Progress',
      timeline: [
        { step: 'Received', completed: true, time: '9:00 AM' },
        { step: 'Diagnostics', completed: true, time: '10:30 AM' },
        { step: 'Parts Ordered', completed: true, time: '11:15 AM' },
        { step: 'In Progress', completed: false, time: 'Est. 2:00 PM' },
        { step: 'Quality Check', completed: false, time: 'Est. 3:30 PM' },
        { step: 'Ready for Pickup', completed: false, time: 'Est. 4:00 PM' },
      ]
    });
  };

  return (
    <section className="py-16 bg-carbon-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            REPAIR STATUS
          </h2>
          <p className="text-gray-400">
            Track your vehicle's service progress in real-time
          </p>
        </div>

        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 md:p-8">
          {!status ? (
            <form onSubmit={handleStatusCheck} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                    ORDER NUMBER
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="RO-123456"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>CHECK STATUS</span>
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Order #{status.orderNumber}</h3>
                  <p className="text-gray-400 flex items-center mt-1">
                    <Car className="w-4 h-4 mr-2" />
                    {status.vehicle}
                  </p>
                </div>
                <button 
                  onClick={() => setStatus(null)}
                  className="text-acid-yellow hover:text-neon-lime transition-colors duration-300 text-sm font-medium"
                >
                  CHECK ANOTHER
                </button>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {status.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-acid-yellow text-black' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : index === 3 ? (
                        <Wrench className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                        {item.step}
                      </p>
                      <p className="text-sm text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RepairStatusWidget;
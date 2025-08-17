import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Wrench, Car, Phone, Mail } from 'lucide-react';
import { useBookings } from '../contexts/BookingContext';

const RepairStatusPage: React.FC = () => {
  const { bookings } = useBookings();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<any>(null);

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Look for booking by order number (using booking ID) or phone number
    const foundBooking = bookings.find(booking => 
      booking.id.toString() === orderNumber || 
      booking.customerPhone === phone ||
      orderNumber.includes(booking.id.toString())
    );

    if (foundBooking) {
      // Create status based on actual booking data
      const getStatusDescription = (status: string) => {
        switch (status) {
          case 'pending': return 'Waiting for confirmation';
          case 'confirmed': return 'Confirmed and scheduled';
          case 'in-progress': return 'Service in progress';
          case 'completed': return 'Service completed';
          case 'cancelled': return 'Booking cancelled';
          default: return 'Unknown status';
        }
      };

      const getTimeline = (status: string) => {
        const baseTimeline = [
          { step: 'Booking Received', completed: true, time: '9:00 AM', description: 'Your booking has been received and is being processed' },
          { step: 'Booking Confirmed', completed: status !== 'pending', time: '10:00 AM', description: 'Booking confirmed and scheduled with technician' },
          { step: 'Service Started', completed: ['in-progress', 'completed'].includes(status), time: '11:00 AM', description: 'Vehicle service has begun' },
          { step: 'Service in Progress', completed: status === 'completed', time: 'Est. 2:00 PM', description: 'Service work is being performed' },
          { step: 'Quality Check', completed: status === 'completed', time: 'Est. 3:30 PM', description: 'Final quality inspection and testing' },
          { step: 'Ready for Pickup', completed: status === 'completed', time: 'Est. 4:00 PM', description: 'Vehicle ready for customer pickup' },
        ];
        return baseTimeline;
      };

      setStatus({
        orderNumber: foundBooking.id.toString(),
        vehicle: foundBooking.vehicle,
        service: foundBooking.service,
        estimatedCompletion: `${foundBooking.date} at ${foundBooking.time}`,
        technician: foundBooking.assignedTechnician || 'To be assigned',
        status: getStatusDescription(foundBooking.status),
        timeline: getTimeline(foundBooking.status),
        totalCost: foundBooking.actualCost ? `$${foundBooking.actualCost}.00 CAD` : (foundBooking.estimatedCost ? `$${foundBooking.estimatedCost}.00 CAD (Estimated)` : 'TBD'),
        additionalNotes: foundBooking.notes || 'No additional notes at this time.',
        customerName: foundBooking.customerName,
        customerPhone: foundBooking.customerPhone,
        customerEmail: foundBooking.customerEmail
      });
    } else {
      // No booking found - show error or default message
      setStatus({
        error: true,
        message: 'No booking found with that order number or phone number. Please check your information and try again.'
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-matte-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            REPAIR STATUS
          </h1>
          <p className="text-gray-400 text-lg">
            Track your vehicle's service progress in real-time
          </p>
        </div>

        {!status ? (
          /* Search Form */
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
            <form onSubmit={handleStatusCheck} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-3 tracking-wider">
                    ORDER NUMBER
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="RO-123456"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-4 focus:border-acid-yellow focus:outline-none transition-colors duration-300 text-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-3 tracking-wider">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-4 focus:border-acid-yellow focus:outline-none transition-colors duration-300 text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-acid-yellow text-black py-4 rounded-sm font-bold tracking-wider text-lg hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-3"
              >
                <Search className="w-6 h-6" />
                <span>CHECK STATUS</span>
              </button>
            </form>
          </div>
        ) : (
          /* Status Display */
          <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">Order #{status.orderNumber}</h2>
                  <p className="text-gray-400 flex items-center mt-2">
                    <Car className="w-5 h-5 mr-2" />
                    {status.vehicle}
                  </p>
                </div>
                <button 
                  onClick={() => setStatus(null)}
                  className="text-acid-yellow hover:text-neon-lime transition-colors duration-300 font-medium tracking-wider"
                >
                  CHECK ANOTHER ORDER
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm tracking-wider mb-1">SERVICE</p>
                  <p className="text-white font-medium">{status.service}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm tracking-wider mb-1">TECHNICIAN</p>
                  <p className="text-white font-medium">{status.technician}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm tracking-wider mb-1">ESTIMATED COMPLETION</p>
                  <p className="text-acid-yellow font-bold">{status.estimatedCompletion}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-wide">
                SERVICE PROGRESS
              </h3>
              
              <div className="space-y-6">
                {status.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed ? 'bg-acid-yellow text-black' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : index === 3 ? (
                        <Wrench className="w-6 h-6 animate-spin" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold tracking-wide ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                          {item.step}
                        </h4>
                        <span className="text-sm text-gray-500">{item.time}</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <h3 className="text-white font-bold tracking-wider mb-4">CONTACT TECHNICIAN</h3>
                <div className="space-y-3">
                  <button className="w-full bg-acid-yellow text-black py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>CALL TECHNICIAN</span>
                  </button>
                  <button className="w-full bg-white/10 text-white py-3 rounded-sm font-medium tracking-wider hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>SEND MESSAGE</span>
                  </button>
                </div>
              </div>

              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <h3 className="text-white font-bold tracking-wider mb-4">SERVICE DETAILS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-acid-yellow font-bold">{status.totalCost}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-gray-400 text-sm">{status.additionalNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairStatusPage;
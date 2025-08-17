import React, { useState } from 'react';
import { Calendar, Clock, User, Car, Phone, Mail } from 'lucide-react';
import Toast from '../components/ui/Toast';
import { useBookings } from '../contexts/BookingContext';

const BookingPage: React.FC = () => {
  const { addBooking } = useBookings();
  const [step, setStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    vehicle: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const services = [
    'Oil Change',
    'Brake Service',
    'Engine Diagnostics',
    'Performance Tune',
    'Safety Inspection',
    'Transmission Service',
    'AC Service',
    'Tire Service'
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.service || !formData.date || !formData.time || !formData.name || !formData.phone || !formData.email || !formData.vehicle) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Add booking to shared context
    try {
      addBooking({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        service: formData.service,
        vehicle: formData.vehicle,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        notes: formData.notes
      });
      
      setToastMessage('Booking confirmed! We\'ll send you a confirmation email shortly.');
      setToastType('success');
      setShowToast(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setStep(1);
        setFormData({
          service: '',
          date: '',
          time: '',
          vehicle: '',
          name: '',
          email: '',
          phone: '',
          notes: ''
        });
      }, 2000);
    } catch (error) {
      setToastMessage('Failed to submit booking. Please try again or call us directly.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-matte-black">
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            BOOK SERVICE
          </h1>
          <p className="text-gray-400 text-lg">
            Schedule your appointment in three easy steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNum ? 'bg-acid-yellow text-black' : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNum ? 'bg-acid-yellow' : 'bg-gray-700'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white tracking-wide flex items-center">
                  <Car className="w-6 h-6 text-acid-yellow mr-3" />
                  SELECT SERVICE
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setFormData({...formData, service})}
                      className={`p-4 border rounded-lg text-left transition-all duration-300 ${
                        formData.service === service
                          ? 'border-acid-yellow bg-acid-yellow/5 text-white'
                          : 'border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white tracking-wide flex items-center">
                  <Calendar className="w-6 h-6 text-acid-yellow mr-3" />
                  SELECT DATE & TIME
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                      PREFERRED DATE
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
                      AVAILABLE TIMES
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({...formData, time})}
                          className={`p-2 text-sm rounded-sm transition-all duration-300 ${
                            formData.time === time
                              ? 'bg-acid-yellow text-black'
                              : 'bg-gray-800 text-white hover:bg-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white tracking-wide flex items-center">
                  <User className="w-6 h-6 text-acid-yellow mr-3" />
                  CONTACT INFORMATION
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>
                  
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Vehicle (Year, Make, Model)"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                    required
                  />
                  
                  <textarea
                    placeholder="Additional Notes (Optional)"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                  ></textarea>
                </div>

                {/* Booking Summary */}
                <div className="bg-matte-black border border-gray-800 rounded-lg p-6">
                  <h3 className="text-white font-bold tracking-wider mb-4">BOOKING SUMMARY</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service:</span>
                      <span className="text-white">{formData.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white">{formData.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-700 text-white px-6 py-3 rounded-sm font-medium tracking-wider hover:bg-gray-600 transition-colors duration-300"
                >
                  BACK
                </button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !formData.service) ||
                      (step === 2 && (!formData.date || !formData.time))
                    }
                    className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CONTINUE
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-acid-yellow text-black px-8 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300"
                  >
                    CONFIRM BOOKING
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
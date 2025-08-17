import React from 'react';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import FormValidation, { useFormValidation } from '../components/ui/FormValidation';
import Toast from '../components/ui/Toast';

const ContactPage: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const validationRules = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: { 
      required: true, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (!value.includes('@')) return 'Please enter a valid email address';
        return null;
      }
    },
    phone: { 
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      custom: (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length < 10) return 'Phone number must be at least 10 digits';
        return null;
      }
    },
    subject: { required: true },
    message: { required: true, minLength: 10 }
  };

  const handleFormSubmit = async (formData: FormData, isValid: boolean) => {
    if (!isValid) {
      setToastMessage('Please fix the form errors before submitting');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setToastMessage('Message sent successfully! We\'ll get back to you within 24 hours.');
      setToastType('success');
      setShowToast(true);
      
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      form?.reset();
    } catch (error) {
      setToastMessage('Failed to send message. Please try again or call us directly.');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
            GET IN TOUCH
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to experience precision automotive service? Contact our expert team today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
                SEND MESSAGE
              </h2>
              <p className="text-gray-400">
                Get a personalized response within 24 hours
              </p>
            </div>

            <FormValidation
              validationRules={validationRules}
              onSubmit={handleFormSubmit}
              className="bg-dark-graphite border border-gray-800 rounded-lg p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>
              
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />
              
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />
              
              <select 
                name="subject"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              >
                <option>Subject</option>
                <option>Vehicle Purchase Inquiry</option>
                <option>Service Booking</option>
                <option>Parts & Accessories</option>
                <option>Finance & Trade-In</option>
                <option>General Question</option>
              </select>
              
              <textarea
                name="message"
                placeholder="Your Message"
                rows={6}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
                required
              ></textarea>

              <button
                type="submit"
                className="w-full bg-acid-yellow text-black py-4 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>SEND MESSAGE</span>
              </button>
            </FormValidation>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
                CONTACT INFO
              </h2>
              <p className="text-gray-400">
                Multiple ways to reach our expert team
              </p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-acid-yellow/10 rounded-sm">
                    <MapPin className="w-6 h-6 text-acid-yellow" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide mb-2">SHOWROOM & SERVICE CENTER</h3>
                    <p className="text-gray-400 leading-relaxed">
                      179 Weston Rd<br />
                      Toronto, ON<br />
                      M6N 3A5, Canada
                    </p>
                    <a href="https://maps.google.com/?q=179+Weston+Rd,+Toronto,+ON+M6N+3A5" target="_blank" rel="noopener noreferrer" className="text-acid-yellow hover:text-neon-lime transition-colors duration-300 font-medium mt-3">
                      GET DIRECTIONS →
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-acid-yellow/10 rounded-sm">
                    <Phone className="w-6 h-6 text-acid-yellow" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide mb-2">PHONE SUPPORT</h3>
                    <div className="space-y-1">
                      <a 
                        href="tel:+14169166475"
                        className="block text-gray-400 hover:text-acid-yellow transition-colors duration-300"
                      >
                        Main Line: (416) 916-6475
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-acid-yellow/10 rounded-sm">
                    <Mail className="w-6 h-6 text-acid-yellow" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide mb-2">EMAIL SUPPORT</h3>
                    <div className="space-y-1">
                      <a 
                        href="tel:+14169166475"
                        className="block text-gray-400 hover:text-acid-yellow transition-colors duration-300"
                      >
                        Call for email contact
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-acid-yellow/10 rounded-sm">
                    <Clock className="w-6 h-6 text-acid-yellow" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide mb-2">BUSINESS HOURS</h3>
                    <div className="space-y-2 text-gray-400">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:30 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>9:30 AM - 3:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-500 font-medium">CURRENTLY OPEN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
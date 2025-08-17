import React, { useState } from 'react';
import { Calendar, Clock, User, Car, Phone, Mail, CheckCircle, XCircle, Search, Filter, Plus, Edit } from 'lucide-react';
import Toast from '../ui/Toast';
import { useBookings, Booking } from '../../contexts/BookingContext';

const BookingManager: React.FC = () => {
  const { bookings, addBooking, updateBooking, deleteBooking, updateBookingStatus } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'confirmed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'in-progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleUpdateBookingStatus = (id: number, newStatus: Booking['status']) => {
    updateBookingStatus(id, newStatus);
    setToastMessage(`Booking status updated to ${newStatus}`);
    setToastType('success');
    setShowToast(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = selectedDate === '' || booking.date === selectedDate;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const newBookingData = {
        customerName: formData.get('customerName') as string,
        customerPhone: formData.get('customerPhone') as string,
        customerEmail: formData.get('customerEmail') as string,
        service: formData.get('service') as string,
        vehicle: formData.get('vehicle') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        notes: formData.get('notes') as string,
        estimatedCost: parseInt(formData.get('estimatedCost') as string) || 0
      };

      addBooking(newBookingData);
      setShowAddForm(false);
      setToastMessage('Booking added successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setToastMessage('Failed to add booking. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Validate required fields
      const customerName = formData.get('customerName') as string;
      const service = formData.get('service') as string;
      const date = formData.get('date') as string;
      const time = formData.get('time') as string;
      
      if (!customerName || !service || !date || !time) {
        setToastMessage('Please fill in all required fields');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      const updates = {
        customerName,
        customerPhone: formData.get('customerPhone') as string,
        customerEmail: formData.get('customerEmail') as string,
        service,
        vehicle: formData.get('vehicle') as string,
        date,
        time,
        status: formData.get('status') as Booking['status'],
        notes: formData.get('notes') as string,
        estimatedCost: parseInt(formData.get('estimatedCost') as string) || 0,
        actualCost: parseInt(formData.get('actualCost') as string) || undefined,
        assignedTechnician: formData.get('assignedTechnician') as string
      };

      updateBooking(editingBooking.id, updates);
      setEditingBooking(null);
      setToastMessage('Booking updated successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update booking. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteBooking = (id: number) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        deleteBooking(id);
        setToastMessage('Booking deleted successfully!');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        setToastMessage('Failed to delete booking. Please try again.');
        setToastType('error');
        setShowToast(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Bookings</h2>
          <p className="text-gray-400 mt-1">Manage customer appointments and service schedules</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>ADD BOOKING</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings by customer, service, vehicle, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-matte-black border border-gray-700 text-white rounded-sm pl-12 pr-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
            />
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
          <div className="flex space-x-4">
            <span>Pending: {bookings.filter(b => b.status === 'pending').length}</span>
            <span>Today: {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}</span>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">No Bookings Found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedDate || filterStatus !== 'all' 
                ? 'No bookings match your search criteria.' 
                : 'No bookings scheduled yet.'
              }
            </p>
            {(searchTerm || selectedDate || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate('');
                  setFilterStatus('all');
                }}
                className="mt-4 bg-acid-yellow text-black px-6 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-300">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">{booking.service}</h3>
                    <span className={`px-3 py-1 rounded-sm text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="w-4 h-4 text-acid-yellow" />
                      <span>{booking.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Phone className="w-4 h-4 text-acid-yellow" />
                      <span>{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="w-4 h-4 text-acid-yellow" />
                      <span className="truncate">{booking.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Car className="w-4 h-4 text-acid-yellow" />
                      <span>{booking.vehicle}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-acid-yellow" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-4 h-4 text-acid-yellow" />
                      <span>{booking.time}</span>
                    </div>
                  </div>

                  {booking.assignedTechnician && (
                    <div className="bg-matte-black border border-gray-700 rounded-sm p-3">
                      <p className="text-gray-400 text-sm">
                        <strong>Technician:</strong> {booking.assignedTechnician}
                      </p>
                    </div>
                  )}
                  
                  {booking.notes && (
                    <div className="bg-matte-black border border-gray-700 rounded-sm p-3">
                      <p className="text-gray-400 text-sm">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}

                  {(booking.estimatedCost || booking.actualCost) && (
                    <div className="flex space-x-4 text-sm">
                      {booking.estimatedCost && (
                        <span className="text-gray-400">
                          Estimated: <span className="text-acid-yellow font-medium">${booking.estimatedCost}</span>
                        </span>
                      )}
                      {booking.actualCost && (
                        <span className="text-gray-400">
                          Actual: <span className="text-green-400 font-medium">${booking.actualCost}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                        className="bg-green-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-green-600 transition-colors duration-300 flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>CONFIRM</span>
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                        className="bg-red-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-red-600 transition-colors duration-300 flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>CANCEL</span>
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking.id, 'in-progress')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-blue-600 transition-colors duration-300"
                    >
                      START SERVICE
                    </button>
                  )}
                  
                  {booking.status === 'in-progress' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                      className="bg-acid-yellow text-black px-4 py-2 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                    >
                      COMPLETE
                    </button>
                  )}
                  
                  <button
                    onClick={() => setEditingBooking(booking)}
                    className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>EDIT</span>
                  </button>
                  
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="bg-white/10 text-white px-4 py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>CALL</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Booking Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">ADD NEW BOOKING</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="customerName"
                  type="text"
                  placeholder="Customer Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="customerPhone"
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <input
                name="customerEmail"
                type="email"
                placeholder="Email Address"
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="service"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Service</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Engine Diagnostics">Engine Diagnostics</option>
                  <option value="Performance Tune">Performance Tune</option>
                  <option value="Safety Inspection">Safety Inspection</option>
                  <option value="Transmission Service">Transmission Service</option>
                  <option value="AC Service">AC Service</option>
                  <option value="Tire Service">Tire Service</option>
                </select>
                <input
                  name="vehicle"
                  type="text"
                  placeholder="Vehicle (Year Make Model)"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <select
                  name="time"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
                <input
                  name="estimatedCost"
                  type="number"
                  placeholder="Estimated Cost ($)"
                  min="0"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <textarea
                name="notes"
                placeholder="Booking Notes (Optional)"
                rows={3}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
              ></textarea>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  ADD BOOKING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">EDIT BOOKING</h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="customerName"
                  type="text"
                  placeholder="Customer Name"
                  defaultValue={editingBooking.customerName}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="customerPhone"
                  type="tel"
                  placeholder="Phone Number"
                  defaultValue={editingBooking.customerPhone}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <input
                name="customerEmail"
                type="email"
                placeholder="Email Address"
                defaultValue={editingBooking.customerEmail}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="service"
                  defaultValue={editingBooking.service}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Engine Diagnostics">Engine Diagnostics</option>
                  <option value="Performance Tune">Performance Tune</option>
                  <option value="Safety Inspection">Safety Inspection</option>
                  <option value="Transmission Service">Transmission Service</option>
                  <option value="AC Service">AC Service</option>
                  <option value="Tire Service">Tire Service</option>
                </select>
                <input
                  name="vehicle"
                  type="text"
                  placeholder="Vehicle"
                  defaultValue={editingBooking.vehicle}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="date"
                  type="date"
                  defaultValue={editingBooking.date}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <select
                  name="time"
                  defaultValue={editingBooking.time}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                >
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  name="status"
                  defaultValue={editingBooking.status}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  name="estimatedCost"
                  type="number"
                  placeholder="Estimated Cost"
                  defaultValue={editingBooking.estimatedCost}
                  min="0"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
                <input
                  name="actualCost"
                  type="number"
                  placeholder="Actual Cost"
                  defaultValue={editingBooking.actualCost}
                  min="0"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <input
                name="assignedTechnician"
                type="text"
                placeholder="Assigned Technician"
                defaultValue={editingBooking.assignedTechnician}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              />

              <textarea
                name="notes"
                placeholder="Booking Notes"
                rows={3}
                defaultValue={editingBooking.notes}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
              ></textarea>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(editingBooking.id)}
                  className="bg-red-500 text-white px-4 py-3 rounded-sm font-medium hover:bg-red-600 transition-colors duration-300"
                >
                  DELETE
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-sm font-medium hover:bg-gray-600 transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black py-3 rounded-sm font-bold hover:bg-neon-lime transition-colors duration-300"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;
import React from 'react';
import { useVehicles, Vehicle } from '../contexts/VehicleContext';
import { useBookings, Booking } from '../contexts/BookingContext';
import { useContent, ContentSection } from '../contexts/ContentContext';

const AdminCrudTestPage: React.FC = () => {
  // --- VEHICLES ---
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, refreshVehicles } = useVehicles();

  const handleAddVehicle = () => {
    console.log('---[ VEHICLE CRUD ]---');
    const newVehicle: Partial<Vehicle> = {
      make: 'TestMake',
      model: 'TestModel',
      year: new Date().getFullYear(),
      price: 50000,
      mileage: 100,
      status: 'available',
      images: [],
      description: `A test vehicle added at ${new Date().toLocaleTimeString()}`,
    };
    console.log('CREATE: Adding new vehicle...', newVehicle);
    addVehicle(newVehicle);
  };

  const handleUpdateVehicle = () => {
    console.log('---[ VEHICLE CRUD ]---');
    if (vehicles.length === 0) {
      console.log('UPDATE: No vehicles to update.');
      return;
    }
    const firstVehicle = vehicles[0];
    const updates: Partial<Vehicle> = {
      price: firstVehicle.price + 1000,
      description: `Updated at ${new Date().toLocaleTimeString()}`,
    };
    console.log(`UPDATE: Updating vehicle ID ${firstVehicle.id} with...`, updates);
    updateVehicle(firstVehicle.id, updates);
  };

  const handleDeleteVehicle = () => {
    console.log('---[ VEHICLE CRUD ]---');
    if (vehicles.length === 0) {
      console.log('DELETE: No vehicles to delete.');
      return;
    }
    const firstVehicle = vehicles[0];
    console.log(`DELETE: Deleting vehicle ID ${firstVehicle.id}...`);
    deleteVehicle(firstVehicle.id);
  };

  // --- BOOKINGS ---
  const { bookings, addBooking, updateBooking, deleteBooking, refreshBookings } = useBookings();

  const handleAddBooking = () => {
    console.log('---[ BOOKING CRUD ]---');
    const newBooking: Omit<Booking, 'id' | 'createdAt'> = {
      customerName: 'Test Customer',
      customerPhone: '555-555-5555',
      customerEmail: 'test@test.com',
      service: 'Test Service',
      vehicle: 'Test Vehicle',
      date: new Date().toISOString().split('T')[0],
      time: '12:00 PM',
      status: 'pending',
      notes: `A test booking added at ${new Date().toLocaleTimeString()}`,
    };
    console.log('CREATE: Adding new booking...', newBooking);
    addBooking(newBooking);
  };

  const handleUpdateBooking = () => {
    console.log('---[ BOOKING CRUD ]---');
    if (bookings.length === 0) {
      console.log('UPDATE: No bookings to update.');
      return;
    }
    const firstBooking = bookings[0];
    const updates: Partial<Booking> = {
      status: 'confirmed',
      notes: `Updated at ${new Date().toLocaleTimeString()}`,
    };
    console.log(`UPDATE: Updating booking ID ${firstBooking.id} with...`, updates);
    updateBooking(firstBooking.id, updates);
  };

  const handleDeleteBooking = () => {
    console.log('---[ BOOKING CRUD ]---');
    if (bookings.length === 0) {
      console.log('DELETE: No bookings to delete.');
      return;
    }
    const firstBooking = bookings[0];
    console.log(`DELETE: Deleting booking ID ${firstBooking.id}...`);
    deleteBooking(firstBooking.id);
  };

  // --- CONTENT ---
  const { sections, addSection, updateSection, deleteSection, refreshSections } = useContent();

  const handleAddSection = () => {
    console.log('---[ CONTENT CRUD ]---');
    const newSection: Omit<ContentSection, 'id'> = {
        type: 'promo',
        title: 'Test Section',
        visible: true,
        order: 99,
        content: {
            heading: `Test Section Added at ${new Date().toLocaleTimeString()}`
        }
    };
    console.log('CREATE: Adding new section...', newSection);
    addSection(newSection);
  };

  const handleUpdateSection = () => {
    console.log('---[ CONTENT CRUD ]---');
    if (sections.length === 0) {
        console.log('UPDATE: No sections to update.');
        return;
    }
    const firstSection = sections[0];
    const updates: Partial<ContentSection> = {
        title: `Updated at ${new Date().toLocaleTimeString()}`,
    };
    console.log(`UPDATE: Updating section ID ${firstSection.id} with...`, updates);
    updateSection(firstSection.id, updates);
  };

  const handleDeleteSection = () => {
    console.log('---[ CONTENT CRUD ]---');
    if (sections.length === 0) {
        console.log('DELETE: No sections to delete.');
        return;
    }
    const firstSection = sections[0];
    console.log(`DELETE: Deleting section ID ${firstSection.id}...`);
    deleteSection(firstSection.id);
  };


  const mainButtonClass = "bg-acid-yellow text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200";
  const secondaryButtonClass = "bg-gray-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200";
  const refreshButtonClass = "bg-blue-600/50 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600/80 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-matte-black text-white p-8 font-sans">
      <h1 className="text-4xl font-bold text-acid-yellow mb-4">Admin CRUD Test Page</h1>
      <p className="text-gray-400 mb-8">
        Use this page to test Create, Read, Update, and Delete operations. Open the developer console to see detailed logs.
      </p>

      {/* VEHICLES */}
      <div className="bg-dark-graphite p-6 rounded-lg mb-8 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            <span>Vehicles</span>
            <button onClick={() => { console.log("Refreshing vehicles..."); refreshVehicles(); }} className={refreshButtonClass}>Refresh</button>
        </h2>
        <div className="flex space-x-4 mb-4">
          <button onClick={handleAddVehicle} className={mainButtonClass}>CREATE Vehicle</button>
          <button onClick={handleUpdateVehicle} className={secondaryButtonClass}>UPDATE First Vehicle</button>
          <button onClick={handleDeleteVehicle} className={secondaryButtonClass}>DELETE First Vehicle</button>
        </div>
        <div className="bg-matte-black p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-bold mb-2">Current Vehicles ({vehicles.length}):</h3>
            {vehicles.map(v => (
                <div key={v.id} className="p-2 border-b border-gray-700 text-sm">
                    <p><b>{v.year} {v.make} {v.model}</b> - ${v.price}</p>
                    <p className="text-gray-400">ID: {v.id} | Status: {v.status}</p>
                    <p className="text-gray-400">Desc: {v.description}</p>
                </div>
            ))}
        </div>
      </div>

      {/* BOOKINGS */}
      <div className="bg-dark-graphite p-6 rounded-lg mb-8 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            <span>Bookings</span>
            <button onClick={() => { console.log("Refreshing bookings..."); refreshBookings(); }} className={refreshButtonClass}>Refresh</button>
        </h2>
        <div className="flex space-x-4 mb-4">
          <button onClick={handleAddBooking} className={mainButtonClass}>CREATE Booking</button>
          <button onClick={handleUpdateBooking} className={secondaryButtonClass}>UPDATE First Booking</button>
          <button onClick={handleDeleteBooking} className={secondaryButtonClass}>DELETE First Booking</button>
        </div>
        <div className="bg-matte-black p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-bold mb-2">Current Bookings ({bookings.length}):</h3>
            {bookings.map(b => (
                <div key={b.id} className="p-2 border-b border-gray-700 text-sm">
                    <p><b>{b.service} for {b.customerName}</b> - {b.date} @ {b.time}</p>
                    <p className="text-gray-400">ID: {b.id} | Status: {b.status}</p>
                    <p className="text-gray-400">Notes: {b.notes}</p>
                </div>
            ))}
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="bg-dark-graphite p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            <span>Content Sections</span>
            <button onClick={() => { console.log("Refreshing sections..."); refreshSections(); }} className={refreshButtonClass}>Refresh</button>
        </h2>
        <div className="flex space-x-4 mb-4">
          <button onClick={handleAddSection} className={mainButtonClass}>CREATE Section</button>
          <button onClick={handleUpdateSection} className={secondaryButtonClass}>UPDATE First Section</button>
          <button onClick={handleDeleteSection} className={secondaryButtonClass}>DELETE First Section</button>
        </div>
        <div className="bg-matte-black p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-bold mb-2">Current Sections ({sections.length}):</h3>
            {sections.map(s => (
                <div key={s.id} className="p-2 border-b border-gray-700 text-sm">
                    <p><b>{s.title}</b> (Type: {s.type})</p>
                    <p className="text-gray-400">ID: {s.id} | Visible: {s.visible ? 'Yes' : 'No'} | Order: {s.sort_order}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCrudTestPage;

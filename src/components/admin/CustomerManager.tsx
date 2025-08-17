import React, { useState } from 'react';
import { Search, Filter, Phone, Mail, Car, Calendar, DollarSign, Edit, Trash2, Plus, Eye, UserPlus } from 'lucide-react';
import Toast from '../ui/Toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicles: string[];
  totalSpent: number;
  lastService: string;
  status: 'active' | 'inactive' | 'vip';
  joinDate: string;
  address?: string;
  notes?: string;
}

const CustomerManager: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(416) 555-0123',
      vehicles: ['2020 BMW M3', '2018 Audi A4'],
      totalSpent: 4500,
      lastService: '2024-01-10',
      status: 'vip',
      joinDate: '2022-03-15',
      address: '123 Main St, Toronto, ON',
      notes: 'Prefers premium services, loyal customer'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(416) 555-0456',
      vehicles: ['2021 Mercedes C300'],
      totalSpent: 2800,
      lastService: '2024-01-08',
      status: 'active',
      joinDate: '2023-01-20',
      address: '456 Oak Ave, Toronto, ON',
      notes: 'Regular maintenance customer'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@email.com',
      phone: '(416) 555-0789',
      vehicles: ['2019 Porsche 911'],
      totalSpent: 6200,
      lastService: '2023-12-15',
      status: 'active',
      joinDate: '2021-08-10',
      address: '789 Pine St, Toronto, ON',
      notes: 'Performance enthusiast, track day regular'
    },
    {
      id: 4,
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '(416) 555-0321',
      vehicles: ['2022 BMW M4', '2020 Audi RS6'],
      totalSpent: 8900,
      lastService: '2024-01-12',
      status: 'vip',
      joinDate: '2020-05-15',
      address: '321 Elm St, Toronto, ON',
      notes: 'High-value customer, multiple vehicles'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '(416) 555-0654',
      vehicles: ['2021 Mercedes AMG GT'],
      totalSpent: 3200,
      lastService: '2023-11-20',
      status: 'active',
      joinDate: '2022-09-10',
      address: '654 Maple Ave, Toronto, ON',
      notes: 'Seasonal customer, winter storage'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'text-acid-yellow bg-acid-yellow/10 border-acid-yellow/20';
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'inactive': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.vehicles.some(vehicle => 
                           vehicle.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const newCustomer: Customer = {
        id: Date.now(),
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        vehicles: [],
        totalSpent: 0,
        lastService: 'Never',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        address: formData.get('address') as string,
        notes: formData.get('notes') as string
      };

      setCustomers([...customers, newCustomer]);
      setShowAddForm(false);
      setToastMessage('Customer added successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setToastMessage('Failed to add customer. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        status: formData.get('status') as 'active' | 'inactive' | 'vip',
        address: formData.get('address') as string,
        notes: formData.get('notes') as string
      };

      setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(null);
      setToastMessage('Customer updated successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update customer. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        setCustomers(customers.filter(c => c.id !== id));
        setToastMessage('Customer deleted successfully!');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        setToastMessage('Failed to delete customer. Please try again.');
        setToastType('error');
        setShowToast(true);
      }
    }
  };

  const addVehicleToCustomer = (customerId: number) => {
    const vehicleInfo = prompt('Enter vehicle information (Year Make Model):');
    if (vehicleInfo && vehicleInfo.trim()) {
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { ...c, vehicles: [...c.vehicles, vehicleInfo] }
          : c
      ));
      setToastMessage('Vehicle added to customer successfully!');
      setToastType('success');
      setShowToast(true);
    }
  };

  const removeVehicleFromCustomer = (customerId: number, vehicleIndex: number) => {
    if (confirm('Are you sure you want to remove this vehicle from the customer?')) {
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { ...c, vehicles: c.vehicles.filter((_, i) => i !== vehicleIndex) }
          : c
      ));
      setToastMessage('Vehicle removed from customer successfully!');
      setToastType('success');
      setShowToast(true);
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

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-gray-400 mt-1">Manage your customer database and relationships</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-acid-yellow text-black px-6 py-3 rounded-sm font-bold tracking-wider hover:bg-neon-lime transition-colors duration-300 flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>ADD CUSTOMER</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-matte-black border border-gray-700 text-white rounded-sm pl-12 pr-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
          >
            <option value="all">All Status</option>
            <option value="vip">VIP</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
          <div className="flex space-x-4">
            <span>VIP: {customers.filter(c => c.status === 'vip').length}</span>
            <span>Active: {customers.filter(c => c.status === 'active').length}</span>
            <span>Inactive: {customers.filter(c => c.status === 'inactive').length}</span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-dark-graphite border border-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-white font-bold text-xl mb-2">No Customers Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No customers in the database yet'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-acid-yellow text-black px-6 py-2 rounded-sm font-medium hover:bg-neon-lime transition-colors duration-300"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-dark-graphite border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{customer.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-sm text-xs font-medium border ${getStatusColor(customer.status)} mt-1`}>
                    {customer.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-2 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors duration-300"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-sm hover:bg-red-500/30 transition-colors duration-300"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-acid-yellow flex-shrink-0" />
                  <span className="text-sm truncate">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-acid-yellow flex-shrink-0" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Car className="w-4 h-4 text-acid-yellow flex-shrink-0" />
                  <span className="text-sm">{customer.vehicles.length} vehicle(s)</span>
                </div>
              </div>

              {/* Vehicles List */}
              {customer.vehicles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white font-medium text-sm mb-2">VEHICLES:</h4>
                  <div className="space-y-1">
                    {customer.vehicles.map((vehicle, index) => (
                      <div key={index} className="bg-matte-black border border-gray-700 rounded-sm p-2 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{vehicle}</span>
                        <button
                          onClick={() => removeVehicleFromCustomer(customer.id, index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addVehicleToCustomer(customer.id)}
                    className="mt-2 w-full bg-white/10 text-white py-1 rounded-sm text-sm font-medium hover:bg-white/20 transition-colors duration-300"
                  >
                    + ADD VEHICLE
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-matte-black rounded-sm">
                <div className="text-center">
                  <p className="text-acid-yellow font-bold text-lg">${customer.totalSpent.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm">{customer.lastService}</p>
                  <p className="text-gray-400 text-xs">Last Service</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="flex-1 bg-white/10 text-white py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>CALL</span>
                </a>
                <a
                  href={`mailto:${customer.email}`}
                  className="flex-1 bg-white/10 text-white py-2 rounded-sm font-medium hover:bg-white/20 transition-colors duration-300 flex items-center justify-center space-x-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>EMAIL</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">ADD NEW CUSTOMER</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="address"
                  type="text"
                  placeholder="Address (Optional)"
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <textarea
                name="notes"
                placeholder="Customer Notes (Optional)"
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
                  ADD CUSTOMER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">EDIT CUSTOMER</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  defaultValue={selectedCustomer.name}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  defaultValue={selectedCustomer.email}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  defaultValue={selectedCustomer.phone}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                <select
                  name="status"
                  defaultValue={selectedCustomer.status}
                  className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
                >
                  <option value="active">Active</option>
                  <option value="vip">VIP</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <input
                name="address"
                type="text"
                placeholder="Address"
                defaultValue={selectedCustomer.address}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300"
              />

              <textarea
                name="notes"
                placeholder="Customer Notes"
                rows={3}
                defaultValue={selectedCustomer.notes}
                className="w-full bg-matte-black border border-gray-700 text-white rounded-sm px-4 py-3 focus:border-acid-yellow focus:outline-none transition-colors duration-300 resize-none"
              ></textarea>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
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

export default CustomerManager;
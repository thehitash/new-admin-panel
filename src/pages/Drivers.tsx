import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  Phone,
  Mail,
  Star,
  Car,
  Calendar
} from 'lucide-react';
import { mockDrivers } from '../data/mockData';
import { Driver } from '../types';
import Modal from '../components/UI/Modal';

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    driver.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (driverId: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { ...driver, isActive: !driver.isActive, isAvailable: !driver.isActive ? false : driver.isAvailable }
        : driver
    ));
  };

  const handleToggleAvailable = (driverId: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { 
            ...driver, 
            isAvailable: !driver.isAvailable 
          }
        : driver
    ));
  };

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsEditing(false);
    setShowModal(true);
  };

  const activeDrivers = drivers.filter(d => d.isActive).length;
  const availableDrivers = drivers.filter(d => d.isActive && d.isAvailable).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAddDriver}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: drivers.length, color: 'bg-blue-500' },
          { label: 'Active Drivers', value: activeDrivers, color: 'bg-green-500' },
          { label: 'Available Now', value: availableDrivers, color: 'bg-purple-500' },
          { label: 'Avg Rating', value: (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) + '⭐', color: 'bg-yellow-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-2 h-8 rounded ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver, index) => (
                <tr key={driver.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">
                          {driver.totalRides} rides completed
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{driver.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{driver.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Car className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{driver.vehicleModel}</span>
                      </div>
                      <p className="text-sm text-gray-500">{driver.vehiclePlate}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{driver.licenseNumber}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{driver.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-sm font-medium">
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {driver.isActive && (
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-blue-400' : 'bg-gray-400'}`} />
                          <span className="text-xs text-gray-600">
                            {driver.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDriver(driver)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDriver(driver)}
                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        title="Edit Driver"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(driver.id)}
                        className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                        title={`${driver.isActive ? 'Deactivate' : 'Activate'} Driver`}
                      >
                        {driver.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {driver.isActive && (
                        <button 
                          onClick={() => handleToggleAvailable(driver.id)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title={`Mark as ${driver.isAvailable ? 'Unavailable' : 'Available'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 ${
                            driver.isAvailable ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                          }`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
            setIsEditing(false);
          }}
          title={isEditing ? (selectedDriver ? 'Edit Driver' : 'Add New Driver') : 'Driver Details'}
          size="lg"
        >
          {isEditing ? (
            <DriverForm 
              driver={selectedDriver} 
              onClose={() => {
                setShowModal(false);
                setSelectedDriver(null);
                setIsEditing(false);
              }}
              onSave={(driverData) => {
                if (selectedDriver) {
                  setDrivers(prev => prev.map(d => 
                    d.id === selectedDriver.id ? { ...d, ...driverData } : d
                  ));
                } else {
                  const newDriver: Driver = {
                    id: `d${Date.now()}`,
                    ...driverData,
                    rating: 5.0,
                    totalRides: 0,
                    joinedDate: new Date().toISOString().split('T')[0]
                  };
                  setDrivers(prev => [...prev, newDriver]);
                }
                setShowModal(false);
                setSelectedDriver(null);
                setIsEditing(false);
              }}
            />
          ) : selectedDriver ? (
            <DriverDetails driver={selectedDriver} />
          ) : null}
        </Modal>
      )}
    </div>
  );
};

const DriverForm: React.FC<{
  driver: Driver | null;
  onClose: () => void;
  onSave: (data: Partial<Driver>) => void;
}> = ({ driver, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    email: driver?.email || '',
    phone: driver?.phone || '',
    licenseNumber: driver?.licenseNumber || '',
    vehicleModel: driver?.vehicleModel || '',
    vehiclePlate: driver?.vehiclePlate || '',
    isActive: driver?.isActive ?? true,
    isAvailable: driver?.isAvailable ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
          <input
            type="text"
            value={formData.vehicleModel}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
          <input
            type="text"
            value={formData.vehiclePlate}
            onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Active Driver</span>
        </label>
        
        {formData.isActive && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Available</span>
          </label>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {driver ? 'Update Driver' : 'Add Driver'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const DriverDetails: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xl font-medium text-gray-600">
            {driver.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{driver.name}</h3>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">{driver.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">
              {driver.totalRides} rides completed
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{driver.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{driver.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                Joined {new Date(driver.joinedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Vehicle Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{driver.vehicleModel}</span>
            </div>
            <p className="text-sm text-gray-600">License Plate: {driver.vehiclePlate}</p>
            <p className="text-sm text-gray-600">License Number: {driver.licenseNumber}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Current Status</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${driver.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm font-medium text-gray-900">
              {driver.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {driver.isActive && (
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${driver.isAvailable ? 'bg-blue-400' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-900">
                {driver.isAvailable ? 'Available for rides' : 'Currently busy'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drivers;
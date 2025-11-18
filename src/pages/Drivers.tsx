import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Car,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { getDrivers, updateDriver, deleteDriver } from '../utils/apis';
import { Driver } from '../types';

interface EditFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  carName: string;
  carNumber: string;
  carModel: string;
  carColor: string;
}

const DriversNew: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    carName: '',
    carNumber: '',
    carModel: '',
    carColor: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await getDrivers();
      const driversData = data?.data || [];

      // Map drivers with car details
      const mappedDrivers = driversData.map((driver: any) => ({
        id: driver._id || driver.id,
        name: driver.fullName || driver.name || '',
        email: driver.email || '',
        phone: driver.phoneNumber || driver.phone || '',
        rating: driver.rating || 0,
        isActive: driver.isActive !== false,
        isAvailable: driver.isAvailable || false,
        totalRides: driver.totalRides || 0,
        joinedDate: driver.createdAt || new Date().toISOString(),
        // Car details
        carName: driver.carDetails?.carName || '',
        carNumber: driver.carDetails?.carNumber || '',
        carModel: driver.carDetails?.carModel || '',
        carColor: driver.carDetails?.carColor || '',
        carDetails: driver.carDetails,
        licenseNumber: driver.licenseNumber || '-',
        vehicleModel: driver.carDetails?.carModel || '-',
        vehiclePlate: driver.carDetails?.carNumber || '-',
      }));

      setDrivers(mappedDrivers);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    (driver.carName && driver.carName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (driver.carNumber && driver.carNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDriver = () => {
    navigate('/add-driver');
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      fullName: driver.name,
      email: driver.email,
      phoneNumber: driver.phone,
      carName: driver.carName || '',
      carNumber: driver.carNumber || '',
      carModel: driver.carModel || '',
      carColor: driver.carColor || '',
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDeleteModal(true);
    setError('');
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setEditLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateDriver(selectedDriver.id, editFormData);
      setSuccess('Driver updated successfully!');

      // Update local state
      setDrivers(prev => prev.map(d =>
        d.id === selectedDriver.id
          ? {
              ...d,
              name: editFormData.fullName,
              email: editFormData.email,
              phone: editFormData.phoneNumber,
              carName: editFormData.carName,
              carNumber: editFormData.carNumber,
              carModel: editFormData.carModel,
              carColor: editFormData.carColor,
            }
          : d
      ));

      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update driver');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;

    setDeleteLoading(true);
    setError('');

    try {
      const result = await deleteDriver(selectedDriver.id);

      if (result.status === false && result.message) {
        // Backend doesn't have delete endpoint
        setError(result.message);
      } else {
        setSuccess('Driver deleted successfully!');

        // Remove from local state
        setDrivers(prev => prev.filter(d => d.id !== selectedDriver.id));

        setTimeout(() => {
          setShowDeleteModal(false);
          setSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete driver');
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeDrivers = drivers.filter(d => d.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">Manage driver accounts and vehicle information</p>
        </div>
        <button
          onClick={handleAddDriver}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{drivers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeDrivers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {drivers.reduce((sum, d) => sum + d.totalRides, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or car details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No drivers found</p>
            <button
              onClick={handleAddDriver}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first driver
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.totalRides} rides</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{driver.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-1">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span>{driver.carName || '-'}</span>
                      </div>
                      <div className="text-sm text-gray-500">{driver.carNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {driver.carModel || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.carColor || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit driver"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Driver</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Name
                  </label>
                  <input
                    type="text"
                    name="carName"
                    value={editFormData.carName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Number
                  </label>
                  <input
                    type="text"
                    name="carNumber"
                    value={editFormData.carNumber}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Model
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={editFormData.carModel}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car Color
                  </label>
                  <input
                    type="text"
                    name="carColor"
                    value={editFormData.carColor}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editLoading ? 'Updating...' : 'Update Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Driver
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{selectedDriver.name}</strong>?
                This action cannot be undone.
              </p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversNew;

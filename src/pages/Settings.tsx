import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Clock, Save, Car, DollarSign } from 'lucide-react';

interface Settings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  affectedServices: string[];
  maintenanceStartTime?: string;
  maintenanceEndTime?: string;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  baseFare: number;
  baseMileageLimit: number;
  pricePerMileAfterBase: number;
  isActive: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    maintenanceMode: false,
    maintenanceMessage: 'The app is currently under maintenance. Please try again later.',
    affectedServices: ['all'],
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [vehicleUpdates, setVehicleUpdates] = useState<{ [key: string]: Partial<Vehicle> }>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Fetch current settings and vehicles
  useEffect(() => {
    fetchSettings();
    fetchVehicles();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin-user');
      const userData = token ? JSON.parse(token) : null;

      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${userData?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleToggleMaintenance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin-user');
      const userData = token ? JSON.parse(token) : null;

      const response = await fetch('/api/settings/maintenance-mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({
          maintenanceMode: !settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
          affectedServices: settings.affectedServices,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
        setMessage(data.message);
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update maintenance mode');
      }
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin-user');
      const userData = token ? JSON.parse(token) : null;

      const response = await fetch('/api/settings/maintenance-mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({
          maintenanceMode: settings.maintenanceMode,
          maintenanceMessage: settings.maintenanceMessage,
          affectedServices: settings.affectedServices,
          maintenanceStartTime: settings.maintenanceStartTime,
          maintenanceEndTime: settings.maintenanceEndTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
        setMessage('Settings saved successfully');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMessage = (newMessage: string) => {
    setSettings({ ...settings, maintenanceMessage: newMessage });
  };

  const handleServiceToggle = (service: string) => {
    let newServices = [...settings.affectedServices];
    if (service === 'all') {
      newServices = newServices.includes('all') ? [] : ['all'];
    } else {
      if (newServices.includes('all')) {
        newServices = newServices.filter(s => s !== 'all');
      }
      if (newServices.includes(service)) {
        newServices = newServices.filter(s => s !== service);
      } else {
        newServices.push(service);
      }
    }
    setSettings({ ...settings, affectedServices: newServices });
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  // Start editing a vehicle
  const handleEditVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    if (vehicle) {
      setEditingVehicle(vehicleId);
      setVehicleUpdates({
        ...vehicleUpdates,
        [vehicleId]: {
          baseFare: vehicle.baseFare,
          baseMileageLimit: vehicle.baseMileageLimit,
          pricePerMileAfterBase: vehicle.pricePerMileAfterBase,
        }
      });
    }
  };

  // Update vehicle field
  const handleVehicleFieldChange = (vehicleId: string, field: keyof Vehicle, value: number) => {
    setVehicleUpdates({
      ...vehicleUpdates,
      [vehicleId]: {
        ...vehicleUpdates[vehicleId],
        [field]: value
      }
    });
  };

  // Save vehicle pricing
  const handleSaveVehicle = async (vehicleId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin-user');
      const userData = token ? JSON.parse(token) : null;

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify(vehicleUpdates[vehicleId]),
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(vehicles.map(v => v._id === vehicleId ? data.data : v));
        setEditingVehicle(null);
        setMessage('Vehicle pricing updated successfully');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update vehicle');
      }
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </p>
        </div>
      )}

      {/* Maintenance Mode Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Maintenance Mode</h2>
              <p className="text-sm text-gray-600">Control when the app is in maintenance</p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
              settings.maintenanceMode
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {settings.maintenanceMode ? (
              <span className="flex items-center space-x-2">
                <X className="w-4 h-4" />
                <span>Disable Maintenance</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Enable Maintenance</span>
              </span>
            )}
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-green-500'
              }`}
            />
            <span className="font-medium text-gray-900">
              {settings.maintenanceMode ? 'Maintenance Mode: ACTIVE' : 'Maintenance Mode: INACTIVE'}
            </span>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Message
          </label>
          <textarea
            value={settings.maintenanceMessage}
            onChange={(e) => handleUpdateMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter the message users will see during maintenance"
          />
          <p className="text-xs text-gray-500 mt-2">
            This message will be shown to users when maintenance mode is enabled
          </p>
        </div>

        {/* Affected Services */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Affected Services
          </label>
          <div className="space-y-2">
            {['all', 'bookings', 'payments', 'notifications'].map((service) => (
              <label key={service} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.affectedServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 capitalize">{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scheduled Maintenance (Optional) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Start Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={settings.maintenanceStartTime || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maintenanceStartTime: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              End Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={settings.maintenanceEndTime || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maintenanceEndTime: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          onClick={handleUpdateSettings}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Vehicle Pricing Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Pricing</h2>
            <p className="text-sm text-gray-600">Manage base fares and per-mile pricing for all vehicles</p>
          </div>
        </div>

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600">
                      {vehicle.capacity} Seater • {vehicle.type}
                    </p>
                  </div>
                </div>
                {editingVehicle !== vehicle._id && (
                  <button
                    onClick={() => handleEditVehicle(vehicle._id)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit Pricing
                  </button>
                )}
              </div>

              {editingVehicle === vehicle._id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Fare (£)
                      </label>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={vehicleUpdates[vehicle._id]?.baseFare || vehicle.baseFare}
                        onChange={(e) =>
                          handleVehicleFieldChange(vehicle._id, 'baseFare', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Miles Limit
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={vehicleUpdates[vehicle._id]?.baseMileageLimit || vehicle.baseMileageLimit}
                        onChange={(e) =>
                          handleVehicleFieldChange(vehicle._id, 'baseMileageLimit', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        £ per Mile After
                      </label>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={
                          vehicleUpdates[vehicle._id]?.pricePerMileAfterBase ||
                          vehicle.pricePerMileAfterBase
                        }
                        onChange={(e) =>
                          handleVehicleFieldChange(
                            vehicle._id,
                            'pricePerMileAfterBase',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSaveVehicle(vehicle._id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Pricing Example:</strong> First{' '}
                      {vehicleUpdates[vehicle._id]?.baseMileageLimit || vehicle.baseMileageLimit} miles
                      = £{vehicleUpdates[vehicle._id]?.baseFare || vehicle.baseFare}. Each additional
                      mile = £
                      {vehicleUpdates[vehicle._id]?.pricePerMileAfterBase ||
                        vehicle.pricePerMileAfterBase}
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Base Fare</p>
                    <p className="text-lg font-semibold text-gray-900">£{vehicle.baseFare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Base Miles Limit</p>
                    <p className="text-lg font-semibold text-gray-900">{vehicle.baseMileageLimit} mi</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Per Mile After</p>
                    <p className="text-lg font-semibold text-gray-900">
                      £{vehicle.pricePerMileAfterBase.toFixed(2)}/mi
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;

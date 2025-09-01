import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  UserPlus, 
  Check, 
  X,
  MapPin,
  Clock
} from 'lucide-react';
// import { mockRides, mockDrivers } from '../data/mockData';
import { getRides, getDrivers } from '../utils/apis';
import { Ride, Driver } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import Modal from '../components/UI/Modal';

// --- Generic API shapes (loose) ---
type ApiRide = Record<string, any>;
type ApiDriver = {
  id: number | string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phonenumber?: string | null;
  status?: boolean;   // active?
  isAvailable?: boolean;
  createdAt?: string | null;
  created_at?: string | null;
};

// --- Normalizers to match your UI types exactly ---
function normalizeDriver(u: ApiDriver): Driver {
  const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
  const name = fullName || u.phonenumber || u.email || `ID ${u.id}`;

  return {
    id: String(u.id),
    name,
    email: u.email ?? '-',
    phone: u.phonenumber ?? '-',
    vehicleModel: '-',     // fill when backend provides
    vehiclePlate: '-',     // fill when backend provides
    licenseNumber: '-',    // fill when backend provides
    rating: 0,             // fill when backend provides
    totalRides: 0,         // fill when backend provides
    joinedDate: (u.createdAt || u.created_at || new Date().toISOString()).toString(),
    isActive: u.status ?? true,
    isAvailable: u.isAvailable ?? (u.status ?? true),
  };
}

function normalizeRide(r: ApiRide): Ride {
  const id = String(
    r.id ?? r.rideId ?? r.ride_id ?? r.reference ?? `${Date.now()}-${Math.random()}`
  );

  // Customer name inference
  const first = r.customerFirstName ?? r.first_name ?? r.user_first_name ?? r.user?.first_name;
  const last  = r.customerLastName ?? r.last_name ?? r.user_last_name ?? r.user?.last_name;
  const customerName =
    r.customerName ?? (
      [first, last].filter(Boolean).join(' ').trim() ||
      r.user?.name ||
      r.customer?.name ||
      r.user?.phonenumber ||
      r.user?.email ||
      'Customer'
    );

  // Driver inference
  const driverFirst = r.driverFirstName ?? r.driver?.first_name;
  const driverLast  = r.driverLastName ?? r.driver?.last_name;
  const driverName =
    r.driverName ?? (
      [driverFirst, driverLast].filter(Boolean).join(' ').trim() ||
      r.driver?.name ||
      ''
    );

  // Route inference
  const from = r.from ?? r.pickup ?? r.start ?? r.pickupAddress ?? r.source ?? '-';
  const to   = r.to ?? r.dropoff ?? r.end ?? r.dropoffAddress ?? r.destination ?? '-';

  // Time fields
  const requestedAt = (r.requestedAt ?? r.createdAt ?? r.date ?? new Date().toISOString()).toString();
  const completedAt = r.completedAt ?? r.endTime ?? null;

  // Financial / meta
  const cost = Number(r.cost ?? r.fare ?? r.amount ?? r.price ?? 0);
  const distance = r.distance ?? r.km ?? r.miles ?? '-';
  const duration = r.duration ?? r.time ?? '-';
  const status = (r.status ?? 'pending') as Ride['status'];

  return {
    id,
    customerId: String(r.customerId ?? r.user_id ?? r.customer_id ?? ''),
    customerName,
    driverId: r.driverId ? String(r.driverId) : (r.driver?.id ? String(r.driver.id) : ''),
    driverName,
    from,
    to,
    cost,
    distance,
    duration,
    status,
    requestedAt,
    completedAt: completedAt ? String(completedAt) : undefined,
  };
}

const Rides: React.FC = () => {
  // Swap mock data with live state (same variable names used by your JSX)
  const [rides, setRides] = useState<Ride[]>([]);
  const [mockDrivers, setMockDrivers] = useState<Driver[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

  // Fetch from API once
  useEffect(() => {
    let mounted = true;

    getRides()
      .then((data) => {
        const items: ApiRide[] = (data?.items ?? data ?? []);
        const mapped = items.map(normalizeRide);
        if (mounted) setRides(mapped);
      })
      .catch(() => { /* optional: toast */ });

    getDrivers()
      .then((data) => {
        const items: ApiDriver[] = (data?.items ?? data ?? []);
        const mapped = items.map(normalizeDriver);
        if (mounted) setMockDrivers(mapped);
      })
      .catch(() => { /* optional: toast */ });

    return () => { mounted = false; };
  }, []);

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride.from || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride.to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const availableDrivers = mockDrivers.filter(driver => 
    driver.isActive && driver.isAvailable
  );

  const handleConfirmRide = (rideId: string) => {
    setRides(prev => prev.map(ride => 
      ride.id === rideId ? { ...ride, status: 'confirmed' as const } : ride
    ));
  };

  const handleCancelRide = (rideId: string) => {
    setRides(prev => prev.map(ride => 
      ride.id === rideId ? { ...ride, status: 'cancelled' as const } : ride
    ));
  };

  const handleAssignDriver = () => {
    if (selectedRide && selectedDriver) {
      const driver = mockDrivers.find(d => d.id === selectedDriver);
      if (driver) {
        setRides(prev => prev.map(ride => 
          ride.id === selectedRide.id ? { 
            ...ride, 
            driverId: driver.id,
            driverName: driver.name,
            status: 'confirmed' as const
          } : ride
        ));
        // In real app: also PATCH backend to persist the assignment
        console.log(`Driver ${driver.name} assigned to ride ${selectedRide.id}`);
      }
    }
    setShowAssignModal(false);
    setSelectedRide(null);
    setSelectedDriver('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ride Management</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rides', value: rides.length, color: 'bg-blue-500' },
          { label: 'Pending', value: rides.filter(r => r.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'In Progress', value: rides.filter(r => r.status === 'in-progress').length, color: 'bg-purple-500' },
          { label: 'Completed', value: rides.filter(r => r.status === 'completed').length, color: 'bg-green-500' }
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

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ride Details
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
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
              {filteredRides.map((ride, index) => (
                <tr key={ride.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{ride.id.toUpperCase()}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(ride.requestedAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{ride.customerName}</p>
                  </td>
                  <td className="py-4 px-6">
                    {ride.driverName ? (
                      <p className="text-sm text-gray-900">{ride.driverName}</p>
                    ) : (
                      <span className="text-sm text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <MapPin className="w-3 h-3 text-green-500 mr-1" />
                        <span className="truncate max-w-32">{ride.from}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-red-500 mr-1" />
                        <span className="truncate max-w-32">{ride.to}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">€{ride.cost.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{ride.distance} miles</p>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={ride.status} size="sm" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedRide(ride)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {ride.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleConfirmRide(ride.id)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title="Confirm Ride"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowAssignModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Assign Driver"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {(ride.status === 'pending' || ride.status === 'confirmed') && (
                        <button 
                          onClick={() => handleCancelRide(ride.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Cancel Ride"
                        >
                          <X className="w-4 h-4" />
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

      {/* Ride Details Modal */}
      {selectedRide && !showAssignModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRide(null)}
          title="Ride Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Ride Information</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Ride ID:</span> #{selectedRide.id.toUpperCase()}</p>
                  <p className="text-sm"><span className="text-gray-500">Status:</span> <StatusBadge status={selectedRide.status} size="sm" /></p>
                  <p className="text-sm"><span className="text-gray-500">Cost:</span> ${selectedRide.cost.toFixed(2)}</p>
                  <p className="text-sm"><span className="text-gray-500">Distance:</span> {selectedRide.distance}</p>
                  <p className="text-sm"><span className="text-gray-500">Duration:</span> {selectedRide.duration}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Participants</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Customer:</span> {selectedRide.customerName}</p>
                  <p className="text-sm">
                    <span className="text-gray-500">Driver:</span> {
                      selectedRide.driverName || 'Not assigned'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Route</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pickup</p>
                    <p className="text-sm text-gray-600">{selectedRide.from}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Drop-off</p>
                    <p className="text-sm text-gray-600">{selectedRide.to}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Requested:</span> {
                    new Date(selectedRide.requestedAt).toLocaleString()
                  }
                </p>
                {selectedRide.completedAt && (
                  <p className="text-sm">
                    <span className="text-gray-500">Completed:</span> {
                      new Date(selectedRide.completedAt).toLocaleString()
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && selectedRide && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedRide(null);
            setSelectedDriver('');
          }}
          title="Assign Driver"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ride Details</h4>
              <p className="text-sm text-gray-600">
                {selectedRide.customerName} • {selectedRide.from} → {selectedRide.to}
              </p>
              <p className="text-sm text-gray-600">${selectedRide.cost.toFixed(2)} • {selectedRide.distance}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Available Driver
              </label>
              {availableDrivers.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No drivers are currently available. Please check driver availability or try again later.
                  </p>
                </div>
              ) : (
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a driver...</option>
                {availableDrivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.vehicleModel} ({driver.rating}⭐) - {driver.totalRides} rides
                  </option>
                ))}
              </select>
              )}
            </div>
            
            {availableDrivers.length > 0 && selectedDriver && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const driver = availableDrivers.find(d => d.id === selectedDriver);
                  return driver ? (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Selected Driver Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700"><strong>Name:</strong> {driver.name}</p>
                          <p className="text-blue-700"><strong>Phone:</strong> {driver.phone}</p>
                          <p className="text-blue-700"><strong>Rating:</strong> {driver.rating}⭐</p>
                        </div>
                        <div>
                          <p className="text-blue-700"><strong>Vehicle:</strong> {driver.vehicleModel}</p>
                          <p className="text-blue-700"><strong>Plate:</strong> {driver.vehiclePlate}</p>
                          <p className="text-blue-700"><strong>Experience:</strong> {driver.totalRides} rides</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Drivers Summary</h4>
              <p className="text-sm text-gray-600">
                {availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} currently available for assignment
              </p>
              {availableDrivers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableDrivers.slice(0, 3).map(driver => (
                    <span key={driver.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {driver.name} ({driver.rating}⭐)
                    </span>
                  ))}
                  {availableDrivers.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      +{availableDrivers.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriver || availableDrivers.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Assign Driver</span>
                {selectedDriver && (
                  <span className="bg-blue-500 px-2 py-1 rounded text-xs">
                    {availableDrivers.find(d => d.id === selectedDriver)?.name}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRide(null);
                  setSelectedDriver('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Rides;

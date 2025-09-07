// src/pages/Rides.tsx
import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  Check,
  X,
  MapPin,
  Clock,
  Euro
} from 'lucide-react';
import { getRides, getDrivers, getSettings, changePrice } from '../utils/apis';
import { Ride, Driver } from '../types';
import StatusBadge from '../components/UI/StatusBadge';
import Modal from '../components/UI/Modal';

type ApiRide = Record<string, any>;
type ApiDriver = {
  id: number | string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phonenumber?: string | null;
  status?: boolean;
  isAvailable?: boolean;
  createdAt?: string | null;
  created_at?: string | null;
};

function normalizeDriver(u: ApiDriver): Driver {
  const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
  const name = fullName || u.phonenumber || u.email || `ID ${u.id}`;
  return {
    id: String(u.id),
    name,
    email: u.email ?? '-',
    phone: u.phonenumber ?? '-',
    vehicleModel: '-',
    vehiclePlate: '-',
    licenseNumber: '-',
    rating: 0,
    totalRides: 0,
    joinedDate: (u.createdAt || u.created_at || new Date().toISOString()).toString(),
    isActive: u.status ?? true,
    isAvailable: u.isAvailable ?? (u.status ?? true),
  };
}

/**
 * Returns normalized Ride object and attaches optional extras:
 * customerPhone, paymentStatus ('paid'|'unpaid'), asap (boolean)
 */
function normalizeRide(r: ApiRide): Ride & { customerPhone?: string | null; paymentStatus?: string | undefined; asap?: boolean } {
  const id = String(r.id ?? r.rideId ?? r.ride_id ?? r.reference ?? `${Date.now()}-${Math.random()}`);

  // Customer name inference (multiple shapes)
  const first = r.customerFirstName ?? r.first_name ?? r.user_first_name ?? r.user?.first_name;
  const last = r.customerLastName ?? r.last_name ?? r.user_last_name ?? r.user?.last_name;
  const customerName = r.customerName ?? (
    [first, last].filter(Boolean).join(' ').trim() ||
    r.user?.name ||
    r.customer?.name ||
    r.user?.phonenumber ||
    r.user?.email ||
    'Customer'
  );

  // Driver inference
  const driverFirst = r.driverFirstName ?? r.driver?.first_name;
  const driverLast = r.driverLastName ?? r.driver?.last_name;
  const driverName = r.driverName ?? ([driverFirst, driverLast].filter(Boolean).join(' ').trim() || r.driver?.name || '');

  // Route
  const from = r.from ?? r.pickup ?? r.start ?? r.pickupAddress ?? r.source ?? '-';
  const to = r.to ?? r.dropoff ?? r.end ?? r.dropoffAddress ?? r.destination ?? '-';

  // times
  const requestedAt = (r.requestedAt ?? r.createdAt ?? r.date ?? r.created ?? new Date().toISOString()).toString();
  const completedAt = r.completedAt ?? r.endTime ?? r.end_trip_time ?? null;

  // cost/distance/duration/status
  const cost = Number(r.cost ?? r.fare ?? r.amount ?? r.price ?? r.customer_total ?? 0);
  const distance = r.distance ?? r.km ?? r.miles ?? r.distance_km ?? '-';
  const duration = r.duration ?? r.time ?? r.duration_time ?? '-';
  const status = (r.status ?? r.ride_status ?? 'pending') as Ride['status'];

  // phone extraction (many shapes)
  const customerPhone =
    r.customerPhone ??
    r.phonenumber ??
    r.customer?.phonenumber ??
    r.user?.phonenumber ??
    r.customer_phone ??
    null;

  // payment status normalization
  let paymentStatus: string | undefined;
  if (r.paymentStatus !== undefined) {
    paymentStatus = typeof r.paymentStatus === 'string' ? r.paymentStatus : (r.paymentStatus ? 'paid' : 'unpaid');
  } else if (r.customer_paid !== undefined) {
    paymentStatus = (r.customer_paid === true || r.customer_paid === 1 || r.customer_paid === '1' || r.customer_paid === 'true') ? 'paid' : 'unpaid';
  } else if (r.customerPaid !== undefined) {
    paymentStatus = (r.customerPaid === true || r.customerPaid === 1) ? 'paid' : 'unpaid';
  } else {
    paymentStatus = undefined;
  }

  // asap normalization: accepts booleans, numbers, or strings
  let asap: boolean | undefined;
  if (r.asap !== undefined) {
    asap = (r.asap === true || r.asap === 1 || r.asap === '1' || r.asap === 'true');
  } else if (r.is_asap !== undefined) {
    asap = (r.is_asap === true || r.is_asap === 1 || r.is_asap === '1' || r.is_asap === 'true');
  } else {
    asap = undefined;
  }

  const out: any = {
    id,
    customerId: String(r.customerId ?? r.user_id ?? r.customer_id ?? ''),
    customerName,
    driverId: r.driverId ? String(r.driverId) : (r.driver?.id ? String(r.driver.id) : ''),
    driverName: driverName ?? '',
    from,
    to,
    cost,
    distance,
    duration,
    status,
    requestedAt,
    completedAt: completedAt ? String(completedAt) : undefined,
    // extras:
    customerPhone,
    paymentStatus,
    asap,
  };

  return out as Ride & { customerPhone?: string | null; paymentStatus?: string | undefined; asap?: boolean };
}

const gbCurrency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

const Rides: React.FC = () => {
  const [rides, setRides] = useState<(Ride & { customerPhone?: string | null; paymentStatus?: string | undefined; asap?: boolean })[]>([]);
  const [mockDrivers, setMockDrivers] = useState<Driver[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRide, setSelectedRide] = useState<(Ride & { customerPhone?: string | null; paymentStatus?: string | undefined; asap?: boolean }) | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [basePrice, setBasePrice] = useState('');   // as strings for inputs
  const [perMiles, setPerMiles] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    getRides()
      .then((data) => {
        const items: ApiRide[] = (data?.items ?? data ?? []);
        const mapped = items.map(normalizeRide);
        if (mounted) setRides(mapped);
      })
      .catch(console.error);

    getDrivers()
      .then((data) => {
        const items: ApiDriver[] = (data?.items ?? data ?? []);
        const mapped = items.map(normalizeDriver);
        if (mounted) setMockDrivers(mapped);
      })
      .catch(console.error);

    (async () => {
      try {
        const json = await getSettings();
        if (json) {
          const settings = json.settings ?? json;
          if (settings.basePrice !== undefined) setBasePrice(String(settings.basePrice));
          if (settings.perMiles !== undefined) setPerMiles(String(settings.perMiles));
        }
      } catch (err) {
        console.error('getSettings error', err);
      } finally {
        if (mounted) setSettingsLoaded(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const filteredRides = rides.filter(ride => {
    const term = searchTerm.trim().toLowerCase();
    if (!term && statusFilter === 'all') return true;
    const matchesSearch =
      (ride.customerName || '').toLowerCase().includes(term) ||
      (ride.from || '').toLowerCase().includes(term) ||
      (ride.to || '').toLowerCase().includes(term) ||
      (ride.id || '').toLowerCase().includes(term) ||
      (ride.customerPhone || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableDrivers = mockDrivers.filter(driver => driver.isActive && driver.isAvailable);

  const handleConfirmRide = (rideId: string) => {
    setRides(prev => prev.map(ride => ride.id === rideId ? { ...ride, status: 'confirmed' as const } : ride));
  };

  const handleCancelRide = (rideId: string) => {
    setRides(prev => prev.map(ride => ride.id === rideId ? { ...ride, status: 'cancelled' as const } : ride));
  };

  const handleAssignDriver = () => {
    if (selectedRide && selectedDriver) {
      const driver = mockDrivers.find(d => d.id === selectedDriver);
      if (driver) {
        setRides(prev => prev.map(ride => ride.id === selectedRide.id ? {
          ...ride,
          driverId: driver.id,
          driverName: driver.name,
          status: 'confirmed' as const,
        } : ride));
        console.log(`Driver ${driver.name} assigned to ride ${selectedRide.id}`);
      }
    }
    setShowAssignModal(false);
    setSelectedRide(null);
    setSelectedDriver('');
  };

  const handleOpenPriceModal = () => {
    setShowPriceModal(true);
  };

  const handleUpdateSettings = async () => {
    const payload: Record<string, number | string> = {};
    if (basePrice !== '') {
      const parsedBase = parseFloat(basePrice);
      if (Number.isNaN(parsedBase) || parsedBase < 0) {
        alert('Please enter a valid non-negative number for Base Price.');
        return;
      }
      payload.basePrice = parsedBase;
    }
    if (perMiles !== '') {
      const parsedPer = parseFloat(perMiles);
      if (Number.isNaN(parsedPer) || parsedPer < 0) {
        alert('Please enter a valid non-negative number for Per Mile Price.');
        return;
      }
      payload.perMiles = parsedPer;
    }
    if (!('basePrice' in payload) && !('perMiles' in payload)) {
      alert('Please change at least one value to update.');
      return;
    }

    try {
      const json = await changePrice(payload);
      const settings = json.settings ?? json;
      if (settings && (settings.basePrice !== undefined || settings.perMiles !== undefined)) {
        if (settings.basePrice !== undefined) setBasePrice(String(settings.basePrice));
        if (settings.perMiles !== undefined) setPerMiles(String(settings.perMiles));
      }
      if (json && (json.success || json.message)) {
        alert(json.message ?? 'Pricing settings updated.');
        setShowPriceModal(false);
      } else {
        alert('Failed to update pricing settings.');
      }
    } catch (err) {
      console.error('changePrice error', err);
      alert('Failed to update settings due to a server error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ride Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenPriceModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Euro className="w-4 h-4" />
            <span>Change Price</span>
          </button>
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

      {/* Desktop / Tablet: Table (md and up). Table is horizontally scrollable on small containers. */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto hidden md:block">
        <table className="w-full min-w-[900px] table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Ride Details</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-56">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Driver</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Cost</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ASAP</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Payment Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRides.map((ride, index) => (
              <tr key={ride.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-4 px-4 align-top">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{String(ride.id).toUpperCase()}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(ride.requestedAt).toLocaleString()}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 align-top">
                  <p className="text-sm font-medium text-gray-900">{ride.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">{ride.customerPhone ?? '-'}</p>
                </td>

                <td className="py-4 px-4 align-top">
                  {ride.driverName ? <p className="text-sm text-gray-900">{ride.driverName}</p> : <span className="text-sm text-gray-500">Not assigned</span>}
                </td>

                <td className="py-4 px-4 align-top">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <MapPin className="w-3 h-3 text-green-500 mr-1" />
                      <span className="block truncate md:truncate-none md:max-w-lg">{ride.from}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-red-500 mr-1" />
                      <span className="block truncate md:truncate-none md:max-w-lg">{ride.to}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 align-top">
                  <p className="text-sm font-medium text-gray-900">{gbCurrency.format(Number(ride.cost ?? 0))}</p>
                  <p className="text-xs text-gray-500">{typeof ride.distance === 'string' ? ride.distance : (Number(ride.distance || 0).toFixed(3))} miles</p>
                </td>

                <td className="py-4 px-4 align-top">
                  <StatusBadge status={ride.status} size="sm" />
                </td>

                <td className="py-4 px-4 align-top">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ride.asap ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ride.asap ? 'Yes' : 'No'}
                  </span>
                </td>

                <td className="py-4 px-4 align-top">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ride.paymentStatus === 'paid' ? 'bg-green-100 text-green-800'
                      : ride.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ride.paymentStatus ?? 'unknown'}
                  </span>
                </td>

                <td className="py-4 px-4 align-top">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedRide(ride)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                    {ride.status === 'pending' && <>
                      <button onClick={() => handleConfirmRide(ride.id)} className="p-1 text-gray-500 hover:text-green-600 transition-colors" title="Confirm Ride"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedRide(ride); setShowAssignModal(true); }} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Assign Driver"><UserPlus className="w-4 h-4" /></button>
                    </>}
                    {(ride.status === 'pending' || ride.status === 'confirmed') && (
                      <button onClick={() => handleCancelRide(ride.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Cancel Ride"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards (visible under md) */}
      <div className="space-y-3 md:hidden">
        {filteredRides.map((ride) => (
          <div key={ride.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">#{String(ride.id).toUpperCase()}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(ride.requestedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{gbCurrency.format(Number(ride.cost ?? 0))}</div>
                <div className="text-xs text-gray-500">{typeof ride.distance === 'string' ? ride.distance : (Number(ride.distance || 0).toFixed(2))} miles</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500">Customer</div>
                <div className="font-medium text-gray-900">{ride.customerName}</div>
                <div className="text-xs text-gray-500 mt-1">{ride.customerPhone ?? '-'}</div>
              </div>

              <div>
                <div className="text-gray-500">Driver</div>
                <div className="font-medium text-gray-900">{ride.driverName || 'Not assigned'}</div>

                <div className="mt-2">
                  <div className="text-gray-500">Payment</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ride.paymentStatus === 'paid' ? 'bg-green-100 text-green-800'
                        : ride.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>{ride.paymentStatus ?? 'unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status={ride.status} size="sm" />
                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  ride.asap ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>{ride.asap ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => setSelectedRide(ride)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                {ride.status === 'pending' && <>
                  <button onClick={() => handleConfirmRide(ride.id)} className="p-1 text-gray-500 hover:text-green-600 transition-colors" title="Confirm Ride"><Check className="w-4 h-4" /></button>
                  <button onClick={() => { setSelectedRide(ride); setShowAssignModal(true); }} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Assign Driver"><UserPlus className="w-4 h-4" /></button>
                </>}
                {(ride.status === 'pending' || ride.status === 'confirmed') && (
                  <button onClick={() => handleCancelRide(ride.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Cancel Ride"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ride Details Modal */}
      {selectedRide && !showAssignModal && (
        <Modal isOpen={true} onClose={() => setSelectedRide(null)} title="Ride Details" size="lg">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Ride Information</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Ride ID:</span> #{String(selectedRide.id).toUpperCase()}</p>
                  <p className="text-sm"><span className="text-gray-500">Status:</span> <StatusBadge status={selectedRide.status} size="sm" /></p>
                  <p className="text-sm"><span className="text-gray-500">Cost:</span> {gbCurrency.format(Number(selectedRide.cost ?? 0))}</p>
                  <p className="text-sm"><span className="text-gray-500">Distance:</span> {selectedRide.distance}</p>
                  <p className="text-sm"><span className="text-gray-500">Duration:</span> {selectedRide.duration ?? '-'}</p>
                  <p className="text-sm"><span className="text-gray-500">Payment Status:</span> <strong>{selectedRide.paymentStatus ?? 'unknown'}</strong></p>
                  <p className="text-sm"><span className="text-gray-500">ASAP:</span> <strong>{selectedRide.asap ? 'Yes' : 'No'}</strong></p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Participants</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Customer:</span> {selectedRide.customerName}</p>
                  <p className="text-sm"><span className="text-gray-500">Customer Phone:</span> {selectedRide.customerPhone ?? '-'}</p>
                  <p className="text-sm"><span className="text-gray-500">Driver:</span> {selectedRide.driverName || 'Not assigned'}</p>
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
                <p className="text-sm"><span className="text-gray-500">Requested:</span> {new Date(selectedRide.requestedAt).toLocaleString()}</p>
                {selectedRide.completedAt && <p className="text-sm"><span className="text-gray-500">Completed:</span> {new Date(selectedRide.completedAt).toLocaleString()}</p>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && selectedRide && (
        <Modal isOpen={true} onClose={() => { setShowAssignModal(false); setSelectedRide(null); setSelectedDriver(''); }} title="Assign Driver">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ride Details</h4>
              <p className="text-sm text-gray-600">{selectedRide.customerName} • {selectedRide.from} → {selectedRide.to}</p>
              <p className="text-sm text-gray-600">{gbCurrency.format(Number(selectedRide.cost ?? 0))} • {selectedRide.distance}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Available Driver</label>
              {availableDrivers.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800">No drivers are currently available.</p></div>
              ) : (
                <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Choose a driver...</option>
                  {availableDrivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name} - {driver.vehicleModel}</option>)}
                </select>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAssignDriver} disabled={!selectedDriver || availableDrivers.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Assign Driver</button>
              <button onClick={() => { setShowAssignModal(false); setSelectedRide(null); setSelectedDriver(''); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Price Settings Modal */}
      {showPriceModal && (
        <Modal isOpen={true} onClose={() => setShowPriceModal(false)} title="Change Pricing Settings">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Pricing Settings</h4>
              <p className="text-sm text-blue-700">This updates base price and per-mile price in the settings table. Existing rides remain unchanged.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">Base Price (£)</label>
                <input id="basePrice" type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="perMiles" className="block text-sm font-medium text-gray-700 mb-2">Per Mile Price (£)</label>
                <input id="perMiles" type="number" min="0" step="0.01" value={perMiles} onChange={(e) => setPerMiles(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Preview (no ride changes)</h4>
              <p className="text-sm text-green-700">New base price: £{basePrice ? parseFloat(basePrice).toFixed(2) : '0.00'} • per mile: £{perMiles ? parseFloat(perMiles).toFixed(2) : '0.00'}</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleUpdateSettings} disabled={!settingsLoaded} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Save Settings</button>
              <button onClick={() => setShowPriceModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Rides;

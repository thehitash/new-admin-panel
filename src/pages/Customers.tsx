import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  Star,
  ArrowLeft,
  MapPin
} from 'lucide-react';
// import { mockCustomers, mockRides } from '../data/mockData';
import { getCustomers, getRides } from '../utils/apis';
import StatusBadge from '../components/UI/StatusBadge';

type ApiCustomer = {
  id: number | string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phonenumber: string | null;
  createdAt?: string | null;
  created_at?: string | null;
};

type CustomerUI = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRides: number;
  totalSpent: number;
  rating: number;
  joinedDate: string | null;
};

type RideUI = {
  id: string;
  customerId: string;
  from: string;
  to: string;
  driverName: string;
  cost: number;
  status: string;
  requestedAt: string;
};

function normalizeCustomer(u: ApiCustomer): CustomerUI {
  const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
  const name = fullName || u.phonenumber || u.email || `ID ${u.id}`;
  return {
    id: String(u.id),
    name,
    email: u.email ?? '-',
    phone: u.phonenumber ?? '-',
    totalRides: 0,     // not provided by API
    totalSpent: 0,     // not provided by API
    rating: 0,         // not provided by API
    joinedDate: u.createdAt || u.created_at || null,
  };
}

const Customers: React.FC = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // >>> Live data filled here (keeps the same variable names your JSX uses) <<<
  const [mockCustomers, setMockCustomers] = useState<CustomerUI[]>([]);
  const [mockRides, setMockRides] = useState<RideUI[]>([]);

  useEffect(() => {
    let mounted = true;

    // Load customers from API
    getCustomers()
      .then((data) => {
        const items: ApiCustomer[] = (data?.items ?? data ?? []);
        const mapped = items.map(normalizeCustomer);
        if (mounted) setMockCustomers(mapped);
      })
      .catch(() => { /* optionally handle error */ });

    // Load rides from API (optional; mapped to current table shape)
    getRides()
      .then((data) => {
        const items: any[] = (data?.items ?? data ?? []);
        const mapped: RideUI[] = items.map((r) => ({
          id: String(r.id ?? r.rideId ?? r.ride_id ?? `${Date.now()}-${Math.random()}`),
          customerId: String(r.customerId ?? r.user_id ?? r.customer_id ?? ''),
          from: r.from ?? r.pickup ?? r.start ?? '-',
          to: r.to ?? r.dropoff ?? r.end ?? '-',
          driverName: r.driverName ?? r.driver_name ?? r.driver ?? 'Not assigned',
          cost: Number(r.cost ?? r.fare ?? 0),
          status: r.status ?? 'pending',
          requestedAt: r.requestedAt ?? r.createdAt ?? r.date ?? new Date().toISOString(),
        }));
        if (mounted) setMockRides(mapped);
      })
      .catch(() => { /* optionally handle error */ });

    return () => { mounted = false; };
  }, []);

  if (customerId) {
    // pass the filled data down; the inner JSX stays the same
    return <CustomerDetail customerId={customerId} mockCustomers={mockCustomers} mockRides={mockRides} />;
  }

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: mockCustomers.length, color: 'bg-blue-500' },
          { label: 'Active This Month', value: mockCustomers.filter(c => c.totalRides > 0).length, color: 'bg-green-500' },
          { label: 'Average Rides', value: mockCustomers.length ? Math.round(mockCustomers.reduce((sum, c) => sum + (c.totalRides || 0), 0) / mockCustomers.length) : 0, color: 'bg-purple-500' },
          { label: 'Total Revenue', value: `$${mockCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}`, color: 'bg-emerald-500' }
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

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Rides
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{customer.totalRides}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">${(customer.totalSpent).toFixed(2)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{(customer.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {customer.joinedDate ? new Date(customer.joinedDate).toLocaleDateString() : '-'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CustomerDetail: React.FC<{ customerId: string, mockCustomers: CustomerUI[], mockRides: RideUI[] }> = ({ customerId, mockCustomers, mockRides }) => {
  const navigate = useNavigate();
  const customer = mockCustomers.find(c => String(c.id) === String(customerId));
  const customerRides = mockRides.filter(ride => String(ride.customerId) === String(customerId));

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      {/* Customer Profile */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-medium text-gray-600">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{customer.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{customer.email}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{customer.phone}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {customer.joinedDate ? new Date(customer.joinedDate).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{(customer.rating).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900">{customer.totalRides}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${(customer.totalSpent).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-xl font-bold text-green-600">$</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average per Ride</p>
              <p className="text-2xl font-bold text-gray-900">
                {customer.totalRides > 0 ? `$${(customer.totalSpent / customer.totalRides).toFixed(2)}` : '$0.00'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-xl font-bold text-purple-600">Ø</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ride History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ride History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customerRides.map((ride, index) => (
                <tr key={ride.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {new Date(ride.requestedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(ride.requestedAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <MapPin className="w-3 h-3 text-green-500 mr-1" />
                        <span className="truncate max-w-40">{ride.from}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-red-500 mr-1" />
                        <span className="truncate max-w-40">{ride.to}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {ride.driverName || 'Not assigned'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">${ride.cost.toFixed(2)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status="pending" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;

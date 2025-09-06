import { Customer, Driver, Ride, DashboardStats, AppUser } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    totalRides: 25,
    totalSpent: 1250.50,
    rating: 4.8,
    joinedDate: '2023-01-15'
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    totalRides: 18,
    totalSpent: 890.25,
    rating: 4.9,
    joinedDate: '2023-02-20'
  },
  {
    id: 'c3',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+1 (555) 345-6789',
    totalRides: 42,
    totalSpent: 2100.75,
    rating: 4.7,
    joinedDate: '2022-11-10'
  },
  {
    id: 'c4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1 (555) 456-7890',
    totalRides: 8,
    totalSpent: 420.00,
    rating: 5.0,
    joinedDate: '2023-05-03'
  }
];

export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'David Wilson',
    email: 'david.w@taxiapp.com',
    phone: '+1 (555) 111-2222',
    licenseNumber: 'D1234567',
    vehicleModel: 'Toyota Camry 2022',
    vehiclePlate: 'ABC-1234',
    rating: 4.9,
    isActive: true,
    isAvailable: true,
    totalRides: 156,
    joinedDate: '2022-08-15'
  },
  {
    id: 'd2',
    name: 'Lisa Martinez',
    email: 'lisa.m@taxiapp.com',
    phone: '+1 (555) 222-3333',
    licenseNumber: 'D2345678',
    vehicleModel: 'Honda Accord 2021',
    vehiclePlate: 'XYZ-5678',
    rating: 4.8,
    isActive: true,
    isAvailable: true,
    totalRides: 203,
    joinedDate: '2022-07-22'
  },
  {
    id: 'd3',
    name: 'Robert Taylor',
    email: 'robert.t@taxiapp.com',
    phone: '+1 (555) 333-4444',
    licenseNumber: 'D3456789',
    vehicleModel: 'Nissan Altima 2023',
    vehiclePlate: 'DEF-9012',
    rating: 4.7,
    isActive: true,
    isAvailable: true,
    totalRides: 89,
    joinedDate: '2023-01-30'
  },
  {
    id: 'd4',
    name: 'Maria Garcia',
    email: 'maria.g@taxiapp.com',
    phone: '+1 (555) 444-5555',
    licenseNumber: 'D4567890',
    vehicleModel: 'Hyundai Elantra 2022',
    vehiclePlate: 'GHI-3456',
    rating: 4.9,
    isActive: true,
    isAvailable: true,
    totalRides: 67,
    joinedDate: '2023-03-12'
  },
  {
    id: 'd5',
    name: 'James Wilson',
    email: 'james.w@taxiapp.com',
    phone: '+1 (555) 555-6666',
    licenseNumber: 'D5678901',
    vehicleModel: 'Toyota Corolla 2023',
    vehiclePlate: 'JKL-7890',
    rating: 4.6,
    isActive: true,
    isAvailable: true,
    totalRides: 45,
    joinedDate: '2023-06-15'
  }
];

export const mockRides: Ride[] = [
  {
    id: 'r1',
    customerId: 'c1',
    customerName: 'John Smith',
    driverId: 'd1',
    driverName: 'David Wilson',
    from: '123 Main St, Downtown',
    to: 'Airport Terminal 1',
    cost: 45.50,
    status: 'in-progress',
    requestedAt: '2025-01-08T10:30:00Z',
    distance: '12.5 km',
    duration: '25 min'
  },
  {
    id: 'r2',
    customerId: 'c2',
    customerName: 'Sarah Johnson',
    from: '456 Oak Ave, Midtown',
    to: '789 Pine St, Uptown',
    cost: 28.75,
    status: 'pending',
    requestedAt: '2025-01-08T11:15:00Z',
    distance: '8.2 km',
    duration: '18 min'
  },
  {
    id: 'r3',
    customerId: 'c3',
    customerName: 'Michael Brown',
    driverId: 'd2',
    driverName: 'Lisa Martinez',
    from: '321 Elm St, Westside',
    to: 'Central Shopping Mall',
    cost: 22.00,
    status: 'completed',
    requestedAt: '2025-01-08T09:45:00Z',
    completedAt: '2025-01-08T10:15:00Z',
    distance: '6.8 km',
    duration: '15 min'
  },
  {
    id: 'r4',
    customerId: 'c4',
    customerName: 'Emily Davis',
    from: '555 Broadway, Theater District',
    to: '777 Park Ave, Upper East',
    cost: 35.25,
    status: 'confirmed',
    requestedAt: '2025-01-08T12:00:00Z',
    distance: '10.3 km',
    duration: '22 min'
  },
  {
    id: 'r5',
    customerId: 'c1',
    customerName: 'John Smith',
    driverId: 'd3',
    driverName: 'Robert Taylor',
    from: 'Hotel Grand Plaza',
    to: 'Business Center',
    cost: 18.50,
    status: 'completed',
    requestedAt: '2025-01-07T14:20:00Z',
    completedAt: '2025-01-07T14:45:00Z',
    distance: '5.2 km',
    duration: '12 min'
  }
];

export const mockStats: DashboardStats = {
  totalBookings: 1247,
  ridesInProgress: 8,
  completedRides: 1156,
  pendingConfirmations: 15,
  totalRevenue: 52845.75,
  activeDrivers: 23
};

export const mockUsers: AppUser[] = [
  {
    id: 'u1',
    name: 'John Admin',
    contactNumber: '+44 7700 900123',
    email: 'john.admin@taxiapp.com',
    address: '123 Admin Street, London, UK',
    role: 'admin',
    isActive: true,
    createdAt: '2023-01-15T10:30:00Z'
  },
  {
    id: 'u2',
    name: 'Sarah Manager',
    contactNumber: '+44 7700 900456',
    email: 'sarah.manager@taxiapp.com',
    address: '456 Manager Avenue, Manchester, UK',
    role: 'manager',
    isActive: true,
    createdAt: '2023-02-20T14:15:00Z'
  },
  {
    id: 'u3',
    name: 'Mike Driver',
    contactNumber: '+44 7700 900789',
    email: 'mike.driver@taxiapp.com',
    address: '789 Driver Road, Birmingham, UK',
    role: 'driver',
    isActive: true,
    createdAt: '2023-03-10T09:45:00Z'
  },
  {
    id: 'u4',
    name: 'Emma Manager',
    contactNumber: '+44 7700 900321',
    email: 'emma.manager@taxiapp.com',
    address: '321 Management Close, Leeds, UK',
    role: 'manager',
    isActive: false,
    createdAt: '2023-04-05T16:20:00Z'
  },
  {
    id: 'u5',
    name: 'Tom Driver',
    contactNumber: '+44 7700 900654',
    email: 'tom.driver@taxiapp.com',
    address: '654 Transport Lane, Liverpool, UK',
    role: 'driver',
    isActive: true,
    createdAt: '2023-05-12T11:30:00Z'
  }
];
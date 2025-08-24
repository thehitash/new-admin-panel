export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRides: number;
  totalSpent: number;
  rating: number;
  joinedDate: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  rating: number;
  isActive: boolean;
  isAvailable: boolean;
  totalRides: number;
  joinedDate: string;
}

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  from: string;
  to: string;
  cost: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  requestedAt: string;
  completedAt?: string;
  distance: string;
  duration: string;
}

export interface DashboardStats {
  totalBookings: number;
  ridesInProgress: number;
  completedRides: number;
  pendingConfirmations: number;
  totalRevenue: number;
  activeDrivers: number;
}
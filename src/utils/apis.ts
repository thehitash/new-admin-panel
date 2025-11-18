// Admin Panel API Integration
// Updated to match Dunfermline Taxi Backend API structure

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
console.log('API_BASE', API_BASE)

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  const userData = localStorage.getItem("admin-user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Helper to create headers with auth
function getHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Small helper: parse JSON safely
 */
async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
}

/* ----------------------
   Authentication
   ---------------------- */

/**
 * Request OTP for admin login
 */
export async function requestAdminOTP(phoneNumber: string) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  return parseJson(r);
}

/**
 * Admin login using phone number + OTP
 */
export async function loginAdmin(payload: { phoneNumber: string; otp: string }) {
  const r = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/* ----------------------
   Customers (Riders)
   ---------------------- */
export async function getCustomers(page: number = 1, limit: number = 50) {
  try {
    // Use new endpoint to get all riders directly
    const response = await fetch(`${API_BASE}/api/auth/users?userType=rider`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const result = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || 'Failed to fetch customers');
    }

    const riders = result.data;

    // Map to expected format
    const items = riders.map((rider: any) => ({
      _id: rider._id,
      id: rider._id,
      fullName: rider.fullName,
      phoneNumber: rider.phoneNumber,
      email: rider.email || '',
      userType: 'rider',
      createdAt: rider.createdAt,
    }));

    return {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
    };
  } catch (err) {
    console.error("❌ getCustomers error:", err);
    return { items: [], total: 0, page, limit };
  }
}

/* ----------------------
   Drivers Management
   ---------------------- */
export async function getDrivers() {
  try {
    // Use new endpoint to get all drivers directly
    const response = await fetch(`${API_BASE}/api/auth/users?userType=driver`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drivers: ${response.status}`);
    }

    const result = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || 'Failed to fetch drivers');
    }

    const drivers = result.data;

    // Map to expected format
    const items = drivers.map((driver: any) => ({
      _id: driver._id,
      id: driver._id,
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      email: driver.email || '',
      userType: 'driver',
      carDetails: driver.carDetails || {},
      carName: driver.carDetails?.carName || driver.carName || '',
      carNumber: driver.carDetails?.carNumber || driver.carNumber || '',
      carModel: driver.carDetails?.carModel || driver.carModel || '',
      carColor: driver.carDetails?.carColor || driver.carColor || '',
      rating: driver.rating || 0,
      profileImage: driver.profileImage || '',
      isActive: true,
      createdAt: driver.createdAt,
    }));

    return {
      status: true,
      data: items,
    };
  } catch (err) {
    console.error("❌ getDrivers error:", err);
    return { status: false, data: [] };
  }
}

/* ----------------------
   Rides Management
   ---------------------- */
export async function getRides(page: number = 1, limit: number = 10) {
  try {
    const response = await fetch(`${API_BASE}/api/ride/all-rides?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rides: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: true,
      data: data.data || [],
      pagination: data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalRides: 0,
        limit,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  } catch (err) {
    console.error("❌ getRides error:", err);
    return {
      status: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRides: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
}

/* ----------------------
   Dashboard Stats
   ---------------------- */
export async function getDashboardStats() {
  try {
    const ridesResponse = await fetch(`${API_BASE}/api/ride/all-rider-rides`, {
      method: "GET",
      headers: getHeaders(),
    });

    const ridesData = await ridesResponse.json();
    const rides = ridesData.data || [];

    const stats = {
      totalBookings: rides.length,
      inProgress: rides.filter((r: any) => r.status === 'ongoing').length,
      completed: rides.filter((r: any) => r.status === 'completed').length,
      pendingConfirmations: rides.filter((r: any) => r.status === 'pending').length,
      totalRevenue: rides
        .filter((r: any) => r.status === 'completed')
        .reduce((sum: number, r: any) => sum + (r.finalFare || r.estimatedFare || 0), 0),
      activeDrivers: 0,
    };

    return {
      status: true,
      data: stats,
    };
  } catch (err) {
    console.error("❌ getDashboardStats error:", err);
    return {
      status: false,
      data: {
        totalBookings: 0,
        inProgress: 0,
        completed: 0,
        pendingConfirmations: 0,
        totalRevenue: 0,
        activeDrivers: 0,
      },
    };
  }
}

/* ----------------------
   Vehicles Management
   ---------------------- */
export async function getVehicles() {
  const r = await fetch(`${API_BASE}/api/vehicles`, {
    method: "GET",
    headers: getHeaders(),
  });
  return parseJson(r);
}

/* ----------------------
   Driver Management
   ---------------------- */

/**
 * Create a new driver account
 * Backend endpoint: POST /api/auth/signup
 */
export async function createDriver(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: string;
  carName: string;
  carNumber: string;
  carModel: string;
  carColor: string;
}) {
  const r = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(r);

  if (!r.ok) {
    // Extract error message from response
    const errorMessage = data?.message || `Failed to create driver (${r.status})`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Update driver details
 * Backend endpoint: PUT /api/auth/update-profile
 */
export async function updateDriver(driverId: string, payload: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  carName?: string;
  carNumber?: string;
  carModel?: string;
  carColor?: string;
}) {
  const r = await fetch(`${API_BASE}/api/auth/users/${driverId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(r);

  if (!r.ok) {
    const errorMessage = data?.message || `Failed to update driver (${r.status})`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Delete driver account
 * Note: Backend might not have a delete endpoint, returns message
 */
export async function deleteDriver(driverId: string) {
  // Backend doesn't have a delete user endpoint yet
  // This is a placeholder that returns a message
  return {
    status: false,
    message: "Delete user endpoint not implemented in backend. Contact developer to add DELETE /api/users/:id endpoint."
  };
}

/* ----------------------
   Notifications Management
   ---------------------- */

/**
 * Send test notification to yourself
 */
export async function sendTestNotification() {
  const r = await fetch(`${API_BASE}/api/notifications/test`, {
    method: "POST",
    headers: getHeaders(),
  });
  return parseJson(r);
}

/**
 * Send promotional notification (e.g., "Book Now - 10% Off!")
 */
export async function sendPromotionalNotification(payload: {
  title: string;
  body: string;
  userType?: "rider" | "driver";
  data?: Record<string, string>;
  image?: string;
}) {
  const r = await fetch(`${API_BASE}/api/notifications/promotional`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Send notification to all users (riders and drivers)
 */
export async function sendNotificationToAll(payload: {
  title: string;
  body: string;
  data?: Record<string, string>;
  image?: string;
}) {
  const r = await fetch(`${API_BASE}/api/notifications/send-to-all`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Send notification to specific user type (all riders or all drivers)
 */
export async function sendNotificationToType(payload: {
  userType: "rider" | "driver";
  title: string;
  body: string;
  data?: Record<string, string>;
  image?: string;
}) {
  const r = await fetch(`${API_BASE}/api/notifications/send-to-type`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Send notification to specific user
 */
export async function sendNotificationToUser(payload: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  image?: string;
}) {
  const r = await fetch(`${API_BASE}/api/notifications/send`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification(payload: {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  image?: string;
}) {
  const r = await fetch(`${API_BASE}/api/notifications/send-bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/* ----------------------
   User Management
   ---------------------- */
export async function getDriversManagers(role?: "driver" | "manager") {
  // Backend doesn't have separate admin user management
  return {
    status: true,
    data: [],
    message: "Admin user management not implemented in backend",
  };
}

/**
 * Create new user (driver or rider)
 */
export async function createUser(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: "rider" | "driver";
  isAdmin?: boolean;
  carName?: string;
  carNumber?: string;
  carModel?: string;
  carColor?: string;
}) {
  const r = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Update user profile
 */
export async function updateUser(userId: string | number, payload: Record<string, any>) {
  const r = await fetch(`${API_BASE}/api/auth/update-profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * Delete user - Not implemented in backend
 */
export async function deleteUser(userId: string | number) {
  return {
    status: false,
    message: "Delete user not implemented in backend",
  };
}

/**
 * Toggle user active status - Not implemented in backend
 */
export async function toggleUserActive(userId: string | number) {
  return {
    status: false,
    message: "Toggle user status not implemented in backend",
  };
}

/* ----------------------
   Settings / Pricing - Not implemented in backend
   ---------------------- */
export async function getSettings() {
  return {
    status: false,
    message: "Settings endpoint not implemented in backend",
  };
}

export async function changePrice(payload: { basePrice?: string | number; perMiles?: string | number }) {
  return {
    status: false,
    message: "Change price endpoint not implemented in backend",
  };
}

export async function appStatus() {
  return {
    status: false,
    message: "App control endpoint not implemented in backend",
  };
}

/* ----------------------
   Convenience export
   ---------------------- */
export default {
  // Auth
  loginAdmin,
  requestAdminOTP,

  // Users
  getCustomers,
  getDrivers,

  // Rides
  getRides,

  // Dashboard
  getDashboardStats,

  // Vehicles
  getVehicles,

  // Notifications
  sendTestNotification,
  sendPromotionalNotification,
  sendNotificationToAll,
  sendNotificationToType,
  sendNotificationToUser,
  sendBulkNotification,

  // User Management
  getDriversManagers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,

  // Settings
  getSettings,
  changePrice,
  appStatus,
};

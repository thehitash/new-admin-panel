// src/lib/api.ts
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/admin";

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
   Customers, drivers, rides, dashboard
   ---------------------- */
export async function getCustomers() {
  const r = await fetch(`${API}/customers`);
  return parseJson(r);
}

export async function getDrivers() {
  const r = await fetch(`${API}/drivers`);
  return parseJson(r);
}

export async function getRides() {
  const r = await fetch(`${API}/trips`);
  return parseJson(r);
}

export async function getDashboardStats() {
  const r = await fetch(`${API}/dashboard/stats`);
  return parseJson(r);
}

/* ----------------------
   USERS for admin page
   ---------------------- */

/**
 * GET /admin/drivers-managers
 * Optional: role filter (?role=driver|manager)
 */
export async function getDriversManagers(role?: "driver" | "manager") {
  const qs = role ? `?role=${encodeURIComponent(role)}` : "";
  const r = await fetch(`${API}/drivers-managers${qs}`);
  return parseJson(r);
}

/**
 * POST /admin/create-user
 */
export async function createUser(payload: Record<string, any>) {
  const r = await fetch(`${API}/create-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * PUT /admin/user/:id
 */
export async function updateUser(userId: string | number, payload: Record<string, any>) {
  const r = await fetch(`${API}/user/${encodeURIComponent(String(userId))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/**
 * DELETE /admin/user/:id
 */
export async function deleteUser(userId: string | number) {
  const r = await fetch(`${API}/user/${encodeURIComponent(String(userId))}`, {
    method: "DELETE",
  });
  return parseJson(r);
}

/**
 * PATCH /admin/user/:id/toggleActive
 */
export async function toggleUserActive(userId: string | number) {
  const r = await fetch(`${API}/user/${encodeURIComponent(String(userId))}/toggleActive`, {
    method: "PATCH",
  });
  return parseJson(r);
}

/* ----------------------
   Settings / Pricing
   ---------------------- */
export async function getSettings() {
  const r = await fetch(`${API}/settings`);
  return parseJson(r);
}

export async function changePrice(payload: { basePrice?: string | number; perMiles?: string | number }) {
  const r = await fetch(`${API}/change-price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(r);
}

/* ----------------------
   Convenience export
   ---------------------- */
export default {
  getCustomers,
  getDrivers,
  getRides,
  getDashboardStats,
  getDriversManagers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getSettings,
  changePrice,
};

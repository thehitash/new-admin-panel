// src/lib/api.ts
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/admin";


export async function appStatus(){
const r = await fetch(`${API}/control`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    
  });
  return parseJson(r)
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
   Customers, drivers, rides, dashboard
   ---------------------- */
export async function getCustomers(page: number = 1, limit: number = 50) {
  try {
    const url = new URL(`${API}/customers`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // add auth headers if needed:
        // "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const data = await response.json();
    return {
      items: data.items ?? data.data ?? [], // support different API shapes
      total: data.total ?? data.count ?? 0,
      page: data.page ?? page,
      limit: data.limit ?? limit,
    };
  } catch (err) {
    console.error("❌ getCustomers error:", err);
    return { items: [], total: 0, page, limit };
  }
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
export async function loginAdmin(
  payload: { email: string; password: string },
  
) {
  const r = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
return parseJson(r)}

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
  appStatus,

};

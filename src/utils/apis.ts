// src/lib/api.ts
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/admin";

export async function getCustomers() {
  const r = await fetch(`${API}/customers`);
  return r.json();
}
export async function getDrivers() {
  const r = await fetch(`${API}/drivers`);
  return r.json();
}
export async function getRides() {
  const r = await fetch(`${API}/trips`);
  return r.json();
}
export async function getDashboardStats() {
  const r = await fetch(`${API}/dashboard/stats`);
  return r.json();
}

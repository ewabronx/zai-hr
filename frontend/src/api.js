import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

// interceptor – doda Authorization: Bearer <token> jeśli jest w localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchSeries() {
  const res = await api.get("/series/");
  return res.data;
}

export async function fetchMeasurements(params = {}) {
  const res = await api.get("/measurements/", { params });
  return res.data;
}

// 🔐 logowanie – zwraca { access, refresh }
export async function login(username, password) {
  const res = await api.post("/auth/token/", { username, password });
  return res.data;
}

// ➕ utworzenie nowej serii
export async function createSeries(payload) {
  const res = await api.post("/series/", payload);
  return res.data;
}

// ➕ utworzenie nowego pomiaru
export async function createMeasurement(payload) {
  const res = await api.post("/measurements/", payload);
  return res.data;
}

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

export async function fetchSeries() {
  const res = await api.get("/series/");
  return res.data;
}

export async function fetchMeasurements(params = {}) {
  const res = await api.get("/measurements/", { params });
  return res.data;
}

export default api;

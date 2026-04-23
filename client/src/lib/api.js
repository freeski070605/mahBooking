import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  withCredentials: true,
});

function unwrap(response) {
  return response.data;
}

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then(unwrap),
  login: (payload) => api.post("/auth/login", payload).then(unwrap),
  logout: () => api.post("/auth/logout").then(unwrap),
  me: () => api.get("/auth/me").then(unwrap),
};

export const servicesApi = {
  list: (params = {}) => api.get("/services", { params }).then(unwrap),
  get: (id) => api.get(`/services/${id}`).then(unwrap),
  create: (payload) => api.post("/services", payload).then(unwrap),
  update: (id, payload) => api.put(`/services/${id}`, payload).then(unwrap),
  toggle: (id) => api.patch(`/services/${id}/toggle`).then(unwrap),
  remove: (id) => api.delete(`/services/${id}`).then(unwrap),
};

export const galleryApi = {
  list: (params = {}) => api.get("/gallery", { params }).then(unwrap),
  create: (payload) => api.post("/gallery", payload).then(unwrap),
  update: (id, payload) => api.put(`/gallery/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/gallery/${id}`).then(unwrap),
};

export const appointmentsApi = {
  list: (params = {}) => api.get("/appointments", { params }).then(unwrap),
  get: (id) => api.get(`/appointments/${id}`).then(unwrap),
  create: (payload) => api.post("/appointments", payload).then(unwrap),
  update: (id, payload) => api.put(`/appointments/${id}`, payload).then(unwrap),
  updateStatus: (id, payload) =>
    api.patch(`/appointments/${id}/status`, payload).then(unwrap),
  remove: (id) => api.delete(`/appointments/${id}`).then(unwrap),
  slots: (params) => api.get("/appointments/slots", { params }).then(unwrap),
};

export const availabilityApi = {
  get: () => api.get("/availability").then(unwrap),
  update: (payload) => api.put("/availability", payload).then(unwrap),
};

export const settingsApi = {
  get: () => api.get("/settings").then(unwrap),
  update: (payload) => api.put("/settings", payload).then(unwrap),
};

export const uploadsApi = {
  image: (file, type = "general") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    return api.post("/uploads/image", formData).then(unwrap);
  },
};

export const clientsApi = {
  list: () => api.get("/clients").then(unwrap),
  get: (id) => api.get(`/clients/${id}`).then(unwrap),
};

export const dashboardApi = {
  summary: () => api.get("/dashboard/summary").then(unwrap),
};

export default api;

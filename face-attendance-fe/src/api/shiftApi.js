import { http } from "./httpClient";

export const shiftApi = {
  getAll: () => http.get("/shifts"),
  getActive: () => http.get("/shifts/active"),
  create: (data) => http.post("/shifts", data),
  update: (id, data) => http.put(`/shifts/${id}`, data),
  remove: (id) => http.del(`/shifts/${id}`),
};

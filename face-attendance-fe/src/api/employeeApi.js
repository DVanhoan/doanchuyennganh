import { http } from "./httpClient";

export const employeeApi = {
  getAll: () => http.get("/employees"),
  create: (data) => http.post("/employees", data),
  update: (id, data) => http.put(`/employees/${id}`, data),
  toggleActive: (id) => http.patch(`/employees/${id}/toggle-active`),
  remove: (id) => http.del(`/employees/${id}`),
};

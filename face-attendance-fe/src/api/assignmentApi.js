import { http } from "./httpClient";

export const assignmentApi = {
  getByDate: (date) => http.get(`/shift-assignments/date/${date}`),
  getToday: () => http.get("/shift-assignments/today"),
  create: (data) => http.post("/shift-assignments", data),
  remove: (id) => http.del(`/shift-assignments/${id}`),
};

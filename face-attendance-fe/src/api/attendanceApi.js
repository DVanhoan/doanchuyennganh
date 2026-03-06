import { http } from "./httpClient";

export const attendanceApi = {
  getToday: () => http.get("/attendance/today"),

  getRange: (from, to, employeeId) => {
    let url = `/attendance/range?from=${from}&to=${to}`;
    if (employeeId) url += `&employeeId=${employeeId}`;
    return http.get(url);
  },
};

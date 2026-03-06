import { http } from "./httpClient";

export const salaryAdvanceApi = {
  getAll: () => http.get("/salary-advances"),
  create: (data) => http.post("/salary-advances", data),
  processAction: (id, data) =>
    http.patch(`/salary-advances/${id}/action`, data),
  remove: (id) => http.del(`/salary-advances/${id}`),
};

export const salaryDeductionApi = {
  getAll: () => http.get("/salary-deductions"),
  create: (data) => http.post("/salary-deductions", data),
  remove: (id) => http.del(`/salary-deductions/${id}`),
};

export const payrollApi = {
  get: (from, to) => http.get(`/payroll?from=${from}&to=${to}`),
};

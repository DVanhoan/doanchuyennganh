import { http } from "./httpClient";

export const faceApi = {
  autoEnroll: (payload) => http.post("/face-enroll/auto", payload),
  getStatus: (employeeId) => http.get(`/face-enroll/status/${employeeId}`),
  checkIn: (imageBase64) => http.post("/attendance/check-in", { imageBase64 }),
};

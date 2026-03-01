const API_URL = "/api";

export async function createEmployee(data) {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create employee");
  }
  return res.json();
}

export async function enrollFace(payload) {
  const res = await fetch(`${API_URL}/face-enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to enroll face");
  }
  return res.json();
}

export async function autoEnrollFace(payload) {
  const res = await fetch(`${API_URL}/face-enroll/auto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to auto enroll face");
  }
  return res.json();
}

export async function getEmployees() {
  const res = await fetch(`${API_URL}/employees`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function getEnrollStatus(employeeId) {
  const res = await fetch(`${API_URL}/face-enroll/status/${employeeId}`);
  if (!res.ok) throw new Error("Failed to fetch enroll status");
  return res.json();
}

export async function faceCheckIn(imageBase64) {
  const res = await fetch(`${API_URL}/attendance/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Check-in failed");
  }
  return res.json();
}

export async function getTodayAttendance() {
  const res = await fetch(`${API_URL}/attendance/today`);
  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

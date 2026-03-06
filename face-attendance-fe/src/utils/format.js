export function formatTime(t) {
  if (!t) return "—";
  return new Date(t).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTimeShort(t) {
  if (!t) return "—";
  return new Date(t).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export function formatMoney(v) {
  if (v == null) return "—";
  return Number(v).toLocaleString("vi-VN") + "đ";
}

export function formatWorkedTime(minutes) {
  if (!minutes) return "—";
  return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

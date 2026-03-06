export const DIRECTIONS = ["front", "left", "right", "up", "down"];

export const DIRECTION_LABELS = {
  front: "Nhìn thẳng vào camera",
  left: "Quay mặt sang TRÁI",
  right: "Quay mặt sang PHẢI",
  up: "Ngẩng mặt LÊN",
  down: "Cúi mặt XUỐNG",
};

export const ASSIGNMENT_STATUS = {
  SCHEDULED: { text: "Chờ", cls: "badge-gray" },
  WORKING: { text: "Đang làm", cls: "badge-warning" },
  COMPLETED: { text: "Hoàn tất", cls: "badge-success" },
  ABSENT: { text: "Vắng", cls: "badge-danger" },
};

export const ADVANCE_STATUS = {
  PENDING: { text: "Chờ duyệt", cls: "badge-warning" },
  APPROVED: { text: "Đã duyệt", cls: "badge-success" },
  REJECTED: { text: "Từ chối", cls: "badge-danger" },
};

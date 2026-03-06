package com.example.attendance.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CheckInResponse {
    private boolean matched;
    private String employeeName;
    private String employeeCode;
    private String position;
    private Long employeeId;
    private String action;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String message;
    private String shiftName;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
    private Integer workedMinutes;

    public static CheckInResponse noMatch() {
        CheckInResponse r = new CheckInResponse();
        r.setMatched(false);
        r.setMessage("Không nhận diện được khuôn mặt. Vui lòng thử lại.");
        return r;
    }

    public static CheckInResponse success(Long employeeId, String name, String code, String position,
            String action, LocalDateTime checkIn, LocalDateTime checkOut, String message) {
        CheckInResponse r = new CheckInResponse();
        r.setMatched(true);
        r.setEmployeeId(employeeId);
        r.setEmployeeName(name);
        r.setEmployeeCode(code);
        r.setPosition(position);
        r.setAction(action);
        r.setCheckInTime(checkIn);
        r.setCheckOutTime(checkOut);
        r.setMessage(message);
        return r;
    }
}

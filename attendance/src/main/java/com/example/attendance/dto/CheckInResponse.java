package com.example.attendance.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CheckInResponse {
    private boolean matched;
    private String employeeName;
    private String employeeCode;
    private String position;
    private Long employeeId;
    private String action; // "CHECK_IN", "CHECK_OUT", "ALREADY_DONE"
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String message;

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

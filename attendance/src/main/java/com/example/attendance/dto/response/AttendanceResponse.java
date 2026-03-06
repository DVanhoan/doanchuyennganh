package com.example.attendance.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String position;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String shiftName;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
    private Integer workedMinutes;
}

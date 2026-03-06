package com.example.attendance.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class ShiftAssignmentResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String position;
    private Long shiftId;
    private String shiftName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private LocalDate workDate;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
    private Integer workedMinutes;
}

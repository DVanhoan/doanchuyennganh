package com.example.attendance.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AttendanceRecord {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String position;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
}

package com.example.attendance.dto.request;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ShiftAssignmentRequest {
    private Long employeeId;
    private Long shiftId;
    private LocalDate workDate;
}

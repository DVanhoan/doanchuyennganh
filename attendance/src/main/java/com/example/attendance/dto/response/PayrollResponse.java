package com.example.attendance.dto.response;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PayrollResponse {
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private BigDecimal hourlyRate;

    private int totalShifts;
    private int totalWorkedMinutes;
    private int totalLateMinutes;
    private int totalEarlyLeaveMinutes;

    private BigDecimal grossPay;
    private BigDecimal totalAdvances;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
}

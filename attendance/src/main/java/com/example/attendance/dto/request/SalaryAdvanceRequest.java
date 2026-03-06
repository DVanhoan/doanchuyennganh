package com.example.attendance.dto.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class SalaryAdvanceRequest {
    private Long employeeId;
    private BigDecimal amount;
    private String reason;
}

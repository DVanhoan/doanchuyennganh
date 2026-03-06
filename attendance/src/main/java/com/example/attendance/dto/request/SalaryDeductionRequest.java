package com.example.attendance.dto.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class SalaryDeductionRequest {
    private Long employeeId;
    private BigDecimal amount;
    private String reason;
    private String createdBy;
}

package com.example.attendance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SalaryDeductionResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private BigDecimal amount;
    private String reason;
    private LocalDate deductionDate;
    private String createdBy;
    private LocalDateTime createdAt;
}

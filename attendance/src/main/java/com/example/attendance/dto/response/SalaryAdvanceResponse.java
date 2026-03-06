package com.example.attendance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SalaryAdvanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private BigDecimal amount;
    private String reason;
    private String status;
    private LocalDate requestDate;
    private String approvedBy;
    private LocalDateTime responseDate;
    private String responseNote;
    private LocalDateTime createdAt;
}

package com.example.attendance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class EmployeeResponse {
    private Long id;
    private String code;
    private String fullName;
    private String position;
    private String phone;
    private String email;
    private String department;
    private BigDecimal hourlyRate;
    private LocalDate hireDate;
    private Boolean isActive;
}

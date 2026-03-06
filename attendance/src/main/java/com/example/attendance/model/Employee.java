package com.example.attendance.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.attendance.model.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Employee extends BaseEntity {

    @Column(unique = true)
    private String code;

    private String fullName;
    private String position;
    private String phone;
    private String email;
    private String department;

    @Column(precision = 12, scale = 0)
    private BigDecimal hourlyRate;

    private LocalDate hireDate;

    @Column(nullable = false)
    private Boolean isActive = true;
}

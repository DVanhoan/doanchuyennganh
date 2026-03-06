package com.example.attendance.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.attendance.model.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class SalaryDeduction extends BaseEntity {

    @ManyToOne
    private Employee employee;

    @Column(precision = 14, scale = 0, nullable = false)
    private BigDecimal amount;

    private String reason;

    private LocalDate deductionDate;

    private String createdBy;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (deductionDate == null) {
            deductionDate = LocalDate.now();
        }
    }
}

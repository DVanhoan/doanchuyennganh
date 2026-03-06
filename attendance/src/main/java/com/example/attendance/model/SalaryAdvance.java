package com.example.attendance.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.attendance.model.base.BaseEntity;
import com.example.attendance.model.enums.AdvanceStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class SalaryAdvance extends BaseEntity {

    @ManyToOne
    private Employee employee;

    @Column(precision = 14, scale = 0, nullable = false)
    private BigDecimal amount;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdvanceStatus status = AdvanceStatus.PENDING;

    private LocalDate requestDate;

    private String approvedBy;
    private LocalDateTime responseDate;
    private String responseNote;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (requestDate == null) {
            requestDate = LocalDate.now();
        }
    }
}

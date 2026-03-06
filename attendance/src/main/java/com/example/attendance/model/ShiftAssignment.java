package com.example.attendance.model;

import java.time.LocalDate;

import com.example.attendance.model.base.BaseEntity;
import com.example.attendance.model.enums.ShiftStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id", "work_date" }))
public class ShiftAssignment extends BaseEntity {

    @ManyToOne(optional = false)
    private Employee employee;

    @ManyToOne(optional = false)
    private Shift shift;

    @Column(nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftStatus status = ShiftStatus.SCHEDULED;
}

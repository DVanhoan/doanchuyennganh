package com.example.attendance.model;

import java.time.LocalTime;

import com.example.attendance.model.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Shift extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    private Integer breakMinutes = 0;

    private Integer lateToleranceMinutes = 0;

    private Integer earlyLeaveToleranceMinutes = 0;

    private Boolean isActive = true;
}

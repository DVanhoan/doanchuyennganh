package com.example.attendance.model;

import java.time.LocalDateTime;

import com.example.attendance.model.base.BaseEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Attendance extends BaseEntity {

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    @ManyToOne
    private Employee employee;

    @ManyToOne
    private ShiftAssignment shiftAssignment;

    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
    private Integer workedMinutes;
}

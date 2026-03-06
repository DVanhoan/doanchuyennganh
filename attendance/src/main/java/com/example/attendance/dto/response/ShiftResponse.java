package com.example.attendance.dto.response;

import java.time.LocalTime;

import lombok.Data;

@Data
public class ShiftResponse {
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakMinutes;
    private Integer lateToleranceMinutes;
    private Integer earlyLeaveToleranceMinutes;
    private Boolean isActive;
}

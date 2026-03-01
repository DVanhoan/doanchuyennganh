package com.example.attendance.dto;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long employeeId;
    private String angle; // front / left / right / up / down
    private String imageBase64;
}
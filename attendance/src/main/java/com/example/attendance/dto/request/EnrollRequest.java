package com.example.attendance.dto.request;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long employeeId;
    private String angle;
    private String imageBase64;
}

package com.example.attendance.dto.request;

import lombok.Data;

@Data
public class AutoEnrollRequest {
    private Long employeeId;
    private String imageBase64;
}

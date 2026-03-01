package com.example.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AutoEnrollResponse {
    private String detectedDirection;
    private boolean saved;
    private EnrollStatusResponse status;
    private String duplicateMessage;

    public AutoEnrollResponse(String detectedDirection, boolean saved, EnrollStatusResponse status) {
        this.detectedDirection = detectedDirection;
        this.saved = saved;
        this.status = status;
        this.duplicateMessage = null;
    }
}

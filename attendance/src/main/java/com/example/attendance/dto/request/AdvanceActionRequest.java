package com.example.attendance.dto.request;

import lombok.Data;

@Data
public class AdvanceActionRequest {
    private String action;
    private String approvedBy;
    private String responseNote;
}

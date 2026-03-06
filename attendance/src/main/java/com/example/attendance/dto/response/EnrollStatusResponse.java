package com.example.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EnrollStatusResponse {
    private boolean front;
    private boolean left;
    private boolean right;
    private boolean up;
    private boolean down;
}

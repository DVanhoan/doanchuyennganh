package com.example.attendance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.AttendanceRecord;
import com.example.attendance.dto.CheckInRequest;
import com.example.attendance.dto.CheckInResponse;
import com.example.attendance.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        try {
            CheckInResponse response = attendanceService.processCheckIn(request.getImageBase64());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            CheckInResponse err = CheckInResponse.noMatch();
            err.setMessage("Lỗi: " + e.getMessage());
            return ResponseEntity.ok(err);
        }
    }

    @GetMapping("/today")
    public ResponseEntity<List<AttendanceRecord>> todayList() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }
}

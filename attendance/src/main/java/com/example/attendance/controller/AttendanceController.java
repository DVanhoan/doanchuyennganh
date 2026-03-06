package com.example.attendance.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.request.CheckInRequest;
import com.example.attendance.dto.response.AttendanceResponse;
import com.example.attendance.dto.response.CheckInResponse;
import com.example.attendance.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        return ResponseEntity.ok(attendanceService.processCheckIn(request.getImageBase64()));
    }

    @GetMapping("/today")
    public ResponseEntity<List<AttendanceResponse>> todayList() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    @GetMapping("/range")
    public ResponseEntity<List<AttendanceResponse>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDateRange(from, to, employeeId));
    }
}

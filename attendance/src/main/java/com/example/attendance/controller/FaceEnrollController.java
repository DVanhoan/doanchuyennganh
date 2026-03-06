package com.example.attendance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.request.AutoEnrollRequest;
import com.example.attendance.dto.request.EnrollRequest;
import com.example.attendance.dto.response.AutoEnrollResponse;
import com.example.attendance.dto.response.EnrollStatusResponse;
import com.example.attendance.service.FaceEnrollService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/face-enroll")
@RequiredArgsConstructor
public class FaceEnrollController {

    private final FaceEnrollService faceEnrollService;

    @PostMapping
    public ResponseEntity<EnrollStatusResponse> enroll(@RequestBody EnrollRequest request) {
        return ResponseEntity.ok(faceEnrollService.enroll(request));
    }

    @PostMapping("/auto")
    public ResponseEntity<AutoEnrollResponse> autoEnroll(@RequestBody AutoEnrollRequest request) {
        return ResponseEntity.ok(faceEnrollService.autoEnroll(request));
    }

    @GetMapping("/status/{employeeId}")
    public ResponseEntity<EnrollStatusResponse> status(@PathVariable Long employeeId) {
        return ResponseEntity.ok(faceEnrollService.getEnrollStatus(employeeId));
    }
}
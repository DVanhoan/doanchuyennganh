package com.example.attendance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.request.AdvanceActionRequest;
import com.example.attendance.dto.request.SalaryAdvanceRequest;
import com.example.attendance.dto.response.SalaryAdvanceResponse;
import com.example.attendance.service.SalaryAdvanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/salary-advances")
@RequiredArgsConstructor
public class SalaryAdvanceController {

    private final SalaryAdvanceService advanceService;

    @PostMapping
    public ResponseEntity<SalaryAdvanceResponse> create(@RequestBody SalaryAdvanceRequest request) {
        return ResponseEntity.ok(advanceService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SalaryAdvanceResponse>> getAll() {
        return ResponseEntity.ok(advanceService.getAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SalaryAdvanceResponse>> getPending() {
        return ResponseEntity.ok(advanceService.getPending());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SalaryAdvanceResponse>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(advanceService.getByEmployee(employeeId));
    }

    @PatchMapping("/{id}/action")
    public ResponseEntity<SalaryAdvanceResponse> processAction(
            @PathVariable Long id, @RequestBody AdvanceActionRequest request) {
        return ResponseEntity.ok(advanceService.processAction(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        advanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

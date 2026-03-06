package com.example.attendance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.request.SalaryDeductionRequest;
import com.example.attendance.dto.response.SalaryDeductionResponse;
import com.example.attendance.service.SalaryDeductionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/salary-deductions")
@RequiredArgsConstructor
public class SalaryDeductionController {

    private final SalaryDeductionService deductionService;

    @PostMapping
    public ResponseEntity<SalaryDeductionResponse> create(@RequestBody SalaryDeductionRequest request) {
        return ResponseEntity.ok(deductionService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SalaryDeductionResponse>> getAll() {
        return ResponseEntity.ok(deductionService.getAll());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SalaryDeductionResponse>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(deductionService.getByEmployee(employeeId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deductionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

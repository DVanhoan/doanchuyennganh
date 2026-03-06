package com.example.attendance.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.request.ShiftAssignmentRequest;
import com.example.attendance.dto.response.ShiftAssignmentResponse;
import com.example.attendance.model.ShiftAssignment;
import com.example.attendance.service.ShiftAssignmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shift-assignments")
@RequiredArgsConstructor
public class ShiftAssignmentController {

    private final ShiftAssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<ShiftAssignment> create(@RequestBody ShiftAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftAssignment> update(@PathVariable Long id,
            @RequestBody ShiftAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ShiftAssignmentResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(assignmentService.getByDate(date));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ShiftAssignmentResponse>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(assignmentService.getByEmployee(employeeId));
    }

    @GetMapping("/today")
    public ResponseEntity<List<ShiftAssignmentResponse>> getToday() {
        return ResponseEntity.ok(assignmentService.getToday());
    }
}

package com.example.attendance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.response.ShiftResponse;
import com.example.attendance.model.Shift;
import com.example.attendance.service.ShiftService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    public ResponseEntity<ShiftResponse> create(@RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.create(shift));
    }

    @GetMapping
    public ResponseEntity<List<ShiftResponse>> getAll() {
        return ResponseEntity.ok(shiftService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShiftResponse>> getActive() {
        return ResponseEntity.ok(shiftService.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftResponse> update(@PathVariable Long id, @RequestBody Shift shift) {
        return ResponseEntity.ok(shiftService.update(id, shift));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        shiftService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

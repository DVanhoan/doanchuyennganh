package com.example.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.attendance.dto.response.ShiftResponse;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Shift;
import com.example.attendance.repository.ShiftRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftResponse create(Shift shift) {
        return toResponse(shiftRepository.save(shift));
    }

    public List<ShiftResponse> getAll() {
        return shiftRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ShiftResponse> getActive() {
        return shiftRepository.findByIsActiveTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ShiftResponse getById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shift not found: " + id));
        return toResponse(shift);
    }

    public ShiftResponse update(Long id, Shift updated) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shift not found: " + id));
        shift.setName(updated.getName());
        shift.setStartTime(updated.getStartTime());
        shift.setEndTime(updated.getEndTime());
        shift.setBreakMinutes(updated.getBreakMinutes());
        shift.setLateToleranceMinutes(updated.getLateToleranceMinutes());
        shift.setEarlyLeaveToleranceMinutes(updated.getEarlyLeaveToleranceMinutes());
        shift.setIsActive(updated.getIsActive());
        return toResponse(shiftRepository.save(shift));
    }

    public void delete(Long id) {
        shiftRepository.deleteById(id);
    }

    private ShiftResponse toResponse(Shift s) {
        ShiftResponse r = new ShiftResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setStartTime(s.getStartTime());
        r.setEndTime(s.getEndTime());
        r.setBreakMinutes(s.getBreakMinutes());
        r.setLateToleranceMinutes(s.getLateToleranceMinutes());
        r.setEarlyLeaveToleranceMinutes(s.getEarlyLeaveToleranceMinutes());
        r.setIsActive(s.getIsActive());
        return r;
    }
}

package com.example.attendance.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.attendance.dto.request.ShiftAssignmentRequest;
import com.example.attendance.dto.response.ShiftAssignmentResponse;
import com.example.attendance.exception.BadRequestException;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Attendance;
import com.example.attendance.model.Employee;
import com.example.attendance.model.Shift;
import com.example.attendance.model.ShiftAssignment;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.ShiftAssignmentRepository;
import com.example.attendance.repository.ShiftRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShiftAssignmentService {

    private final ShiftAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final AttendanceRepository attendanceRepository;

    public ShiftAssignment create(ShiftAssignmentRequest request) {
        if (assignmentRepository.existsByEmployeeIdAndWorkDate(
                request.getEmployeeId(), request.getWorkDate())) {
            throw new BadRequestException("Nhân viên đã được phân ca vào ngày " + request.getWorkDate());
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found: " + request.getEmployeeId()));
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new NotFoundException("Shift not found: " + request.getShiftId()));

        ShiftAssignment assignment = new ShiftAssignment();
        assignment.setEmployee(employee);
        assignment.setShift(shift);
        assignment.setWorkDate(request.getWorkDate());
        return assignmentRepository.save(assignment);
    }

    public ShiftAssignment update(Long id, ShiftAssignmentRequest request) {
        ShiftAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Assignment not found: " + id));

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new NotFoundException("Shift not found: " + request.getShiftId()));

        assignment.setShift(shift);
        assignment.setWorkDate(request.getWorkDate());
        return assignmentRepository.save(assignment);
    }

    public void delete(Long id) {
        assignmentRepository.deleteById(id);
    }

    public List<ShiftAssignmentResponse> getByDate(LocalDate date) {
        List<ShiftAssignment> assignments = assignmentRepository.findByWorkDate(date);
        return assignments.stream().map(a -> toResponse(a, date)).collect(Collectors.toList());
    }

    public List<ShiftAssignmentResponse> getByEmployee(Long employeeId) {
        List<ShiftAssignment> assignments = assignmentRepository.findByEmployeeId(employeeId);
        return assignments.stream()
                .map(a -> toResponse(a, a.getWorkDate()))
                .collect(Collectors.toList());
    }

    public List<ShiftAssignmentResponse> getToday() {
        return getByDate(LocalDate.now());
    }

    private ShiftAssignmentResponse toResponse(ShiftAssignment a, LocalDate date) {
        ShiftAssignmentResponse r = new ShiftAssignmentResponse();
        r.setId(a.getId());
        r.setEmployeeId(a.getEmployee().getId());
        r.setEmployeeName(a.getEmployee().getFullName());
        r.setEmployeeCode(a.getEmployee().getCode());
        r.setPosition(a.getEmployee().getPosition());
        r.setShiftId(a.getShift().getId());
        r.setShiftName(a.getShift().getName());
        r.setShiftStartTime(a.getShift().getStartTime());
        r.setShiftEndTime(a.getShift().getEndTime());
        r.setWorkDate(a.getWorkDate());
        r.setStatus(a.getStatus().name());

        // Find attendance record for this assignment
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
        Optional<Attendance> att = attendanceRepository.findTodayByEmployeeId(
                a.getEmployee().getId(), dayStart, dayEnd);

        if (att.isPresent()) {
            r.setCheckInTime(att.get().getCheckInTime());
            r.setCheckOutTime(att.get().getCheckOutTime());
            r.setLateMinutes(att.get().getLateMinutes());
            r.setEarlyLeaveMinutes(att.get().getEarlyLeaveMinutes());
            r.setWorkedMinutes(att.get().getWorkedMinutes());
        }

        return r;
    }
}

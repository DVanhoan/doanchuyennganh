package com.example.attendance.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.attendance.dto.response.AttendanceResponse;
import com.example.attendance.dto.response.CheckInResponse;
import com.example.attendance.model.Attendance;
import com.example.attendance.model.Employee;
import com.example.attendance.model.FaceEmbedding;
import com.example.attendance.model.Shift;
import com.example.attendance.model.ShiftAssignment;
import com.example.attendance.model.enums.ShiftStatus;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.FaceEmbeddingRepository;
import com.example.attendance.repository.ShiftAssignmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final FaceService faceService;
    private final FaceEmbeddingRepository embeddingRepository;
    private final AttendanceRepository attendanceRepository;
    private final ShiftAssignmentRepository assignmentRepository;

    @Transactional
    public CheckInResponse processCheckIn(String imageBase64) {
        // 1. Identify face
        List<FaceEmbedding> allEmbeddings = embeddingRepository.findAll();
        if (allEmbeddings.isEmpty()) {
            CheckInResponse r = CheckInResponse.noMatch();
            r.setMessage("Chưa có nhân viên nào đăng ký khuôn mặt.");
            return r;
        }

        FaceService.IdentifyResult identifyResult = faceService.identifyFace(imageBase64, allEmbeddings);
        if (identifyResult == null) {
            return CheckInResponse.noMatch();
        }

        Employee employee = identifyResult.getEmployee();
        LocalDate today = LocalDate.now();

        // 2. Find today's shift assignment
        Optional<ShiftAssignment> assignmentOpt = assignmentRepository
                .findByEmployeeIdAndWorkDate(employee.getId(), today);

        if (assignmentOpt.isEmpty()) {
            CheckInResponse r = CheckInResponse.noMatch();
            r.setMatched(true);
            r.setEmployeeId(employee.getId());
            r.setEmployeeName(employee.getFullName());
            r.setEmployeeCode(employee.getCode());
            r.setPosition(employee.getPosition());
            r.setMessage("Bạn chưa được phân ca hôm nay. Liên hệ quản lý.");
            return r;
        }

        ShiftAssignment assignment = assignmentOpt.get();
        Shift shift = assignment.getShift();

        // 3. Process based on assignment status
        switch (assignment.getStatus()) {
            case SCHEDULED: {
                // CHECK-IN
                int lateMinutes = calculateLateMinutes(shift, LocalTime.now());

                Attendance att = new Attendance();
                att.setEmployee(employee);
                att.setShiftAssignment(assignment);
                att.setCheckInTime(LocalDateTime.now());
                att.setLateMinutes(lateMinutes);
                attendanceRepository.save(att);

                assignment.setStatus(ShiftStatus.WORKING);
                assignmentRepository.save(assignment);

                CheckInResponse r = CheckInResponse.success(
                        employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                        "CHECK_IN", att.getCheckInTime(), null,
                        lateMinutes > 0
                                ? "Check-in thành công! Trễ " + lateMinutes + " phút."
                                : "Check-in thành công! Chào mừng bạn.");
                r.setShiftName(shift.getName());
                r.setLateMinutes(lateMinutes);
                return r;
            }

            case WORKING: {
                // CHECK-OUT
                LocalDateTime dayStart = today.atStartOfDay();
                LocalDateTime dayEnd = today.atTime(LocalTime.MAX);
                Optional<Attendance> attOpt = attendanceRepository
                        .findTodayByEmployeeId(employee.getId(), dayStart, dayEnd);

                if (attOpt.isEmpty()) {
                    CheckInResponse r = CheckInResponse.noMatch();
                    r.setMessage("Lỗi: Không tìm thấy bản ghi check-in.");
                    return r;
                }

                Attendance att = attOpt.get();
                att.setCheckOutTime(LocalDateTime.now());

                int earlyLeaveMinutes = calculateEarlyLeaveMinutes(shift, LocalTime.now());
                int workedMinutes = calculateWorkedMinutes(att.getCheckInTime(), att.getCheckOutTime(), shift);

                att.setEarlyLeaveMinutes(earlyLeaveMinutes);
                att.setWorkedMinutes(workedMinutes);
                attendanceRepository.save(att);

                assignment.setStatus(ShiftStatus.COMPLETED);
                assignmentRepository.save(assignment);

                CheckInResponse r = CheckInResponse.success(
                        employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                        "CHECK_OUT", att.getCheckInTime(), att.getCheckOutTime(),
                        earlyLeaveMinutes > 0
                                ? "Check-out thành công! Về sớm " + earlyLeaveMinutes + " phút."
                                : "Check-out thành công! Hẹn gặp lại.");
                r.setShiftName(shift.getName());
                r.setLateMinutes(att.getLateMinutes());
                r.setEarlyLeaveMinutes(earlyLeaveMinutes);
                r.setWorkedMinutes(workedMinutes);
                return r;
            }

            case COMPLETED: {
                LocalDateTime dayStart = today.atStartOfDay();
                LocalDateTime dayEnd = today.atTime(LocalTime.MAX);
                Optional<Attendance> attOpt = attendanceRepository
                        .findTodayByEmployeeId(employee.getId(), dayStart, dayEnd);

                CheckInResponse r = CheckInResponse.success(
                        employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                        "ALREADY_DONE",
                        attOpt.map(Attendance::getCheckInTime).orElse(null),
                        attOpt.map(Attendance::getCheckOutTime).orElse(null),
                        "Bạn đã chấm công đầy đủ hôm nay rồi!");
                r.setShiftName(shift.getName());
                return r;
            }

            default: {
                CheckInResponse r = CheckInResponse.noMatch();
                r.setMatched(true);
                r.setEmployeeName(employee.getFullName());
                r.setMessage("Ca làm việc ở trạng thái: " + assignment.getStatus());
                return r;
            }
        }
    }

    public List<AttendanceResponse> getTodayAttendance() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<Attendance> records = attendanceRepository.findAllToday(dayStart, dayEnd);

        return records.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByDateRange(LocalDate from, LocalDate to, Long employeeId) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Attendance> records = attendanceRepository.findByDateRange(start, end, employeeId);
        return records.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AttendanceResponse toResponse(Attendance a) {
        AttendanceResponse r = new AttendanceResponse();
        r.setId(a.getId());
        r.setEmployeeId(a.getEmployee().getId());
        r.setEmployeeName(a.getEmployee().getFullName());
        r.setEmployeeCode(a.getEmployee().getCode());
        r.setPosition(a.getEmployee().getPosition());
        r.setCheckInTime(a.getCheckInTime());
        r.setCheckOutTime(a.getCheckOutTime());
        r.setLateMinutes(a.getLateMinutes());
        r.setEarlyLeaveMinutes(a.getEarlyLeaveMinutes());
        r.setWorkedMinutes(a.getWorkedMinutes());

        if (a.getShiftAssignment() != null) {
            r.setShiftName(a.getShiftAssignment().getShift().getName());
        }

        return r;
    }

    private int calculateLateMinutes(Shift shift, LocalTime actualIn) {
        int tolerance = shift.getLateToleranceMinutes() != null ? shift.getLateToleranceMinutes() : 0;
        long minutesAfterStart = Duration.between(shift.getStartTime(), actualIn).toMinutes();
        return Math.max(0, (int) minutesAfterStart - tolerance);
    }

    private int calculateEarlyLeaveMinutes(Shift shift, LocalTime actualOut) {
        int tolerance = shift.getEarlyLeaveToleranceMinutes() != null ? shift.getEarlyLeaveToleranceMinutes() : 0;
        long minutesBeforeEnd = Duration.between(actualOut, shift.getEndTime()).toMinutes();
        if (minutesBeforeEnd <= 0)
            return 0;
        return Math.max(0, (int) minutesBeforeEnd - tolerance);
    }

    private int calculateWorkedMinutes(LocalDateTime checkIn, LocalDateTime checkOut, Shift shift) {
        long totalMinutes = Duration.between(checkIn, checkOut).toMinutes();
        int breakMins = shift.getBreakMinutes() != null ? shift.getBreakMinutes() : 0;
        return Math.max(0, (int) totalMinutes - breakMins);
    }
}

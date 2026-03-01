package com.example.attendance.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.attendance.dto.AttendanceRecord;
import com.example.attendance.dto.CheckInResponse;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Employee;
import com.example.attendance.entity.FaceEmbedding;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.FaceEmbeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final FaceService faceService;
    private final FaceEmbeddingRepository embeddingRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public CheckInResponse processCheckIn(String imageBase64) {
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
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        Optional<Attendance> todayRecord = attendanceRepository.findTodayByEmployeeId(
                employee.getId(), dayStart, dayEnd);

        if (todayRecord.isPresent()) {
            Attendance att = todayRecord.get();
            if (att.getCheckOutTime() != null) {
                // Already checked in AND out today
                return CheckInResponse.success(
                        employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                        "ALREADY_DONE", att.getCheckInTime(), att.getCheckOutTime(),
                        "Bạn đã chấm công đầy đủ hôm nay rồi!");
            } else {
                // Check out
                att.setCheckOutTime(LocalDateTime.now());
                attendanceRepository.save(att);
                return CheckInResponse.success(
                        employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                        "CHECK_OUT", att.getCheckInTime(), att.getCheckOutTime(),
                        "Check-out thành công! Hẹn gặp lại.");
            }
        } else {
            // Check in
            Attendance att = new Attendance();
            att.setEmployee(employee);
            att.setCheckInTime(LocalDateTime.now());
            attendanceRepository.save(att);
            return CheckInResponse.success(
                    employee.getId(), employee.getFullName(), employee.getCode(), employee.getPosition(),
                    "CHECK_IN", att.getCheckInTime(), null,
                    "Check-in thành công! Chào mừng bạn.");
        }
    }

    public List<AttendanceRecord> getTodayAttendance() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<Attendance> records = attendanceRepository.findAllToday(dayStart, dayEnd);

        return records.stream().map(a -> {
            AttendanceRecord r = new AttendanceRecord();
            r.setId(a.getId());
            r.setEmployeeId(a.getEmployee().getId());
            r.setEmployeeName(a.getEmployee().getFullName());
            r.setEmployeeCode(a.getEmployee().getCode());
            r.setPosition(a.getEmployee().getPosition());
            r.setCheckInTime(a.getCheckInTime());
            r.setCheckOutTime(a.getCheckOutTime());
            return r;
        }).collect(Collectors.toList());
    }
}

package com.example.attendance.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.attendance.model.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
        List<Attendance> findByEmployeeId(Long employeeId);

        @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId " +
                        "AND a.checkInTime >= :start AND a.checkInTime < :end " +
                        "ORDER BY a.checkInTime DESC")
        Optional<Attendance> findTodayByEmployeeId(@Param("empId") Long empId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT a FROM Attendance a WHERE a.checkInTime >= :start AND a.checkInTime < :end " +
                        "ORDER BY a.checkInTime DESC")
        List<Attendance> findAllToday(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT a FROM Attendance a WHERE a.checkInTime >= :start AND a.checkInTime < :end " +
                        "AND (:empId IS NULL OR a.employee.id = :empId) " +
                        "ORDER BY a.checkInTime DESC")
        List<Attendance> findByDateRange(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        @Param("empId") Long empId);
}

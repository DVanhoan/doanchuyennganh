package com.example.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.ShiftAssignment;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {

    List<ShiftAssignment> findByWorkDate(LocalDate workDate);

    List<ShiftAssignment> findByEmployeeId(Long employeeId);

    Optional<ShiftAssignment> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);

    boolean existsByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
}

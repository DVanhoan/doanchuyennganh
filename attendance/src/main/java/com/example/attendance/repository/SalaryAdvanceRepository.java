package com.example.attendance.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.SalaryAdvance;
import com.example.attendance.model.enums.AdvanceStatus;

public interface SalaryAdvanceRepository extends JpaRepository<SalaryAdvance, Long> {

    List<SalaryAdvance> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<SalaryAdvance> findByStatusOrderByCreatedAtDesc(AdvanceStatus status);

    List<SalaryAdvance> findByRequestDateBetweenOrderByCreatedAtDesc(LocalDate from, LocalDate to);

    List<SalaryAdvance> findByEmployeeIdAndRequestDateBetween(Long employeeId, LocalDate from, LocalDate to);

    List<SalaryAdvance> findByEmployeeIdAndStatusAndRequestDateBetween(
            Long employeeId, AdvanceStatus status, LocalDate from, LocalDate to);

    List<SalaryAdvance> findAllByOrderByCreatedAtDesc();
}

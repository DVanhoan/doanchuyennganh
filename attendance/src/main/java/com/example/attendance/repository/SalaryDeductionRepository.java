package com.example.attendance.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.SalaryDeduction;

public interface SalaryDeductionRepository extends JpaRepository<SalaryDeduction, Long> {

    List<SalaryDeduction> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<SalaryDeduction> findByDeductionDateBetweenOrderByCreatedAtDesc(LocalDate from, LocalDate to);

    List<SalaryDeduction> findByEmployeeIdAndDeductionDateBetween(Long employeeId, LocalDate from, LocalDate to);

    List<SalaryDeduction> findAllByOrderByCreatedAtDesc();
}

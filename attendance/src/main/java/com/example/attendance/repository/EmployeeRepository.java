package com.example.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
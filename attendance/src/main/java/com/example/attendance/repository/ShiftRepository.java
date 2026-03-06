package com.example.attendance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.Shift;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByIsActiveTrue();
}

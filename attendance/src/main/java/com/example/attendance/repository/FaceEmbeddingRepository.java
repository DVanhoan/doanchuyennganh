package com.example.attendance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.entity.FaceEmbedding;

public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, Long> {
    List<FaceEmbedding> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndAngle(Long employeeId, String angle);

    List<FaceEmbedding> findByEmployeeIdNot(Long employeeId);
}
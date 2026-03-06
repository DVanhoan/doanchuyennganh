package com.example.attendance.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.attendance.dto.request.AutoEnrollRequest;
import com.example.attendance.dto.request.EnrollRequest;
import com.example.attendance.dto.response.AutoEnrollResponse;
import com.example.attendance.dto.response.EnrollStatusResponse;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Employee;
import com.example.attendance.model.FaceEmbedding;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.FaceEmbeddingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FaceEnrollService {

    private static final Set<String> VALID_DIRECTIONS = Set.of("front", "left", "right", "up", "down");

    private final FaceService faceService;
    private final EmployeeRepository employeeRepository;
    private final FaceEmbeddingRepository embeddingRepository;

    public EnrollStatusResponse enroll(EnrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found: " + request.getEmployeeId()));

        String embedding = faceService.extractEmbedding(request.getImageBase64());

        FaceEmbedding fe = new FaceEmbedding();
        fe.setEmployee(employee);
        fe.setAngle(request.getAngle());
        fe.setEmbedding(embedding);
        embeddingRepository.save(fe);

        return getEnrollStatus(request.getEmployeeId());
    }

    @Transactional
    public AutoEnrollResponse autoEnroll(AutoEnrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found: " + request.getEmployeeId()));

        FaceService.EmbeddingResult result = faceService.extractEmbeddingWithDirection(request.getImageBase64());
        String direction = result.getDirection();

        if (result.getEmbedding() == null) {
            return new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId()));
        }

        if (!VALID_DIRECTIONS.contains(direction)) {
            return new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId()));
        }

        if (embeddingRepository.existsByEmployeeIdAndAngle(employee.getId(), direction)) {
            return new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId()));
        }

        List<FaceEmbedding> existing = embeddingRepository.findByEmployeeId(employee.getId());
        if (existing.isEmpty()) {
            List<FaceEmbedding> others = embeddingRepository.findByEmployeeIdNot(employee.getId());
            String duplicate = faceService.findDuplicateFace(result.getEmbedding(), others);
            if (duplicate != null) {
                AutoEnrollResponse resp = new AutoEnrollResponse(direction, false,
                        getEnrollStatus(employee.getId()));
                resp.setDuplicateMessage("Khuôn mặt này đã được đăng ký bởi: " + duplicate);
                return resp;
            }
        }

        FaceEmbedding fe = new FaceEmbedding();
        fe.setEmployee(employee);
        fe.setAngle(direction);
        fe.setEmbedding(result.getEmbedding());
        embeddingRepository.save(fe);

        return new AutoEnrollResponse(direction, true, getEnrollStatus(employee.getId()));
    }

    public EnrollStatusResponse getEnrollStatus(Long employeeId) {
        List<FaceEmbedding> embeddings = embeddingRepository.findByEmployeeId(employeeId);
        boolean front = embeddings.stream().anyMatch(e -> "front".equals(e.getAngle()));
        boolean left = embeddings.stream().anyMatch(e -> "left".equals(e.getAngle()));
        boolean right = embeddings.stream().anyMatch(e -> "right".equals(e.getAngle()));
        boolean up = embeddings.stream().anyMatch(e -> "up".equals(e.getAngle()));
        boolean down = embeddings.stream().anyMatch(e -> "down".equals(e.getAngle()));
        return new EnrollStatusResponse(front, left, right, up, down);
    }
}

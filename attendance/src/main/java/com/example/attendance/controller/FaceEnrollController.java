package com.example.attendance.controller;

import java.util.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.dto.AutoEnrollRequest;
import com.example.attendance.dto.AutoEnrollResponse;
import com.example.attendance.dto.EnrollRequest;
import com.example.attendance.dto.EnrollStatusResponse;
import com.example.attendance.entity.Employee;
import com.example.attendance.entity.FaceEmbedding;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.FaceEmbeddingRepository;
import com.example.attendance.service.FaceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/face-enroll")
@RequiredArgsConstructor
public class FaceEnrollController {

    private static final Set<String> VALID_DIRECTIONS = Set.of("front", "left", "right", "up", "down");

    private final FaceService faceService;
    private final EmployeeRepository employeeRepository;
    private final FaceEmbeddingRepository embeddingRepository;

    @PostMapping
    public ResponseEntity<EnrollStatusResponse> enroll(@RequestBody EnrollRequest request) {

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + request.getEmployeeId()));

        String embedding = faceService.extractEmbedding(request.getImageBase64());

        FaceEmbedding fe = new FaceEmbedding();
        fe.setEmployee(employee);
        fe.setAngle(request.getAngle());
        fe.setEmbedding(embedding);
        embeddingRepository.save(fe);

        return ResponseEntity.ok(getEnrollStatus(request.getEmployeeId()));
    }

    @Transactional
    @PostMapping("/auto")
    public ResponseEntity<AutoEnrollResponse> autoEnroll(@RequestBody AutoEnrollRequest request) {

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + request.getEmployeeId()));

        FaceService.EmbeddingResult result = faceService.extractEmbeddingWithDirection(request.getImageBase64());
        String direction = result.getDirection();

        if (result.getEmbedding() == null) {
            return ResponseEntity.ok(new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId())));
        }

        if (!VALID_DIRECTIONS.contains(direction)) {
            return ResponseEntity.ok(new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId())));
        }

        if (embeddingRepository.existsByEmployeeIdAndAngle(employee.getId(), direction)) {
            return ResponseEntity.ok(new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId())));
        }

        // On the first embedding for this employee, check if this face already exists
        List<FaceEmbedding> existing = embeddingRepository.findByEmployeeId(employee.getId());
        if (existing.isEmpty()) {
            List<FaceEmbedding> others = embeddingRepository.findByEmployeeIdNot(employee.getId());
            String duplicate = faceService.findDuplicateFace(result.getEmbedding(), others);
            if (duplicate != null) {
                AutoEnrollResponse resp = new AutoEnrollResponse(direction, false, getEnrollStatus(employee.getId()));
                resp.setDuplicateMessage("Khuôn mặt này đã được đăng ký bởi: " + duplicate);
                return ResponseEntity.ok(resp);
            }
        }

        FaceEmbedding fe = new FaceEmbedding();
        fe.setEmployee(employee);
        fe.setAngle(direction);
        fe.setEmbedding(result.getEmbedding());
        embeddingRepository.save(fe);

        return ResponseEntity.ok(new AutoEnrollResponse(direction, true, getEnrollStatus(employee.getId())));
    }

    @GetMapping("/status/{employeeId}")
    public ResponseEntity<EnrollStatusResponse> status(@PathVariable Long employeeId) {
        return ResponseEntity.ok(getEnrollStatus(employeeId));
    }

    private EnrollStatusResponse getEnrollStatus(Long employeeId) {
        List<FaceEmbedding> embeddings = embeddingRepository.findByEmployeeId(employeeId);
        boolean front = embeddings.stream().anyMatch(e -> "front".equals(e.getAngle()));
        boolean left = embeddings.stream().anyMatch(e -> "left".equals(e.getAngle()));
        boolean right = embeddings.stream().anyMatch(e -> "right".equals(e.getAngle()));
        boolean up = embeddings.stream().anyMatch(e -> "up".equals(e.getAngle()));
        boolean down = embeddings.stream().anyMatch(e -> "down".equals(e.getAngle()));
        return new EnrollStatusResponse(front, left, right, up, down);
    }
}
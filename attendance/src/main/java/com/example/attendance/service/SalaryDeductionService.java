package com.example.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.attendance.dto.request.SalaryDeductionRequest;
import com.example.attendance.dto.response.SalaryDeductionResponse;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Employee;
import com.example.attendance.model.SalaryDeduction;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.SalaryDeductionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryDeductionService {

    private final SalaryDeductionRepository deductionRepository;
    private final EmployeeRepository employeeRepository;

    public SalaryDeductionResponse create(SalaryDeductionRequest req) {
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found: " + req.getEmployeeId()));

        SalaryDeduction d = new SalaryDeduction();
        d.setEmployee(employee);
        d.setAmount(req.getAmount());
        d.setReason(req.getReason());
        d.setCreatedBy(req.getCreatedBy());

        return toResponse(deductionRepository.save(d));
    }

    public List<SalaryDeductionResponse> getAll() {
        return deductionRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SalaryDeductionResponse> getByEmployee(Long employeeId) {
        return deductionRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(Long id) {
        deductionRepository.deleteById(id);
    }

    private SalaryDeductionResponse toResponse(SalaryDeduction d) {
        SalaryDeductionResponse r = new SalaryDeductionResponse();
        r.setId(d.getId());
        r.setEmployeeId(d.getEmployee().getId());
        r.setEmployeeName(d.getEmployee().getFullName());
        r.setEmployeeCode(d.getEmployee().getCode());
        r.setAmount(d.getAmount());
        r.setReason(d.getReason());
        r.setDeductionDate(d.getDeductionDate());
        r.setCreatedBy(d.getCreatedBy());
        r.setCreatedAt(d.getCreatedAt());
        return r;
    }
}

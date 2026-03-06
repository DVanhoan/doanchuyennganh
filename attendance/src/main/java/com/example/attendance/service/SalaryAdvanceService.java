package com.example.attendance.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.attendance.dto.request.AdvanceActionRequest;
import com.example.attendance.dto.request.SalaryAdvanceRequest;
import com.example.attendance.dto.response.SalaryAdvanceResponse;
import com.example.attendance.exception.BadRequestException;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Employee;
import com.example.attendance.model.SalaryAdvance;
import com.example.attendance.model.enums.AdvanceStatus;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.SalaryAdvanceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryAdvanceService {

    private final SalaryAdvanceRepository advanceRepository;
    private final EmployeeRepository employeeRepository;

    public SalaryAdvanceResponse create(SalaryAdvanceRequest req) {
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found: " + req.getEmployeeId()));

        SalaryAdvance adv = new SalaryAdvance();
        adv.setEmployee(employee);
        adv.setAmount(req.getAmount());
        adv.setReason(req.getReason());
        adv.setStatus(AdvanceStatus.PENDING);

        return toResponse(advanceRepository.save(adv));
    }

    public List<SalaryAdvanceResponse> getAll() {
        return advanceRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SalaryAdvanceResponse> getByEmployee(Long employeeId) {
        return advanceRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SalaryAdvanceResponse> getPending() {
        return advanceRepository.findByStatusOrderByCreatedAtDesc(AdvanceStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SalaryAdvanceResponse processAction(Long id, AdvanceActionRequest action) {
        SalaryAdvance adv = advanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Advance not found: " + id));

        if (adv.getStatus() != AdvanceStatus.PENDING) {
            throw new BadRequestException("Advance already processed");
        }

        AdvanceStatus newStatus = AdvanceStatus.valueOf(action.getAction());
        adv.setStatus(newStatus);
        adv.setApprovedBy(action.getApprovedBy());
        adv.setResponseNote(action.getResponseNote());
        adv.setResponseDate(LocalDateTime.now());

        return toResponse(advanceRepository.save(adv));
    }

    public void delete(Long id) {
        advanceRepository.deleteById(id);
    }

    private SalaryAdvanceResponse toResponse(SalaryAdvance adv) {
        SalaryAdvanceResponse r = new SalaryAdvanceResponse();
        r.setId(adv.getId());
        r.setEmployeeId(adv.getEmployee().getId());
        r.setEmployeeName(adv.getEmployee().getFullName());
        r.setEmployeeCode(adv.getEmployee().getCode());
        r.setAmount(adv.getAmount());
        r.setReason(adv.getReason());
        r.setStatus(adv.getStatus().name());
        r.setRequestDate(adv.getRequestDate());
        r.setApprovedBy(adv.getApprovedBy());
        r.setResponseDate(adv.getResponseDate());
        r.setResponseNote(adv.getResponseNote());
        r.setCreatedAt(adv.getCreatedAt());
        return r;
    }
}

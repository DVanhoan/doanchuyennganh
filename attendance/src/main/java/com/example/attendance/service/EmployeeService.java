package com.example.attendance.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.attendance.dto.request.EmployeeRequest;
import com.example.attendance.dto.response.EmployeeResponse;
import com.example.attendance.exception.NotFoundException;
import com.example.attendance.model.Employee;
import com.example.attendance.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeResponse create(EmployeeRequest request) {
        Employee employee = new Employee();
        mapRequestToEntity(request, employee);
        if (employee.getIsActive() == null) {
            employee.setIsActive(true);
        }
        return toResponse(employeeRepository.save(employee));
    }

    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<EmployeeResponse> getActive() {
        return employeeRepository.findByIsActiveTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public EmployeeResponse getById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        return toResponse(employee);
    }

    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        mapRequestToEntity(request, employee);
        return toResponse(employeeRepository.save(employee));
    }

    public EmployeeResponse toggleActive(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        employee.setIsActive(!employee.getIsActive());
        return toResponse(employeeRepository.save(employee));
    }

    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    private void mapRequestToEntity(EmployeeRequest request, Employee employee) {
        employee.setCode(request.getCode());
        employee.setFullName(request.getFullName());
        employee.setPosition(request.getPosition());
        employee.setPhone(request.getPhone());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        employee.setHourlyRate(request.getHourlyRate());
        employee.setHireDate(request.getHireDate());
        if (request.getIsActive() != null) {
            employee.setIsActive(request.getIsActive());
        }
    }

    private EmployeeResponse toResponse(Employee e) {
        EmployeeResponse r = new EmployeeResponse();
        r.setId(e.getId());
        r.setCode(e.getCode());
        r.setFullName(e.getFullName());
        r.setPosition(e.getPosition());
        r.setPhone(e.getPhone());
        r.setEmail(e.getEmail());
        r.setDepartment(e.getDepartment());
        r.setHourlyRate(e.getHourlyRate());
        r.setHireDate(e.getHireDate());
        r.setIsActive(e.getIsActive());
        return r;
    }
}

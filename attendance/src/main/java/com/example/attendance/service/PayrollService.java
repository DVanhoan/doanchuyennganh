package com.example.attendance.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.attendance.dto.response.PayrollResponse;
import com.example.attendance.model.Attendance;
import com.example.attendance.model.Employee;
import com.example.attendance.model.enums.AdvanceStatus;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.repository.SalaryAdvanceRepository;
import com.example.attendance.repository.SalaryDeductionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayrollService {

        private final EmployeeRepository employeeRepository;
        private final AttendanceRepository attendanceRepository;
        private final SalaryAdvanceRepository advanceRepository;
        private final SalaryDeductionRepository deductionRepository;

        public List<PayrollResponse> computePayroll(LocalDate from, LocalDate to) {
                List<Employee> activeEmployees = employeeRepository.findByIsActiveTrue();
                LocalDateTime start = from.atStartOfDay();
                LocalDateTime end = to.plusDays(1).atStartOfDay();

                List<PayrollResponse> result = new ArrayList<>();

                for (Employee emp : activeEmployees) {
                        List<Attendance> attendances = attendanceRepository.findByDateRange(start, end, emp.getId());

                        int totalShifts = attendances.size();
                        int totalWorked = attendances.stream()
                                        .mapToInt(a -> a.getWorkedMinutes() != null ? a.getWorkedMinutes() : 0).sum();
                        int totalLate = attendances.stream()
                                        .mapToInt(a -> a.getLateMinutes() != null ? a.getLateMinutes() : 0).sum();
                        int totalEarly = attendances.stream()
                                        .mapToInt(a -> a.getEarlyLeaveMinutes() != null ? a.getEarlyLeaveMinutes() : 0)
                                        .sum();

                        BigDecimal hourlyRate = emp.getHourlyRate() != null ? emp.getHourlyRate() : BigDecimal.ZERO;
                        BigDecimal workedHours = BigDecimal.valueOf(totalWorked).divide(BigDecimal.valueOf(60), 2,
                                        RoundingMode.HALF_UP);
                        BigDecimal grossPay = hourlyRate.multiply(workedHours);

                        BigDecimal totalAdvances = advanceRepository
                                        .findByEmployeeIdAndStatusAndRequestDateBetween(emp.getId(),
                                                        AdvanceStatus.APPROVED, from, to)
                                        .stream()
                                        .map(a -> a.getAmount() != null ? a.getAmount() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal totalDeductions = deductionRepository
                                        .findByEmployeeIdAndDeductionDateBetween(emp.getId(), from, to)
                                        .stream()
                                        .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal netPay = grossPay.subtract(totalAdvances).subtract(totalDeductions);

                        PayrollResponse s = new PayrollResponse();
                        s.setEmployeeId(emp.getId());
                        s.setEmployeeName(emp.getFullName());
                        s.setEmployeeCode(emp.getCode());
                        s.setDepartment(emp.getDepartment());
                        s.setHourlyRate(hourlyRate);
                        s.setTotalShifts(totalShifts);
                        s.setTotalWorkedMinutes(totalWorked);
                        s.setTotalLateMinutes(totalLate);
                        s.setTotalEarlyLeaveMinutes(totalEarly);
                        s.setGrossPay(grossPay);
                        s.setTotalAdvances(totalAdvances);
                        s.setTotalDeductions(totalDeductions);
                        s.setNetPay(netPay);

                        result.add(s);
                }

                return result;
        }
}

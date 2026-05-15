package com.terminal.management.service;

import com.terminal.management.dto.AlertRuleDTO;
import com.terminal.management.model.Alert;
import com.terminal.management.model.AlertRule;
import com.terminal.management.repository.AlertRepository;
import com.terminal.management.repository.AlertRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertRepository alertRepository;

    public List<AlertRuleDTO> getAlertRules() {
        return alertRuleRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toRuleDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertRuleDTO createAlertRule(AlertRuleDTO dto) {
        AlertRule rule = AlertRule.builder()
                .name(dto.getName())
                .metricType(dto.getMetricType())
                .operator(dto.getOperator())
                .threshold(dto.getThreshold())
                .severity(dto.getSeverity())
                .enabled(dto.getEnabled() != null ? dto.getEnabled() : true)
                .notifyChannels(dto.getNotifyChannels())
                .build();
        return toRuleDTO(alertRuleRepository.save(rule));
    }

    @Transactional
    public AlertRuleDTO updateAlertRule(Long id, AlertRuleDTO dto) {
        AlertRule rule = alertRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert rule not found"));
        if (dto.getName() != null) rule.setName(dto.getName());
        if (dto.getMetricType() != null) rule.setMetricType(dto.getMetricType());
        if (dto.getOperator() != null) rule.setOperator(dto.getOperator());
        if (dto.getThreshold() != null) rule.setThreshold(dto.getThreshold());
        if (dto.getSeverity() != null) rule.setSeverity(dto.getSeverity());
        if (dto.getEnabled() != null) rule.setEnabled(dto.getEnabled());
        if (dto.getNotifyChannels() != null) rule.setNotifyChannels(dto.getNotifyChannels());
        return toRuleDTO(alertRuleRepository.save(rule));
    }

    @Transactional
    public void deleteAlertRule(Long id) {
        alertRuleRepository.deleteById(id);
    }

    public Page<Alert> getAlerts(String status, Long deviceId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return alertRepository.findByFilters(status, deviceId, pageable);
    }

    @Transactional
    public Alert updateAlertStatus(Long id, String status) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(status);
        return alertRepository.save(alert);
    }

    private AlertRuleDTO toRuleDTO(AlertRule rule) {
        return AlertRuleDTO.builder()
                .id(rule.getId())
                .name(rule.getName())
                .metricType(rule.getMetricType())
                .operator(rule.getOperator())
                .threshold(rule.getThreshold())
                .severity(rule.getSeverity())
                .enabled(rule.getEnabled())
                .notifyChannels(rule.getNotifyChannels())
                .build();
    }
}

package com.terminal.management.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.terminal.management.dto.ReportRequest;
import com.terminal.management.model.Alert;
import com.terminal.management.model.AlertRule;
import com.terminal.management.model.Device;
import com.terminal.management.model.Metrics;
import com.terminal.management.repository.AlertRepository;
import com.terminal.management.repository.AlertRuleRepository;
import com.terminal.management.repository.MetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final MetricsRepository metricsRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final AlertRepository alertRepository;
    private final DeviceService deviceService;

    @Transactional
    public Metrics reportData(String deviceId, ReportRequest request) {
        Device device = deviceService.updateReportTime(deviceId);

        Metrics metrics = Metrics.builder()
                .deviceId(device.getId())
                .cpuUsage(request.getCpuUsage())
                .memoryUsage(request.getMemoryUsage())
                .diskUsage(request.getDiskUsage())
                .networkStatus(request.getNetworkStatus())
                .rawData(request.getRawData())
                .build();
        metrics = metricsRepository.save(metrics);

        evaluateAlertRules(device.getId(), metrics);

        return metrics;
    }

    private void evaluateAlertRules(Long deviceId, Metrics metrics) {
        List<AlertRule> rules = alertRuleRepository.findByEnabledTrue();
        for (AlertRule rule : rules) {
            Double value = getMetricValue(metrics, rule.getMetricType());
            if (value != null && isThresholdExceeded(value, rule.getOperator(), rule.getThreshold())) {
                Alert alert = Alert.builder()
                        .deviceId(deviceId)
                        .ruleId(rule.getId())
                        .metricType(rule.getMetricType())
                        .currentValue(value)
                        .threshold(rule.getThreshold())
                        .severity(rule.getSeverity())
                        .status("active")
                        .message(buildAlertMessage(rule, value))
                        .build();
                alertRepository.save(alert);
                log.info("Alert triggered: device={}, rule={}, metric={}, value={}",
                        deviceId, rule.getName(), rule.getMetricType(), value);
            }
        }
    }

    private Double getMetricValue(Metrics metrics, String metricType) {
        return switch (metricType) {
            case "cpu" -> metrics.getCpuUsage();
            case "memory" -> metrics.getMemoryUsage();
            case "disk" -> metrics.getDiskUsage();
            default -> null;
        };
    }

    private boolean isThresholdExceeded(Double value, String operator, Double threshold) {
        return switch (operator) {
            case ">" -> value > threshold;
            case ">=" -> value >= threshold;
            case "<" -> value < threshold;
            case "<=" -> value <= threshold;
            case "==" -> value.equals(threshold);
            default -> false;
        };
    }

    private String buildAlertMessage(AlertRule rule, Double value) {
        return String.format("告警规则[%s]触发: %s %s %.1f, 当前值: %.1f",
                rule.getName(), rule.getMetricType(), rule.getOperator(), rule.getThreshold(), value);
    }
}

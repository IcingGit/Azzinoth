package com.terminal.management.controller;

import com.terminal.management.dto.AlertRuleDTO;
import com.terminal.management.dto.ApiResponse;
import com.terminal.management.model.Alert;
import com.terminal.management.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/rules")
    public ApiResponse<List<AlertRuleDTO>> getAlertRules() {
        List<AlertRuleDTO> rules = alertService.getAlertRules();
        return ApiResponse.success(rules);
    }

    @PostMapping("/rules")
    public ApiResponse<AlertRuleDTO> createAlertRule(@RequestBody AlertRuleDTO dto) {
        AlertRuleDTO created = alertService.createAlertRule(dto);
        return ApiResponse.success("Alert rule created", created);
    }

    @PutMapping("/rules/{id}")
    public ApiResponse<AlertRuleDTO> updateAlertRule(@PathVariable Long id, @RequestBody AlertRuleDTO dto) {
        AlertRuleDTO updated = alertService.updateAlertRule(id, dto);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/rules/{id}")
    public ApiResponse<Void> deleteAlertRule(@PathVariable Long id) {
        alertService.deleteAlertRule(id);
        return ApiResponse.success("Alert rule deleted", null);
    }

    @GetMapping
    public ApiResponse<Page<Alert>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long deviceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Alert> alerts = alertService.getAlerts(status, deviceId, page, size);
        return ApiResponse.success(alerts);
    }

    @PutMapping("/{id}")
    public ApiResponse<Alert> updateAlertStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Alert updated = alertService.updateAlertStatus(id, status);
        return ApiResponse.success(updated);
    }
}

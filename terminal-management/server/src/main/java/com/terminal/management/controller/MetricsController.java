package com.terminal.management.controller;

import com.terminal.management.dto.ApiResponse;
import com.terminal.management.model.Metrics;
import com.terminal.management.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/{deviceId}")
    public ApiResponse<Page<Metrics>> getDeviceMetrics(
            @PathVariable Long deviceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Metrics> metrics = metricsService.getDeviceMetrics(deviceId, page, size);
        return ApiResponse.success(metrics);
    }

    @GetMapping("/{deviceId}/realtime")
    public ApiResponse<Map<String, Object>> getRealtimeStatus(@PathVariable Long deviceId) {
        Map<String, Object> status = metricsService.getRealtimeStatus(deviceId);
        return ApiResponse.success(status);
    }
}

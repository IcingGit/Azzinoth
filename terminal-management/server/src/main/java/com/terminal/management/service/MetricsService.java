package com.terminal.management.service;

import com.terminal.management.model.Metrics;
import com.terminal.management.repository.MetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final MetricsRepository metricsRepository;

    public Page<Metrics> getDeviceMetrics(Long deviceId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return metricsRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, pageable);
    }

    public Map<String, Object> getRealtimeStatus(Long deviceId) {
        Metrics latest = metricsRepository.findTopByDeviceIdOrderByCreatedAtDesc(deviceId);
        Map<String, Object> result = new HashMap<>();
        if (latest != null) {
            result.put("deviceId", deviceId);
            result.put("cpuUsage", latest.getCpuUsage());
            result.put("memoryUsage", latest.getMemoryUsage());
            result.put("diskUsage", latest.getDiskUsage());
            result.put("networkStatus", latest.getNetworkStatus());
            result.put("lastReportTime", latest.getCreatedAt());
        }
        return result;
    }
}

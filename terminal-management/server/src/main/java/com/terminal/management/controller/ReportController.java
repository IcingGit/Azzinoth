package com.terminal.management.controller;

import com.terminal.management.dto.ApiResponse;
import com.terminal.management.dto.DeviceDTO;
import com.terminal.management.dto.RegisterRequest;
import com.terminal.management.dto.ReportRequest;
import com.terminal.management.model.Metrics;
import com.terminal.management.service.DeviceService;
import com.terminal.management.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class ReportController {

    private final DeviceService deviceService;
    private final ReportService reportService;

    @PostMapping("/register")
    public ApiResponse<DeviceDTO> registerDevice(@RequestBody RegisterRequest request) {
        DeviceDTO device = deviceService.registerDevice(request);
        return ApiResponse.success("Device registered", device);
    }

    @PostMapping("/{deviceId}/report")
    public ApiResponse<Metrics> reportData(@PathVariable String deviceId, @RequestBody ReportRequest request) {
        Metrics metrics = reportService.reportData(deviceId, request);
        return ApiResponse.success("Data reported", metrics);
    }
}

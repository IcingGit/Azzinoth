package com.terminal.management.controller;

import com.terminal.management.dto.ApiResponse;
import com.terminal.management.dto.DeviceDTO;
import com.terminal.management.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ApiResponse<Page<DeviceDTO>> getDevices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DeviceDTO> devices = deviceService.getDevices(keyword, status, page, size);
        return ApiResponse.success(devices);
    }

    @GetMapping("/{id}")
    public ApiResponse<DeviceDTO> getDeviceById(@PathVariable Long id) {
        return deviceService.getDeviceById(id)
                .map(ApiResponse::success)
                .orElse(ApiResponse.error(404, "Device not found"));
    }

    @PutMapping("/{id}")
    public ApiResponse<DeviceDTO> updateDevice(@PathVariable Long id, @RequestBody DeviceDTO dto) {
        DeviceDTO updated = deviceService.updateDevice(id, dto);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ApiResponse.success("Device deleted", null);
    }
}

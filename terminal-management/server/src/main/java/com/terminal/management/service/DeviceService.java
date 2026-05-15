package com.terminal.management.service;

import com.terminal.management.dto.DeviceDTO;
import com.terminal.management.dto.RegisterRequest;
import com.terminal.management.model.Device;
import com.terminal.management.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public Page<DeviceDTO> getDevices(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Device> devices = deviceRepository.findByFilters(status, keyword, pageable);
        return devices.map(this::toDTO);
    }

    public Optional<DeviceDTO> getDeviceById(Long id) {
        return deviceRepository.findById(id).map(this::toDTO);
    }

    @Transactional
    public DeviceDTO registerDevice(RegisterRequest request) {
        Optional<Device> existing = deviceRepository.findByDeviceId(request.getDeviceId());
        if (existing.isPresent()) {
            Device device = existing.get();
            device.setName(request.getName());
            device.setHostname(request.getHostname());
            device.setOsVersion(request.getOsVersion());
            device.setCpuModel(request.getCpuModel());
            device.setMemoryTotal(request.getMemoryTotal());
            device.setDiskTotal(request.getDiskTotal());
            device.setIpAddress(request.getIpAddress());
            device.setHardwareInfo(request.getHardwareInfo());
            device.setSystemInfo(request.getSystemInfo());
            device.setStatus("online");
            device.setLastReportTime(LocalDateTime.now());
            return toDTO(deviceRepository.save(device));
        }

        Device device = Device.builder()
                .deviceId(request.getDeviceId())
                .name(request.getName())
                .hostname(request.getHostname())
                .osVersion(request.getOsVersion())
                .cpuModel(request.getCpuModel())
                .memoryTotal(request.getMemoryTotal())
                .diskTotal(request.getDiskTotal())
                .ipAddress(request.getIpAddress())
                .hardwareInfo(request.getHardwareInfo())
                .systemInfo(request.getSystemInfo())
                .status("online")
                .lastReportTime(LocalDateTime.now())
                .build();
        return toDTO(deviceRepository.save(device));
    }

    @Transactional
    public DeviceDTO updateDevice(Long id, DeviceDTO dto) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        if (dto.getName() != null) device.setName(dto.getName());
        if (dto.getHostname() != null) device.setHostname(dto.getHostname());
        if (dto.getOsVersion() != null) device.setOsVersion(dto.getOsVersion());
        if (dto.getCpuModel() != null) device.setCpuModel(dto.getCpuModel());
        if (dto.getMemoryTotal() != null) device.setMemoryTotal(dto.getMemoryTotal());
        if (dto.getDiskTotal() != null) device.setDiskTotal(dto.getDiskTotal());
        if (dto.getIpAddress() != null) device.setIpAddress(dto.getIpAddress());
        if (dto.getStatus() != null) device.setStatus(dto.getStatus());
        if (dto.getHardwareInfo() != null) device.setHardwareInfo(dto.getHardwareInfo());
        if (dto.getSystemInfo() != null) device.setSystemInfo(dto.getSystemInfo());
        return toDTO(deviceRepository.save(device));
    }

    @Transactional
    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }

    @Transactional
    public Device updateReportTime(String deviceId) {
        Device device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setStatus("online");
        device.setLastReportTime(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    public Long getDeviceIdByDeviceId(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId)
                .map(Device::getId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
    }

    private DeviceDTO toDTO(Device device) {
        return DeviceDTO.builder()
                .id(device.getId())
                .deviceId(device.getDeviceId())
                .name(device.getName())
                .hostname(device.getHostname())
                .osVersion(device.getOsVersion())
                .cpuModel(device.getCpuModel())
                .memoryTotal(device.getMemoryTotal())
                .diskTotal(device.getDiskTotal())
                .ipAddress(device.getIpAddress())
                .status(device.getStatus())
                .lastReportTime(device.getLastReportTime())
                .hardwareInfo(device.getHardwareInfo())
                .systemInfo(device.getSystemInfo())
                .createdAt(device.getCreatedAt())
                .updatedAt(device.getUpdatedAt())
                .build();
    }
}

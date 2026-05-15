package com.terminal.management.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO {

    private Long id;
    private String deviceId;
    private String name;
    private String hostname;
    private String osVersion;
    private String cpuModel;
    private Long memoryTotal;
    private Long diskTotal;
    private String ipAddress;
    private String status;
    private LocalDateTime lastReportTime;
    private JsonNode hardwareInfo;
    private JsonNode systemInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.terminal.management.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String deviceId;
    private String name;
    private String hostname;
    private String osVersion;
    private String cpuModel;
    private Long memoryTotal;
    private Long diskTotal;
    private String ipAddress;
    private JsonNode hardwareInfo;
    private JsonNode systemInfo;
}

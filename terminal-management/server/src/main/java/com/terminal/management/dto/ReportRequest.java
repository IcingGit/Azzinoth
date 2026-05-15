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
public class ReportRequest {

    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    private String networkStatus;
    private JsonNode rawData;
}

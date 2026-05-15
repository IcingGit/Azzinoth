package com.terminal.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleDTO {

    private Long id;
    private String name;
    private String metricType;
    private String operator;
    private Double threshold;
    private String severity;
    private Boolean enabled;
    private String notifyChannels;
}

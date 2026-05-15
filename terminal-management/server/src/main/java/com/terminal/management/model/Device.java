package com.terminal.management.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;

    @Column(nullable = false)
    private String name;

    private String hostname;

    @Column(name = "os_version")
    private String osVersion;

    @Column(name = "cpu_model")
    private String cpuModel;

    @Column(name = "memory_total")
    private Long memoryTotal;

    @Column(name = "disk_total")
    private Long diskTotal;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(nullable = false)
    private String status;

    @Column(name = "last_report_time")
    private LocalDateTime lastReportTime;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hardware_info", columnDefinition = "jsonb")
    private JsonNode hardwareInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "system_info", columnDefinition = "jsonb")
    private JsonNode systemInfo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @jakarta.persistence.PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

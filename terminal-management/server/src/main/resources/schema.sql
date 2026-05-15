CREATE TABLE IF NOT EXISTS devices (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255),
    os_version VARCHAR(255),
    cpu_model VARCHAR(255),
    memory_total BIGINT,
    disk_total BIGINT,
    ip_address VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'offline',
    last_report_time TIMESTAMP,
    hardware_info JSONB,
    system_info JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_channels VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL,
    rule_id BIGINT NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    current_value DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metrics (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL,
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION,
    disk_usage DOUBLE PRECISION,
    network_status VARCHAR(50),
    raw_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_metrics_device_id ON metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);

INSERT INTO devices (device_id, name, hostname, os_version, cpu_model, memory_total, disk_total, ip_address, status, last_report_time, hardware_info, system_info)
VALUES
    ('DEV-001', 'Production Server 01', 'prod-srv-01', 'Ubuntu 22.04 LTS', 'Intel Xeon E5-2680 v4', 32768, 512000, '192.168.1.101', 'online', NOW(), '{"cpu_cores": 14, "cpu_threads": 28, "gpu": "NVIDIA Tesla P100"}', '{"kernel": "5.15.0-91-generic", "uptime": 864000, "processes": 245}'),
    ('DEV-002', 'Database Server', 'db-srv-01', 'CentOS 8', 'AMD EPYC 7742', 65536, 1024000, '192.168.1.102', 'online', NOW(), '{"cpu_cores": 64, "cpu_threads": 128, "gpu": null}', '{"kernel": "4.18.0-477.el8", "uptime": 1728000, "processes": 189}'),
    ('DEV-003', 'Development Workstation', 'dev-ws-01', 'macOS Ventura', 'Apple M2 Pro', 16384, 256000, '192.168.1.201', 'offline', NOW() - INTERVAL '2 hours', '{"cpu_cores": 12, "cpu_threads": 12, "gpu": "Apple M2 Pro GPU"}', '{"kernel": "Darwin 22.6.0", "uptime": 0, "processes": 0}');

INSERT INTO alert_rules (name, metric_type, operator, threshold, severity, enabled, notify_channels)
VALUES
    ('CPU Usage High', 'cpu', '>', 80.0, 'warning', TRUE, 'email,slack'),
    ('CPU Usage Critical', 'cpu', '>', 95.0, 'critical', TRUE, 'email,slack,sms'),
    ('Memory Usage High', 'memory', '>', 85.0, 'warning', TRUE, 'email,slack'),
    ('Memory Usage Critical', 'memory', '>', 95.0, 'critical', TRUE, 'email,slack,sms'),
    ('Disk Usage High', 'disk', '>', 90.0, 'warning', TRUE, 'email'),
    ('Disk Usage Critical', 'disk', '>', 98.0, 'critical', TRUE, 'email,sms');

INSERT INTO metrics (device_id, cpu_usage, memory_usage, disk_usage, network_status, raw_data)
VALUES
    (1, 45.2, 62.8, 55.3, 'connected', '{"network_rx": 1024000, "network_tx": 512000, "load_avg": [2.5, 3.1, 2.8]}'),
    (1, 52.1, 65.4, 55.5, 'connected', '{"network_rx": 987000, "network_tx": 489000, "load_avg": [3.2, 3.5, 3.0]}'),
    (2, 32.5, 78.9, 72.1, 'connected', '{"network_rx": 2048000, "network_tx": 1024000, "load_avg": [1.8, 2.0, 1.9]}'),
    (2, 35.8, 80.2, 72.4, 'connected', '{"network_rx": 2156000, "network_tx": 1102000, "load_avg": [2.1, 2.3, 2.0]}'),
    (3, 0.0, 0.0, 45.2, 'disconnected', '{"network_rx": 0, "network_tx": 0, "load_avg": [0, 0, 0]}');

using System.Text.Json;
using TerminalAgent.Models;

namespace TerminalAgent.Services;

public class ConfigManager
{
    private readonly ILogger<ConfigManager> _logger;
    private readonly string _configFilePath;
    private readonly string _deviceInfoPath;
    private readonly object _lock = new();
    private AgentConfig _config;

    public ConfigManager(ILogger<ConfigManager> logger)
    {
        _logger = logger;
        _configFilePath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        _deviceInfoPath = Path.Combine(AppContext.BaseDirectory, "device.json");
        _config = LoadConfig();
    }

    public string ServerUrl => _config.ServerUrl;
    public int ReportIntervalSeconds => _config.ReportIntervalSeconds;
    public string LogLevel => _config.LogLevel;
    public int MaxCacheRetryCount => _config.MaxCacheRetryCount;
    public int HttpTimeoutSeconds => _config.HttpTimeoutSeconds;

    public DeviceInfo LoadDeviceInfo()
    {
        try
        {
            if (File.Exists(_deviceInfoPath))
            {
                var json = File.ReadAllText(_deviceInfoPath);
                return JsonSerializer.Deserialize<DeviceInfo>(json) ?? CreateNewDeviceInfo();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "加载设备信息失败, 将创建新设备ID");
        }

        return CreateNewDeviceInfo();
    }

    public void SaveDeviceInfo(DeviceInfo deviceInfo)
    {
        try
        {
            var json = JsonSerializer.Serialize(deviceInfo, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_deviceInfoPath, json);
            _logger.LogInformation("设备信息已保存: {DeviceId}", deviceInfo.DeviceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "保存设备信息失败");
        }
    }

    public bool IsDeviceRegistered()
    {
        return File.Exists(_deviceInfoPath);
    }

    public void ReloadConfig()
    {
        lock (_lock)
        {
            _config = LoadConfig();
            _logger.LogInformation("配置已重新加载");
        }
    }

    private AgentConfig LoadConfig()
    {
        try
        {
            if (File.Exists(_configFilePath))
            {
                var json = File.ReadAllText(_configFilePath);
                var config = JsonSerializer.Deserialize<AgentConfig>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (config != null)
                {
                    return config;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "加载配置文件失败, 使用默认配置");
        }

        return new AgentConfig();
    }

    private DeviceInfo CreateNewDeviceInfo()
    {
        var deviceInfo = new DeviceInfo
        {
            DeviceId = Guid.NewGuid().ToString("N"),
            HostName = Environment.MachineName,
            FirstSeen = DateTime.UtcNow,
            LastSeen = DateTime.UtcNow
        };

        SaveDeviceInfo(deviceInfo);
        return deviceInfo;
    }

    private class AgentConfig
    {
        public string ServerUrl { get; set; } = "http://localhost:5000";
        public int ReportIntervalSeconds { get; set; } = 300;
        public string LogLevel { get; set; } = "Information";
        public int MaxCacheRetryCount { get; set; } = 100;
        public int HttpTimeoutSeconds { get; set; } = 30;
    }
}

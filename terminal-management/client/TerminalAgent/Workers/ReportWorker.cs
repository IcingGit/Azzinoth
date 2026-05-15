using TerminalAgent.Models;
using TerminalAgent.Services;

namespace TerminalAgent.Workers;

public class ReportWorker : BackgroundService
{
    private readonly SystemInfoCollector _collector;
    private readonly DataReporter _reporter;
    private readonly ConfigManager _configManager;
    private readonly ILogger<ReportWorker> _logger;
    private DeviceInfo? _deviceInfo;
    private bool _isRegistered;

    public ReportWorker(
        SystemInfoCollector collector,
        DataReporter reporter,
        ConfigManager configManager,
        ILogger<ReportWorker> logger)
    {
        _collector = collector;
        _reporter = reporter;
        _configManager = configManager;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("终端管理代理服务启动");

        _deviceInfo = _configManager.LoadDeviceInfo();
        _logger.LogInformation("设备ID: {DeviceId}", _deviceInfo.DeviceId);

        if (!_configManager.IsDeviceRegistered())
        {
            await RegisterDeviceAsync();
        }
        else
        {
            _isRegistered = true;
            _logger.LogInformation("设备已注册, 跳过注册步骤");
        }

        _deviceInfo.LastSeen = DateTime.UtcNow;
        _configManager.SaveDeviceInfo(_deviceInfo);

        var cachedCount = _reporter.GetCachedDataCount();
        if (cachedCount > 0)
        {
            _logger.LogInformation("发现 {Count} 条离线缓存数据, 将在下次上报时重试", cachedCount);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CollectAndReportAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "数据采集或上报过程中发生错误");
            }

            var interval = TimeSpan.FromSeconds(_configManager.ReportIntervalSeconds);
            _logger.LogDebug("等待 {Seconds} 秒后进行下次采集", interval.TotalSeconds);

            await Task.Delay(interval, stoppingToken);
        }

        _logger.LogInformation("终端管理代理服务停止");
    }

    private async Task RegisterDeviceAsync()
    {
        _logger.LogInformation("开始设备注册...");

        var maxRetries = 5;
        for (var i = 0; i < maxRetries; i++)
        {
            try
            {
                var hardware = _collector.CollectHardwareInfo();
                var system = _collector.CollectSystemInfo();

                var request = new RegisterRequest
                {
                    DeviceId = _deviceInfo!.DeviceId,
                    HostName = _deviceInfo.HostName,
                    Hardware = hardware,
                    System = system
                };

                var success = await _reporter.RegisterDeviceAsync(request);
                if (success)
                {
                    _isRegistered = true;
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "设备注册第 {Attempt} 次尝试失败", i + 1);
            }

            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, i) * 5));
        }

        _logger.LogWarning("设备注册失败, 将在后续上报时重试");
    }

    private async Task CollectAndReportAsync()
    {
        _logger.LogInformation("开始采集系统数据...");

        var hardware = _collector.CollectHardwareInfo();
        var system = _collector.CollectSystemInfo();
        var runtime = _collector.CollectRuntimeStatus();

        var reportData = new ReportData
        {
            DeviceId = _deviceInfo!.DeviceId,
            Hardware = hardware,
            System = system,
            Runtime = runtime,
            Timestamp = DateTime.UtcNow
        };

        _logger.LogInformation("数据采集完成, 开始上报");

        if (!_isRegistered)
        {
            await RegisterDeviceAsync();
        }

        var success = await _reporter.ReportAsync(reportData);

        if (success)
        {
            _deviceInfo.LastSeen = DateTime.UtcNow;
            _configManager.SaveDeviceInfo(_deviceInfo);
        }

        _logger.LogInformation("上报完成, 结果: {Result}", success ? "成功" : "失败(已缓存)");
    }
}

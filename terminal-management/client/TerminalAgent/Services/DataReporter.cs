using System.Text;
using System.Text.Json;
using TerminalAgent.Models;

namespace TerminalAgent.Services;

public class DataReporter
{
    private readonly HttpClient _httpClient;
    private readonly ConfigManager _configManager;
    private readonly ILogger<DataReporter> _logger;
    private readonly string _cacheDirectory;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public DataReporter(HttpClient httpClient, ConfigManager configManager, ILogger<DataReporter> logger)
    {
        _httpClient = httpClient;
        _configManager = configManager;
        _logger = logger;
        _cacheDirectory = Path.Combine(AppContext.BaseDirectory, "offline_cache");
        Directory.CreateDirectory(_cacheDirectory);
    }

    public async Task<bool> RegisterDeviceAsync(RegisterRequest request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var baseUrl = _configManager.ServerUrl.TrimEnd('/');
            var response = await _httpClient.PostAsync($"{baseUrl}/api/devices/register", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("设备注册成功: {DeviceId}", request.DeviceId);
                return true;
            }

            _logger.LogWarning("设备注册失败: {StatusCode}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "设备注册异常");
            return false;
        }
    }

    public async Task<bool> ReportAsync(ReportData data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var baseUrl = _configManager.ServerUrl.TrimEnd('/');
            var response = await _httpClient.PostAsync($"{baseUrl}/api/devices/{data.DeviceId}/report", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("数据上报成功");
                await SendCachedDataAsync();
                return true;
            }

            _logger.LogWarning("数据上报失败: {StatusCode}, 缓存到本地", response.StatusCode);
            await CacheDataAsync(data);
            return false;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "无法连接服务器, 缓存到本地");
            await CacheDataAsync(data);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "数据上报异常");
            await CacheDataAsync(data);
            return false;
        }
    }

    private async Task CacheDataAsync(ReportData data)
    {
        try
        {
            var fileName = $"report_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.json";
            var filePath = Path.Combine(_cacheDirectory, fileName);
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
            _logger.LogInformation("数据已缓存: {FileName}", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "缓存数据失败");
        }
    }

    private async Task SendCachedDataAsync()
    {
        try
        {
            var cacheFiles = Directory.GetFiles(_cacheDirectory, "report_*.json")
                .OrderBy(f => f)
                .ToList();

            if (cacheFiles.Count == 0) return;

            _logger.LogInformation("发现 {Count} 条缓存数据, 开始重试发送", cacheFiles.Count);
            var maxRetry = _configManager.MaxCacheRetryCount;
            var sentCount = 0;

            foreach (var filePath in cacheFiles.Take(maxRetry))
            {
                try
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var baseUrl = _configManager.ServerUrl.TrimEnd('/');
                    var reportData = JsonSerializer.Deserialize<ReportData>(json, _jsonOptions);
                    var deviceId = reportData?.DeviceId ?? "unknown";
                    var response = await _httpClient.PostAsync($"{baseUrl}/api/devices/{deviceId}/report", content);

                    if (response.IsSuccessStatusCode)
                    {
                        File.Delete(filePath);
                        sentCount++;
                    }
                    else
                    {
                        _logger.LogWarning("缓存数据发送失败: {FilePath}, Status: {StatusCode}", filePath, response.StatusCode);
                        break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "缓存数据发送异常: {FilePath}", filePath);
                    break;
                }
            }

            if (sentCount > 0)
            {
                _logger.LogInformation("成功发送 {Count} 条缓存数据", sentCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "处理缓存数据异常");
        }
    }

    public int GetCachedDataCount()
    {
        try
        {
            return Directory.GetFiles(_cacheDirectory, "report_*.json").Length;
        }
        catch
        {
            return 0;
        }
    }
}

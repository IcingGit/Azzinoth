namespace TerminalAgent.Models;

public class ReportData
{
    public string DeviceId { get; set; } = string.Empty;
    public HardwareInfo Hardware { get; set; } = new();
    public SystemInfo System { get; set; } = new();
    public RuntimeStatus Runtime { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

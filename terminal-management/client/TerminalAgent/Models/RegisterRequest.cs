namespace TerminalAgent.Models;

public class RegisterRequest
{
    public string DeviceId { get; set; } = string.Empty;
    public string HostName { get; set; } = string.Empty;
    public HardwareInfo Hardware { get; set; } = new();
    public SystemInfo System { get; set; } = new();
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}

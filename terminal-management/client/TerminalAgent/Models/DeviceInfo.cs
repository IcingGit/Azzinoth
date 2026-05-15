namespace TerminalAgent.Models;

public class DeviceInfo
{
    public string DeviceId { get; set; } = string.Empty;
    public string HostName { get; set; } = string.Empty;
    public DateTime FirstSeen { get; set; }
    public DateTime LastSeen { get; set; }
}

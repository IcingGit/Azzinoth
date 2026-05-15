namespace TerminalAgent.Models;

public class SystemInfo
{
    public OsInfo Os { get; set; } = new();
    public HostInfo Host { get; set; } = new();
}

public class OsInfo
{
    public string Version { get; set; } = string.Empty;
    public string BuildNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public bool IsActivated { get; set; }
    public string Architecture { get; set; } = string.Empty;
}

public class HostInfo
{
    public string HostName { get; set; } = string.Empty;
    public string DomainName { get; set; } = string.Empty;
    public string Workgroup { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

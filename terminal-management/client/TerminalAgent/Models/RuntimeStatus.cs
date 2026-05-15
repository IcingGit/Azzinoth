namespace TerminalAgent.Models;

public class RuntimeStatus
{
    public CpuStatus Cpu { get; set; } = new();
    public MemoryStatus Memory { get; set; } = new();
    public List<DiskPartitionStatus> DiskPartitions { get; set; } = [];
    public NetworkStatus Network { get; set; } = new();
    public DateTime CollectedAt { get; set; } = DateTime.UtcNow;
}

public class CpuStatus
{
    public double UsagePercent { get; set; }
    public double TemperatureCelsius { get; set; }
}

public class MemoryStatus
{
    public double UsagePercent { get; set; }
    public long TotalMB { get; set; }
    public long AvailableMB { get; set; }
    public long UsedMB { get; set; }
}

public class DiskPartitionStatus
{
    public string DeviceId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public long TotalGB { get; set; }
    public long FreeGB { get; set; }
    public long UsedGB { get; set; }
    public double UsagePercent { get; set; }
}

public class NetworkStatus
{
    public bool IsConnected { get; set; }
    public long BytesSent { get; set; }
    public long BytesReceived { get; set; }
    public List<NetworkInterfaceStatus> Interfaces { get; set; } = [];
}

public class NetworkInterfaceStatus
{
    public string Name { get; set; } = string.Empty;
    public long BytesSent { get; set; }
    public long BytesReceived { get; set; }
}

namespace TerminalAgent.Models;

public class HardwareInfo
{
    public CpuInfo Cpu { get; set; } = new();
    public List<MemoryInfo> Memories { get; set; } = [];
    public List<DiskInfo> Disks { get; set; } = [];
    public MotherboardInfo Motherboard { get; set; } = new();
    public List<NetworkAdapterInfo> NetworkAdapters { get; set; } = [];
    public List<UsbDeviceInfo> UsbDevices { get; set; } = [];
}

public class CpuInfo
{
    public string Model { get; set; } = string.Empty;
    public int Cores { get; set; }
    public int LogicalProcessors { get; set; }
    public double MaxFrequencyMHz { get; set; }
    public long L2CacheSizeKB { get; set; }
    public long L3CacheSizeKB { get; set; }
    public string Manufacturer { get; set; } = string.Empty;
}

public class MemoryInfo
{
    public string Model { get; set; } = string.Empty;
    public long CapacityMB { get; set; }
    public double SpeedMHz { get; set; }
    public string MemoryType { get; set; } = string.Empty;
    public string Slot { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
}

public class DiskInfo
{
    public string Model { get; set; } = string.Empty;
    public long CapacityGB { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public string InterfaceType { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
}

public class MotherboardInfo
{
    public string Model { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
}

public class NetworkAdapterInfo
{
    public string Model { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public long SpeedMbps { get; set; }
    public bool IsEnabled { get; set; }
    public string IPAddress { get; set; } = string.Empty;
}

public class UsbDeviceInfo
{
    public string Name { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public string DeviceId { get; set; } = string.Empty;
}

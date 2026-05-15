using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using TerminalAgent.Models;

namespace TerminalAgent.Services;

public class SystemInfoCollector
{
    public HardwareInfo CollectHardwareInfo()
    {
        return new HardwareInfo
        {
            Cpu = CollectCpuInfo(),
            Memories = CollectMemoryInfo(),
            Disks = CollectDiskInfo(),
            Motherboard = CollectMotherboardInfo(),
            NetworkAdapters = CollectNetworkAdapterInfo(),
            UsbDevices = CollectUsbDeviceInfo()
        };
    }

    public SystemInfo CollectSystemInfo()
    {
        return new SystemInfo
        {
            Os = CollectOsInfo(),
            Host = CollectHostInfo()
        };
    }

    public RuntimeStatus CollectRuntimeStatus()
    {
        return new RuntimeStatus
        {
            Cpu = CollectCpuStatus(),
            Memory = CollectMemoryStatus(),
            DiskPartitions = CollectDiskPartitionStatus(),
            Network = CollectNetworkStatus(),
            CollectedAt = DateTime.UtcNow
        };
    }

    private CpuInfo CollectCpuInfo()
    {
        var info = new CpuInfo();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
        foreach (var obj in searcher.Get())
        {
            info.Model = obj["Name"]?.ToString() ?? string.Empty;
            info.Cores = Convert.ToInt32(obj["NumberOfCores"] ?? 0);
            info.LogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"] ?? 0);
            info.MaxFrequencyMHz = Convert.ToDouble(obj["MaxClockSpeed"] ?? 0);
            info.L2CacheSizeKB = Convert.ToInt64(obj["L2CacheSize"] ?? 0);
            info.L3CacheSizeKB = Convert.ToInt64(obj["L3CacheSize"] ?? 0);
            info.Manufacturer = obj["Manufacturer"]?.ToString() ?? string.Empty;
        }
        return info;
    }

    private List<MemoryInfo> CollectMemoryInfo()
    {
        var list = new List<MemoryInfo>();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory");
        foreach (var obj in searcher.Get())
        {
            list.Add(new MemoryInfo
            {
                Model = obj["PartNumber"]?.ToString()?.Trim() ?? string.Empty,
                CapacityMB = Convert.ToInt64(obj["Capacity"] ?? 0) / (1024 * 1024),
                SpeedMHz = Convert.ToDouble(obj["Speed"] ?? 0),
                MemoryType = MapMemoryType(Convert.ToInt16(obj["SMBIOSMemoryType"] ?? 0)),
                Slot = Convert.ToInt32(obj["DeviceLocator"]?.ToString()?.TrimStart('D', 'I', 'M', 'M', ' ') ?? "0"),
                Manufacturer = obj["Manufacturer"]?.ToString()?.Trim() ?? string.Empty
            });
        }
        return list;
    }

    private static string MapMemoryType(short smbiosType)
    {
        return smbiosType switch
        {
            20 => "DDR",
            21 => "DDR2",
            22 => "DDR2 FB-DIMM",
            24 => "DDR3",
            26 => "DDR4",
            34 => "DDR5",
            _ => $"Unknown({smbiosType})"
        };
    }

    private List<DiskInfo> CollectDiskInfo()
    {
        var list = new List<DiskInfo>();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive");
        foreach (var obj in searcher.Get())
        {
            var mediaType = obj["MediaType"]?.ToString() ?? string.Empty;
            list.Add(new DiskInfo
            {
                Model = obj["Model"]?.ToString()?.Trim() ?? string.Empty,
                CapacityGB = Convert.ToInt64(obj["Size"] ?? 0) / (1024 * 1024 * 1024),
                MediaType = DetermineMediaType(mediaType),
                InterfaceType = obj["InterfaceType"]?.ToString() ?? string.Empty,
                SerialNumber = obj["SerialNumber"]?.ToString()?.Trim() ?? string.Empty
            });
        }
        return list;
    }

    private static string DetermineMediaType(string mediaType)
    {
        if (string.IsNullOrEmpty(mediaType)) return "Unknown";
        if (mediaType.Contains("SSD", StringComparison.OrdinalIgnoreCase) ||
            mediaType.Contains("NVMe", StringComparison.OrdinalIgnoreCase))
            return "SSD";
        if (mediaType.Contains("HDD", StringComparison.OrdinalIgnoreCase) ||
            mediaType.Contains("Fixed hard disk", StringComparison.OrdinalIgnoreCase))
            return "HDD";
        return mediaType;
    }

    private MotherboardInfo CollectMotherboardInfo()
    {
        var info = new MotherboardInfo();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BaseBoard");
        foreach (var obj in searcher.Get())
        {
            info.Model = obj["Product"]?.ToString()?.Trim() ?? string.Empty;
            info.Manufacturer = obj["Manufacturer"]?.ToString()?.Trim() ?? string.Empty;
            info.SerialNumber = obj["SerialNumber"]?.ToString()?.Trim() ?? string.Empty;
            info.Version = obj["Version"]?.ToString()?.Trim() ?? string.Empty;
        }
        return info;
    }

    private List<NetworkAdapterInfo> CollectNetworkAdapterInfo()
    {
        var list = new List<NetworkAdapterInfo>();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_NetworkAdapter WHERE PhysicalAdapter = TRUE");
        foreach (var obj in searcher.Get())
        {
            var macAddress = obj["MACAddress"]?.ToString() ?? string.Empty;
            var deviceId = obj["DeviceID"]?.ToString() ?? string.Empty;
            var ipAddress = GetAdapterIpAddress(deviceId);

            list.Add(new NetworkAdapterInfo
            {
                Model = obj["Name"]?.ToString() ?? string.Empty,
                MacAddress = macAddress,
                SpeedMbps = Convert.ToInt64(obj["Speed"] ?? 0) / 1_000_000,
                IsEnabled = Convert.ToBoolean(obj["NetEnabled"] ?? false),
                IPAddress = ipAddress
            });
        }
        return list;
    }

    private static string GetAdapterIpAddress(string deviceId)
    {
        try
        {
            using var configSearcher = new ManagementObjectSearcher(
                $"SELECT IPAddress FROM Win32_NetworkAdapterConfiguration WHERE Index = {deviceId}");
            foreach (var config in configSearcher.Get())
            {
                var addresses = config["IPAddress"] as string[];
                if (addresses is { Length: > 0 })
                {
                    foreach (var addr in addresses)
                    {
                        if (IPAddress.TryParse(addr, out var ip) && ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                        {
                            return addr;
                        }
                    }
                }
            }
        }
        catch
        {
        }
        return string.Empty;
    }

    private List<UsbDeviceInfo> CollectUsbDeviceInfo()
    {
        var list = new List<UsbDeviceInfo>();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PnPEntity WHERE PNPClass = 'USB'");
        foreach (var obj in searcher.Get())
        {
            var deviceId = obj["DeviceID"]?.ToString() ?? string.Empty;
            var (vid, pid) = ParseVidPid(deviceId);
            list.Add(new UsbDeviceInfo
            {
                Name = obj["Name"]?.ToString() ?? string.Empty,
                VendorId = vid,
                ProductId = pid,
                IsConnected = obj["Status"]?.ToString() == "OK",
                DeviceId = deviceId
            });
        }
        return list;
    }

    private static (string vid, string pid) ParseVidPid(string deviceId)
    {
        var vid = string.Empty;
        var pid = string.Empty;
        var parts = deviceId.Split('\\');
        foreach (var part in parts)
        {
            var subParts = part.Split('&');
            foreach (var sp in subParts)
            {
                if (sp.StartsWith("VID_", StringComparison.OrdinalIgnoreCase))
                    vid = sp[4..];
                else if (sp.StartsWith("PID_", StringComparison.OrdinalIgnoreCase))
                    pid = sp[4..];
            }
        }
        return (vid, pid);
    }

    private OsInfo CollectOsInfo()
    {
        var info = new OsInfo();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
        foreach (var obj in searcher.Get())
        {
            info.Version = obj["Version"]?.ToString() ?? string.Empty;
            info.BuildNumber = obj["BuildNumber"]?.ToString() ?? string.Empty;
            info.ProductName = obj["Caption"]?.ToString() ?? string.Empty;
            info.Architecture = obj["OSArchitecture"]?.ToString() ?? string.Empty;
            info.IsActivated = CheckActivationStatus();
        }
        return info;
    }

    private static bool CheckActivationStatus()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT LicenseStatus FROM SoftwareLicensingProduct WHERE ApplicationId = '55c92734-d682-4d71-983e-d6ec3f16059f'");
            foreach (var obj in searcher.Get())
            {
                var status = Convert.ToInt32(obj["LicenseStatus"]);
                if (status == 1) return true;
            }
        }
        catch
        {
        }
        return false;
    }

    private HostInfo CollectHostInfo()
    {
        var info = new HostInfo
        {
            HostName = Dns.GetHostName(),
            UserName = Environment.UserName
        };

        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (var obj in searcher.Get())
            {
                info.DomainName = obj["Domain"]?.ToString() ?? string.Empty;
                info.Workgroup = obj["Workgroup"]?.ToString() ?? string.Empty;
                if (string.IsNullOrEmpty(info.Workgroup) && !string.IsNullOrEmpty(info.DomainName))
                {
                    var partOfDomain = Convert.ToBoolean(obj["PartOfDomain"] ?? false);
                    info.Workgroup = partOfDomain ? string.Empty : info.DomainName;
                }
            }
        }
        catch
        {
        }

        return info;
    }

    private CpuStatus CollectCpuStatus()
    {
        var status = new CpuStatus();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
        foreach (var obj in searcher.Get())
        {
            status.UsagePercent = Convert.ToDouble(obj["LoadPercentage"] ?? 0);
        }

        try
        {
            using var tempSearcher = new ManagementObjectSearcher(@"ROOT\WMI", "SELECT * FROM MSAcpi_ThermalZoneTemperature");
            foreach (var obj in tempSearcher.Get())
            {
                var rawTemp = Convert.ToDouble(obj["CurrentTemperature"] ?? 0);
                status.TemperatureCelsius = Math.Round(rawTemp / 10.0 - 273.15, 1);
                break;
            }
        }
        catch
        {
            status.TemperatureCelsius = 0;
        }

        return status;
    }

    private MemoryStatus CollectMemoryStatus()
    {
        var status = new MemoryStatus();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
        foreach (var obj in searcher.Get())
        {
            var totalBytes = Convert.ToInt64(obj["TotalVisibleMemorySize"] ?? 0);
            var freeBytes = Convert.ToInt64(obj["FreePhysicalMemory"] ?? 0);
            status.TotalMB = totalBytes / 1024;
            status.AvailableMB = freeBytes / 1024;
            status.UsedMB = status.TotalMB - status.AvailableMB;
            status.UsagePercent = status.TotalMB > 0 ? Math.Round((double)status.UsedMB / status.TotalMB * 100, 1) : 0;
        }
        return status;
    }

    private List<DiskPartitionStatus> CollectDiskPartitionStatus()
    {
        var list = new List<DiskPartitionStatus>();
        using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_LogicalDisk WHERE DriveType = 3");
        foreach (var obj in searcher.Get())
        {
            var totalBytes = Convert.ToInt64(obj["Size"] ?? 0);
            var freeBytes = Convert.ToInt64(obj["FreeSpace"] ?? 0);
            var usedBytes = totalBytes - freeBytes;
            list.Add(new DiskPartitionStatus
            {
                DeviceId = obj["DeviceID"]?.ToString() ?? string.Empty,
                Label = obj["VolumeName"]?.ToString() ?? string.Empty,
                TotalGB = totalBytes / (1024 * 1024 * 1024),
                FreeGB = freeBytes / (1024 * 1024 * 1024),
                UsedGB = usedBytes / (1024 * 1024 * 1024),
                UsagePercent = totalBytes > 0 ? Math.Round((double)usedBytes / totalBytes * 100, 1) : 0
            });
        }
        return list;
    }

    private NetworkStatus CollectNetworkStatus()
    {
        var status = new NetworkStatus
        {
            IsConnected = NetworkInterface.GetIsNetworkAvailable()
        };

        long totalSent = 0;
        long totalReceived = 0;
        var interfaces = new List<NetworkInterfaceStatus>();

        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
        {
            if (ni.OperationalStatus != OperationalStatus.Up) continue;
            if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback) continue;

            try
            {
                var stats = ni.GetIPv4Statistics();
                var ifaceStatus = new NetworkInterfaceStatus
                {
                    Name = ni.Name,
                    BytesSent = stats.BytesSent,
                    BytesReceived = stats.BytesReceived
                };
                interfaces.Add(ifaceStatus);
                totalSent += stats.BytesSent;
                totalReceived += stats.BytesReceived;
            }
            catch
            {
            }
        }

        status.BytesSent = totalSent;
        status.BytesReceived = totalReceived;
        status.Interfaces = interfaces;
        return status;
    }
}

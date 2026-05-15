using TerminalAgent.Services;
using TerminalAgent.Workers;

namespace TerminalAgent;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        builder.Services.AddWindowsService(options =>
        {
            options.ServiceName = "TerminalAgent";
        });

        builder.Services.AddSingleton<ConfigManager>();
        builder.Services.AddSingleton<SystemInfoCollector>();
        builder.Services.AddHttpClient<DataReporter>(client =>
        {
            var configManager = builder.Services.BuildServiceProvider().GetRequiredService<ConfigManager>();
            client.Timeout = TimeSpan.FromSeconds(configManager.HttpTimeoutSeconds);
        });

        builder.Services.AddHostedService<ReportWorker>();

        var host = builder.Build();
        await host.RunAsync();
    }
}

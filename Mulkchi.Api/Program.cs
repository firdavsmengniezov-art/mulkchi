using Serilog;
using Mulkchi.Api.DataSeed;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api;

public partial class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Configure Serilog
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "Mulkchi.Api")
            .WriteTo.Console()
            .WriteTo.File("logs/mulkchi-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        builder.Host.UseSerilog();

        var startup = new Startup(builder.Configuration);
        startup.ConfigureServices(builder.Services);
        var app = builder.Build();
        startup.Configure(app, app.Environment);

        // Apply pending migrations at startup so the database exists before seed runs.
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<StorageBroker>();
            await db.Database.MigrateAsync();
        }

        // Seed development data
        await DevelopmentDataSeeder.SeedAsync(app);

        app.Run();
    }
}

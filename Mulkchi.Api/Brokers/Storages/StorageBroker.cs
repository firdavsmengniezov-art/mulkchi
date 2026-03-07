using Microsoft.EntityFrameworkCore;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker : DbContext, IStorageBroker
{
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment environment;

    public StorageBroker(
        DbContextOptions<StorageBroker> options,
        IConfiguration configuration,
        IWebHostEnvironment environment)
        : base(options)
    {
        this.configuration = configuration;
        this.environment = environment;

        if (this.environment.IsDevelopment())
        {
            this.Database.EnsureCreated();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;

namespace Mulkchi.Api.Brokers.Storages;

public class StorageBrokerDesignTimeFactory : IDesignTimeDbContextFactory<StorageBroker>
{
    public StorageBroker CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StorageBroker>();
        
        // Use configuration for design time
        optionsBuilder.UseSqlServer(
            "Server=(localdb)\\mssqllocaldb;Database=MulkchiDb;Trusted_Connection=true;",
            options => options.EnableRetryOnFailure());

        return new StorageBroker(optionsBuilder.Options, null!, null!);
    }
}

using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.HomeRequests;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<HomeRequest> HomeRequests { get; set; }

    public async ValueTask<HomeRequest> InsertHomeRequestAsync(HomeRequest homeRequest)
    {
        var entry = await this.HomeRequests.AddAsync(homeRequest);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<HomeRequest> SelectAllHomeRequests()
        => this.HomeRequests.AsQueryable();

    public async ValueTask<HomeRequest> SelectHomeRequestByIdAsync(Guid homeRequestId)
        => (await this.HomeRequests.FindAsync(homeRequestId))!;

    public async ValueTask<HomeRequest> UpdateHomeRequestAsync(HomeRequest homeRequest)
    {
        this.Entry(homeRequest).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return homeRequest;
    }

    public async ValueTask<HomeRequest> DeleteHomeRequestByIdAsync(Guid homeRequestId)
    {
        HomeRequest homeRequest = (await this.HomeRequests.FindAsync(homeRequestId))!;
        homeRequest.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(homeRequest).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return homeRequest;
    }
}

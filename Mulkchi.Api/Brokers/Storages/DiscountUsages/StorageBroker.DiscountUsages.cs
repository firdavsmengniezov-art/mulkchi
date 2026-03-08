using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<DiscountUsage> DiscountUsages { get; set; }

    public async ValueTask<DiscountUsage> InsertDiscountUsageAsync(DiscountUsage discountUsage)
    {
        var entry = await this.DiscountUsages.AddAsync(discountUsage);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<DiscountUsage> SelectAllDiscountUsages()
        => this.DiscountUsages.AsQueryable();

    public async ValueTask<DiscountUsage> SelectDiscountUsageByIdAsync(Guid discountUsageId)
        => (await this.DiscountUsages.FindAsync(discountUsageId))!;

    public async ValueTask<DiscountUsage> UpdateDiscountUsageAsync(DiscountUsage discountUsage)
    {
        this.Entry(discountUsage).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return discountUsage;
    }

    public async ValueTask<DiscountUsage> DeleteDiscountUsageByIdAsync(Guid discountUsageId)
    {
        DiscountUsage discountUsage = (await this.DiscountUsages.FindAsync(discountUsageId))!;
        discountUsage.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(discountUsage).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return discountUsage;
    }
}

using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Discount> Discounts { get; set; }

    public async ValueTask<Discount> InsertDiscountAsync(Discount discount)
    {
        var entry = await this.Discounts.AddAsync(discount);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Discount> SelectAllDiscounts()
        => this.Discounts.AsQueryable();

    public async ValueTask<Discount> SelectDiscountByIdAsync(Guid discountId)
        => (await this.Discounts.FindAsync(discountId))!;

    public async ValueTask<Discount> UpdateDiscountAsync(Discount discount)
    {
        this.Entry(discount).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return discount;
    }

    public async ValueTask<Discount> DeleteDiscountByIdAsync(Guid discountId)
    {
        Discount discount = (await this.Discounts.FindAsync(discountId))!;
        discount.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(discount).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return discount;
    }
}

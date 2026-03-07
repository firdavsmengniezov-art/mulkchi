using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Brokers.Storages;

public partial interface IStorageBroker
{
    ValueTask<DiscountUsage> InsertDiscountUsageAsync(DiscountUsage discountUsage);
    IQueryable<DiscountUsage> SelectAllDiscountUsages();
    ValueTask<DiscountUsage> SelectDiscountUsageByIdAsync(Guid discountUsageId);
    ValueTask<DiscountUsage> UpdateDiscountUsageAsync(DiscountUsage discountUsage);
    ValueTask<DiscountUsage> DeleteDiscountUsageByIdAsync(Guid discountUsageId);
}

using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Services.Foundations.DiscountUsages;

public interface IDiscountUsageService
{
    ValueTask<DiscountUsage> AddDiscountUsageAsync(DiscountUsage discountUsage);
    IQueryable<DiscountUsage> RetrieveAllDiscountUsages();
    ValueTask<DiscountUsage> RetrieveDiscountUsageByIdAsync(Guid discountUsageId);
    ValueTask<DiscountUsage> ModifyDiscountUsageAsync(DiscountUsage discountUsage);
    ValueTask<DiscountUsage> RemoveDiscountUsageByIdAsync(Guid discountUsageId);
}

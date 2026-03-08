using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.DiscountUsages;

public partial class DiscountUsageService : IDiscountUsageService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public DiscountUsageService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<DiscountUsage> AddDiscountUsageAsync(DiscountUsage discountUsage) =>
        TryCatch(async () =>
        {
            ValidateDiscountUsageOnAdd(discountUsage);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            discountUsage.CreatedDate = now;
            discountUsage.UpdatedDate = now;
            return await this.storageBroker.InsertDiscountUsageAsync(discountUsage);
        });

    public IQueryable<DiscountUsage> RetrieveAllDiscountUsages() =>
        TryCatch(() => this.storageBroker.SelectAllDiscountUsages());

    public ValueTask<DiscountUsage> RetrieveDiscountUsageByIdAsync(Guid discountUsageId) =>
        TryCatch(async () =>
        {
            ValidateDiscountUsageId(discountUsageId);
            DiscountUsage maybeDiscountUsage = await this.storageBroker.SelectDiscountUsageByIdAsync(discountUsageId);

            if (maybeDiscountUsage is null)
                throw new NotFoundDiscountUsageException(discountUsageId);

            return maybeDiscountUsage;
        });

    public ValueTask<DiscountUsage> ModifyDiscountUsageAsync(DiscountUsage discountUsage) =>
        TryCatch(async () =>
        {
            ValidateDiscountUsageOnModify(discountUsage);
            return await this.storageBroker.UpdateDiscountUsageAsync(discountUsage);
        });

    public ValueTask<DiscountUsage> RemoveDiscountUsageByIdAsync(Guid discountUsageId) =>
        TryCatch(async () =>
        {
            ValidateDiscountUsageId(discountUsageId);
            return await this.storageBroker.DeleteDiscountUsageByIdAsync(discountUsageId);
        });
}

using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Discounts;

public partial class DiscountService : IDiscountService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public DiscountService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Discount> AddDiscountAsync(Discount discount) =>
        TryCatch(async () =>
        {
            ValidateDiscountOnAdd(discount);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            discount.CreatedDate = now;
            discount.UpdatedDate = now;
            return await this.storageBroker.InsertDiscountAsync(discount);
        });

    public IQueryable<Discount> RetrieveAllDiscounts() =>
        TryCatch(() => this.storageBroker.SelectAllDiscounts());

    public ValueTask<Discount> RetrieveDiscountByIdAsync(Guid discountId) =>
        TryCatch(async () =>
        {
            ValidateDiscountId(discountId);
            Discount maybeDiscount = await this.storageBroker.SelectDiscountByIdAsync(discountId);

            if (maybeDiscount is null)
                throw new NotFoundDiscountException(discountId);

            return maybeDiscount;
        });

    public ValueTask<Discount> ModifyDiscountAsync(Discount discount) =>
        TryCatch(async () =>
        {
            ValidateDiscountOnModify(discount);
            discount.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateDiscountAsync(discount);
        });

    public ValueTask<Discount> RemoveDiscountByIdAsync(Guid discountId) =>
        TryCatch(async () =>
        {
            ValidateDiscountId(discountId);
            return await this.storageBroker.DeleteDiscountByIdAsync(discountId);
        });
}

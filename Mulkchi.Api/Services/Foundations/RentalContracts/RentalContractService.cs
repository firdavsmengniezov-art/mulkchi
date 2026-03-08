using Mulkchi.Api.Models.Foundations.RentalContracts;
using Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.RentalContracts;

public partial class RentalContractService : IRentalContractService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public RentalContractService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<RentalContract> AddRentalContractAsync(RentalContract rentalContract) =>
        TryCatch(async () =>
        {
            ValidateRentalContractOnAdd(rentalContract);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            rentalContract.CreatedDate = now;
            rentalContract.UpdatedDate = now;
            return await this.storageBroker.InsertRentalContractAsync(rentalContract);
        });

    public IQueryable<RentalContract> RetrieveAllRentalContracts() =>
        TryCatch(() => this.storageBroker.SelectAllRentalContracts());

    public ValueTask<RentalContract> RetrieveRentalContractByIdAsync(Guid rentalContractId) =>
        TryCatch(async () =>
        {
            ValidateRentalContractId(rentalContractId);
            RentalContract maybeRentalContract = await this.storageBroker.SelectRentalContractByIdAsync(rentalContractId);

            if (maybeRentalContract is null)
                throw new NotFoundRentalContractException(rentalContractId);

            return maybeRentalContract;
        });

    public ValueTask<RentalContract> ModifyRentalContractAsync(RentalContract rentalContract) =>
        TryCatch(async () =>
        {
            ValidateRentalContractOnModify(rentalContract);
            rentalContract.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateRentalContractAsync(rentalContract);
        });

    public ValueTask<RentalContract> RemoveRentalContractByIdAsync(Guid rentalContractId) =>
        TryCatch(async () =>
        {
            ValidateRentalContractId(rentalContractId);
            return await this.storageBroker.DeleteRentalContractByIdAsync(rentalContractId);
        });
}

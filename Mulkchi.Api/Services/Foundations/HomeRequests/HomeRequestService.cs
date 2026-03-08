using Mulkchi.Api.Models.Foundations.HomeRequests;
using Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.HomeRequests;

public partial class HomeRequestService : IHomeRequestService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public HomeRequestService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<HomeRequest> AddHomeRequestAsync(HomeRequest homeRequest) =>
        TryCatch(async () =>
        {
            ValidateHomeRequestOnAdd(homeRequest);

            if (homeRequest.CheckInDate.HasValue && homeRequest.CheckOutDate.HasValue
                && homeRequest.CheckOutDate > homeRequest.CheckInDate)
            {
                homeRequest.TotalNights = (int)(homeRequest.CheckOutDate.Value - homeRequest.CheckInDate.Value).TotalDays;
            }

            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            homeRequest.CreatedDate = now;
            homeRequest.UpdatedDate = now;

            return await this.storageBroker.InsertHomeRequestAsync(homeRequest);
        });

    public IQueryable<HomeRequest> RetrieveAllHomeRequests() =>
        TryCatch(() => this.storageBroker.SelectAllHomeRequests());

    public ValueTask<HomeRequest> RetrieveHomeRequestByIdAsync(Guid homeRequestId) =>
        TryCatch(async () =>
        {
            ValidateHomeRequestId(homeRequestId);
            HomeRequest maybeHomeRequest = await this.storageBroker.SelectHomeRequestByIdAsync(homeRequestId);

            if (maybeHomeRequest is null)
                throw new NotFoundHomeRequestException(homeRequestId);

            return maybeHomeRequest;
        });

    public ValueTask<HomeRequest> ModifyHomeRequestAsync(HomeRequest homeRequest) =>
        TryCatch(async () =>
        {
            ValidateHomeRequestOnModify(homeRequest);

            if (homeRequest.CheckInDate.HasValue && homeRequest.CheckOutDate.HasValue
                && homeRequest.CheckOutDate > homeRequest.CheckInDate)
            {
                homeRequest.TotalNights = (int)(homeRequest.CheckOutDate.Value - homeRequest.CheckInDate.Value).TotalDays;
            }

            homeRequest.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateHomeRequestAsync(homeRequest);
        });

    public ValueTask<HomeRequest> RemoveHomeRequestByIdAsync(Guid homeRequestId) =>
        TryCatch(async () =>
        {
            ValidateHomeRequestId(homeRequestId);
            return await this.storageBroker.DeleteHomeRequestByIdAsync(homeRequestId);
        });
}

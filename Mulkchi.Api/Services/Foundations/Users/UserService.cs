using Mulkchi.Api.Models.Foundations.Users;
using Mulkchi.Api.Models.Foundations.Users.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Users;

public partial class UserService : IUserService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public UserService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<User> AddUserAsync(User user) =>
        TryCatch(async () =>
        {
            ValidateUserOnAdd(user);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            user.CreatedDate = now;
            user.UpdatedDate = now;
            return await this.storageBroker.InsertUserAsync(user);
        });

    public IQueryable<User> RetrieveAllUsers() =>
        TryCatch(() => this.storageBroker.SelectAllUsers());

    public ValueTask<User> RetrieveUserByIdAsync(Guid userId) =>
        TryCatch(async () =>
        {
            ValidateUserId(userId);
            User maybeUser = await this.storageBroker.SelectUserByIdAsync(userId);

            if (maybeUser is null)
                throw new NotFoundUserException(userId);

            return maybeUser;
        });

    public ValueTask<User> ModifyUserAsync(User user) =>
        TryCatch(async () =>
        {
            ValidateUserOnModify(user);
            user.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateUserAsync(user);
        });

    public ValueTask<User> RemoveUserByIdAsync(Guid userId) =>
        TryCatch(async () =>
        {
            ValidateUserId(userId);
            return await this.storageBroker.DeleteUserByIdAsync(userId);
        });
}

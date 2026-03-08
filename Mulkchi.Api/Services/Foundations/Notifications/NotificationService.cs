using Mulkchi.Api.Models.Foundations.Notifications;
using Mulkchi.Api.Models.Foundations.Notifications.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Notifications;

public partial class NotificationService : INotificationService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public NotificationService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Notification> AddNotificationAsync(Notification notification) =>
        TryCatch(async () =>
        {
            ValidateNotificationOnAdd(notification);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            notification.CreatedDate = now;
            notification.UpdatedDate = now;
            return await this.storageBroker.InsertNotificationAsync(notification);
        });

    public IQueryable<Notification> RetrieveAllNotifications() =>
        TryCatch(() => this.storageBroker.SelectAllNotifications());

    public ValueTask<Notification> RetrieveNotificationByIdAsync(Guid notificationId) =>
        TryCatch(async () =>
        {
            ValidateNotificationId(notificationId);
            Notification maybeNotification = await this.storageBroker.SelectNotificationByIdAsync(notificationId);

            if (maybeNotification is null)
                throw new NotFoundNotificationException(notificationId);

            return maybeNotification;
        });

    public ValueTask<Notification> ModifyNotificationAsync(Notification notification) =>
        TryCatch(async () =>
        {
            ValidateNotificationOnModify(notification);
            notification.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateNotificationAsync(notification);
        });

    public ValueTask<Notification> RemoveNotificationByIdAsync(Guid notificationId) =>
        TryCatch(async () =>
        {
            ValidateNotificationId(notificationId);
            return await this.storageBroker.DeleteNotificationByIdAsync(notificationId);
        });
}

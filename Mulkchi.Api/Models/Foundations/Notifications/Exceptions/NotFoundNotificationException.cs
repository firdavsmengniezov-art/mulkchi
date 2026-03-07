using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NotFoundNotificationException : Xeption
{
    public NotFoundNotificationException(Guid notificationId)
        : base(message: $"Could not find notification with id: {notificationId}")
    { }
}

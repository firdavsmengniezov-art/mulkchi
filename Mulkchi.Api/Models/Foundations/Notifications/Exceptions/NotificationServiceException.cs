using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NotificationServiceException : Xeption
{
    public NotificationServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

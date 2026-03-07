using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class FailedNotificationServiceException : Xeption
{
    public FailedNotificationServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

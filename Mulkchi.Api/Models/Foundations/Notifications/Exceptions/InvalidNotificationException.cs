using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class InvalidNotificationException : Xeption
{
    public InvalidNotificationException(string message)
        : base(message)
    { }

    public InvalidNotificationException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

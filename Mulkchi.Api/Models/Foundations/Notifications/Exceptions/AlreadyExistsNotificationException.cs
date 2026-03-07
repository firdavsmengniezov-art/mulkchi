using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class AlreadyExistsNotificationException : Xeption
{
    public AlreadyExistsNotificationException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

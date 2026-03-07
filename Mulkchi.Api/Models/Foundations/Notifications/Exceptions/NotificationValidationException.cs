using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NotificationValidationException : Xeption
{
    public NotificationValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

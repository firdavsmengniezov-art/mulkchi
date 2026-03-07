using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NotificationDependencyValidationException : Xeption
{
    public NotificationDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

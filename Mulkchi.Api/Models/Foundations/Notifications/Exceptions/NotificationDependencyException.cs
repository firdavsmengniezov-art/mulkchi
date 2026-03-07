using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NotificationDependencyException : Xeption
{
    public NotificationDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

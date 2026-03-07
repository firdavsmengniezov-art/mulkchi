using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Notifications.Exceptions;

public class NullNotificationException : Xeption
{
    public NullNotificationException(string message)
        : base(message)
    { }
}

using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class InvalidAnnouncementException : Xeption
{
    public InvalidAnnouncementException(string message)
        : base(message)
    { }

    public InvalidAnnouncementException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

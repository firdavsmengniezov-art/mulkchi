using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class AlreadyExistsAnnouncementException : Xeption
{
    public AlreadyExistsAnnouncementException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

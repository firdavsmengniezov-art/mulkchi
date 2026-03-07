using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class AnnouncementServiceException : Xeption
{
    public AnnouncementServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

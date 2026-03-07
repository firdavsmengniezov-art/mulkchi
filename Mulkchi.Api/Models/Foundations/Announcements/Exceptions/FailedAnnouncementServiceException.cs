using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class FailedAnnouncementServiceException : Xeption
{
    public FailedAnnouncementServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

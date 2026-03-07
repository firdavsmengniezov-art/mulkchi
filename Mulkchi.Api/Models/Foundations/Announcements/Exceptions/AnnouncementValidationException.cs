using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class AnnouncementValidationException : Xeption
{
    public AnnouncementValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

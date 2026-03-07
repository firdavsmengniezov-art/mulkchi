using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class AnnouncementDependencyValidationException : Xeption
{
    public AnnouncementDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

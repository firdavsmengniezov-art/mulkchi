using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class AnnouncementDependencyException : Xeption
{
    public AnnouncementDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

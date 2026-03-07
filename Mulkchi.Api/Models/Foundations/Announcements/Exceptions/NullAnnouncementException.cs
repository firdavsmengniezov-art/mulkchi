using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Announcements.Exceptions;

public class NullAnnouncementException : Xeption
{
    public NullAnnouncementException(string message)
        : base(message)
    { }
}

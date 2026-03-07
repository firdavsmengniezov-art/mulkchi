using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class NullHomeRequestException : Xeption
{
    public NullHomeRequestException(string message)
        : base(message)
    { }
}

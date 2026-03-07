using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class AlreadyExistsHomeRequestException : Xeption
{
    public AlreadyExistsHomeRequestException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

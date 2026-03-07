using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class NotFoundHomeRequestException : Xeption
{
    public NotFoundHomeRequestException(Guid homeRequestId)
        : base(message: $"Could not find home request with id: {homeRequestId}")
    { }
}

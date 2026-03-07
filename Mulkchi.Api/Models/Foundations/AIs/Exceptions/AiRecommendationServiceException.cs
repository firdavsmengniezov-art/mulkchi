using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class AiRecommendationServiceException : Xeption
{
    public AiRecommendationServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

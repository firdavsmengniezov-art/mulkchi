using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class FailedAiRecommendationServiceException : Xeption
{
    public FailedAiRecommendationServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

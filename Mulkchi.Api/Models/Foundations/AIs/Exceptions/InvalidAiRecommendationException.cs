using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class InvalidAiRecommendationException : Xeption
{
    public InvalidAiRecommendationException(string message)
        : base(message)
    { }

    public InvalidAiRecommendationException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

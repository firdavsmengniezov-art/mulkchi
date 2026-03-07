using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class AiRecommendationValidationException : Xeption
{
    public AiRecommendationValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

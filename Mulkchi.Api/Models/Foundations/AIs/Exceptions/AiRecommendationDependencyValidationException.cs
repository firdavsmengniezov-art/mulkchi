using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class AiRecommendationDependencyValidationException : Xeption
{
    public AiRecommendationDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

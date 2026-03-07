using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class AiRecommendationDependencyException : Xeption
{
    public AiRecommendationDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

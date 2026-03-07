using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class AlreadyExistsAiRecommendationException : Xeption
{
    public AlreadyExistsAiRecommendationException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

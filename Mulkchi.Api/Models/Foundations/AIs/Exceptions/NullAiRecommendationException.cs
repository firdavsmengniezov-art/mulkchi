using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class NullAiRecommendationException : Xeption
{
    public NullAiRecommendationException(string message)
        : base(message)
    { }
}

using Xeptions;

namespace Mulkchi.Api.Models.Foundations.AIs.Exceptions;

public class FailedAiRecommendationStorageException : Xeption
{
    public FailedAiRecommendationStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

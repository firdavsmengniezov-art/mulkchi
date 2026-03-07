using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class FailedSavedSearchServiceException : Xeption
{
    public FailedSavedSearchServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

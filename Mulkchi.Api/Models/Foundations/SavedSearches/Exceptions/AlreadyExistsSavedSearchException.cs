using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class AlreadyExistsSavedSearchException : Xeption
{
    public AlreadyExistsSavedSearchException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

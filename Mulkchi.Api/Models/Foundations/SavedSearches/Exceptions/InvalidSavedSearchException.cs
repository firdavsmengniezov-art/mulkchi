using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class InvalidSavedSearchException : Xeption
{
    public InvalidSavedSearchException(string message)
        : base(message)
    { }

    public InvalidSavedSearchException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

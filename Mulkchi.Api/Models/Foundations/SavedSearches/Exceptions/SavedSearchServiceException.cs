using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class SavedSearchServiceException : Xeption
{
    public SavedSearchServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

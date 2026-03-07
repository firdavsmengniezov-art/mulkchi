using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class SavedSearchDependencyValidationException : Xeption
{
    public SavedSearchDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

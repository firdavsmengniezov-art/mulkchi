using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class SavedSearchDependencyException : Xeption
{
    public SavedSearchDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

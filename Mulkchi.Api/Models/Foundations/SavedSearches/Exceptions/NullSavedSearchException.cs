using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class NullSavedSearchException : Xeption
{
    public NullSavedSearchException(string message)
        : base(message)
    { }
}

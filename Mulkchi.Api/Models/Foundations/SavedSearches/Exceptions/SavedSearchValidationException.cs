using Xeptions;

namespace Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;

public class SavedSearchValidationException : Xeption
{
    public SavedSearchValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

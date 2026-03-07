using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FavoriteDependencyValidationException : Xeption
{
    public FavoriteDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

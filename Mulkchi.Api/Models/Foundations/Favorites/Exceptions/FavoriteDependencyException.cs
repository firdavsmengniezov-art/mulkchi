using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FavoriteDependencyException : Xeption
{
    public FavoriteDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

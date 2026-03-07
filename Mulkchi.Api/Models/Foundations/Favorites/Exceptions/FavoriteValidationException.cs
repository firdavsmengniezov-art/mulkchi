using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FavoriteValidationException : Xeption
{
    public FavoriteValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

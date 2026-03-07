using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FavoriteServiceException : Xeption
{
    public FavoriteServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

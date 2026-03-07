using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class NotFoundFavoriteException : Xeption
{
    public NotFoundFavoriteException(Guid favoriteId)
        : base(message: $"Could not find favorite with id: {favoriteId}")
    { }
}

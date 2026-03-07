using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class AlreadyExistsFavoriteException : Xeption
{
    public AlreadyExistsFavoriteException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FailedFavoriteStorageException : Xeption
{
    public FailedFavoriteStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

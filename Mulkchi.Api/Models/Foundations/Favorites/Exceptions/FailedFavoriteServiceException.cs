using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

public class FailedFavoriteServiceException : Xeption
{
    public FailedFavoriteServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

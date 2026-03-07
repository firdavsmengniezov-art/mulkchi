using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class InvalidPropertyImageException : Xeption
{
    public InvalidPropertyImageException(string message)
        : base(message)
    { }

    public InvalidPropertyImageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

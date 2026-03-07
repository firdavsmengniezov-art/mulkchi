using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class PropertyImageServiceException : Xeption
{
    public PropertyImageServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

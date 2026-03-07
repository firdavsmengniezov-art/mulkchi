using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class FailedPropertyImageServiceException : Xeption
{
    public FailedPropertyImageServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

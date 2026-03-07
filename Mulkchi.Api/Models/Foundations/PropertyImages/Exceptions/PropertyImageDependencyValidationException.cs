using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class PropertyImageDependencyValidationException : Xeption
{
    public PropertyImageDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

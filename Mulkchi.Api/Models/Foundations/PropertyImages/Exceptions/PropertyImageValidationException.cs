using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class PropertyImageValidationException : Xeption
{
    public PropertyImageValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

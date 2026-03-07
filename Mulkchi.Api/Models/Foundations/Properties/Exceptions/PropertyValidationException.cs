using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class PropertyValidationException : Xeption
{
    public PropertyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

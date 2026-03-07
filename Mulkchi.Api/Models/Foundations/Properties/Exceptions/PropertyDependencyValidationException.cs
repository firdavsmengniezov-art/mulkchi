using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class PropertyDependencyValidationException : Xeption
{
    public PropertyDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

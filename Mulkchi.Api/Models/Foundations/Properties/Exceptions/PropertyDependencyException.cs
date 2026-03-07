using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class PropertyDependencyException : Xeption
{
    public PropertyDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

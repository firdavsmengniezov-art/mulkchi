using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class PropertyImageDependencyException : Xeption
{
    public PropertyImageDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

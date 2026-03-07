using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class PropertyViewDependencyValidationException : Xeption
{
    public PropertyViewDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class PropertyViewDependencyException : Xeption
{
    public PropertyViewDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

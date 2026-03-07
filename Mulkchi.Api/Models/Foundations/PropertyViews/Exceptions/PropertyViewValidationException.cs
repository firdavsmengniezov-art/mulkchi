using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class PropertyViewValidationException : Xeption
{
    public PropertyViewValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

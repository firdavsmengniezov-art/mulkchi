using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class PropertyViewServiceException : Xeption
{
    public PropertyViewServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

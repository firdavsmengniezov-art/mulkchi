using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class PropertyServiceException : Xeption
{
    public PropertyServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}

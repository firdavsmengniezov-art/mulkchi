using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class InvalidPropertyException : Xeption
{
    public InvalidPropertyException(string message)
        : base(message)
    { }

    public InvalidPropertyException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

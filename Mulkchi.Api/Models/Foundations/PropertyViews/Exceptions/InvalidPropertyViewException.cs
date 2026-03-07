using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class InvalidPropertyViewException : Xeption
{
    public InvalidPropertyViewException(string message)
        : base(message)
    { }

    public InvalidPropertyViewException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

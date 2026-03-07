using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class NullPropertyException : Xeption
{
    public NullPropertyException(string message)
        : base(message)
    { }
}

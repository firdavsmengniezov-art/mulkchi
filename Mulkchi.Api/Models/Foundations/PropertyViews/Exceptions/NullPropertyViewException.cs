using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class NullPropertyViewException : Xeption
{
    public NullPropertyViewException(string message)
        : base(message)
    { }
}

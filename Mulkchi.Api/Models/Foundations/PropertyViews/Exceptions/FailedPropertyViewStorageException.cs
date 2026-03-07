using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class FailedPropertyViewStorageException : Xeption
{
    public FailedPropertyViewStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}

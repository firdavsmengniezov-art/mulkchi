using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class NotFoundPropertyException : Xeption
{
    public NotFoundPropertyException(Guid propertyId)
        : base(message: $"Could not find property with id: {propertyId}")
    { }
}

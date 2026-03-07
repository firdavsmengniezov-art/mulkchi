using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;

public class NotFoundPropertyImageException : Xeption
{
    public NotFoundPropertyImageException(Guid propertyImageId)
        : base(message: $"Could not find property image with id: {propertyImageId}")
    { }
}

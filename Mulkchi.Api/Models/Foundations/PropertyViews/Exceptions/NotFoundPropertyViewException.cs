using Xeptions;

namespace Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

public class NotFoundPropertyViewException : Xeption
{
    public NotFoundPropertyViewException(Guid propertyViewId)
        : base(message: $"Could not find property view with id: {propertyViewId}")
    { }
}

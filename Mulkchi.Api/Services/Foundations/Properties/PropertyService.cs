using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;
using Microsoft.Extensions.Localization;
using Mulkchi.Api.Resources;

namespace Mulkchi.Api.Services.Foundations.Properties;

public partial class PropertyService : IPropertyService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;
    private readonly ICurrentUserService currentUserService;
    private readonly IStringLocalizer<SharedResource> localizer;

    public PropertyService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker,
        ICurrentUserService currentUserService,
        IStringLocalizer<SharedResource> localizer)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
        this.currentUserService = currentUserService;
        this.localizer = localizer;
    }

    public ValueTask<Property> AddPropertyAsync(Property property) =>
        TryCatch(async () =>
        {
            ValidatePropertyOnAdd(property);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            property.CreatedDate = now;
            property.UpdatedDate = now;
            return await this.storageBroker.InsertPropertyAsync(property);
        });

    public IQueryable<Property> RetrieveAllProperties() =>
        TryCatch(() => this.storageBroker.SelectAllProperties());

    public ValueTask<Property> RetrievePropertyByIdAsync(Guid propertyId) =>
        TryCatch(async () =>
        {
            ValidatePropertyId(propertyId);
            Property maybeProperty = await this.storageBroker.SelectPropertyByIdAsync(propertyId);

            if (maybeProperty is null)
                throw new NotFoundPropertyException(propertyId);

            return maybeProperty;
        });

    public ValueTask<Property> ModifyPropertyAsync(Property property) =>
        TryCatch(async () =>
        {
            ValidatePropertyOnModify(property);
            
            // Check ownership
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && property.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only modify your own properties.");
            }
            
            property.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdatePropertyAsync(property);
        });

    public ValueTask<Property> RemovePropertyByIdAsync(Guid propertyId) =>
        TryCatch(async () =>
        {
            ValidatePropertyId(propertyId);
            
            // Get property to check ownership
            Property existingProperty = await this.storageBroker.SelectPropertyByIdAsync(propertyId);
            if (existingProperty is null)
                throw new NotFoundPropertyException(propertyId);
            
            // Check ownership
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && existingProperty.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only delete your own properties.");
            }
            
            return await this.storageBroker.DeletePropertyByIdAsync(propertyId);
        });
}

using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Properties;

public partial class PropertyService : IPropertyService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public PropertyService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
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
            property.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdatePropertyAsync(property);
        });

    public ValueTask<Property> RemovePropertyByIdAsync(Guid propertyId) =>
        TryCatch(async () =>
        {
            ValidatePropertyId(propertyId);
            return await this.storageBroker.DeletePropertyByIdAsync(propertyId);
        });
}

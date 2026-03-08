using Mulkchi.Api.Models.Foundations.PropertyImages;
using Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.PropertyImages;

public partial class PropertyImageService : IPropertyImageService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public PropertyImageService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<PropertyImage> AddPropertyImageAsync(PropertyImage propertyImage) =>
        TryCatch(async () =>
        {
            ValidatePropertyImageOnAdd(propertyImage);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            propertyImage.CreatedDate = now;
            propertyImage.UpdatedDate = now;
            return await this.storageBroker.InsertPropertyImageAsync(propertyImage);
        });

    public IQueryable<PropertyImage> RetrieveAllPropertyImages() =>
        TryCatch(() => this.storageBroker.SelectAllPropertyImages());

    public ValueTask<PropertyImage> RetrievePropertyImageByIdAsync(Guid propertyImageId) =>
        TryCatch(async () =>
        {
            ValidatePropertyImageId(propertyImageId);
            PropertyImage maybePropertyImage = await this.storageBroker.SelectPropertyImageByIdAsync(propertyImageId);

            if (maybePropertyImage is null)
                throw new NotFoundPropertyImageException(propertyImageId);

            return maybePropertyImage;
        });

    public ValueTask<PropertyImage> ModifyPropertyImageAsync(PropertyImage propertyImage) =>
        TryCatch(async () =>
        {
            ValidatePropertyImageOnModify(propertyImage);
            propertyImage.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdatePropertyImageAsync(propertyImage);
        });

    public ValueTask<PropertyImage> RemovePropertyImageByIdAsync(Guid propertyImageId) =>
        TryCatch(async () =>
        {
            ValidatePropertyImageId(propertyImageId);
            return await this.storageBroker.DeletePropertyImageByIdAsync(propertyImageId);
        });
}

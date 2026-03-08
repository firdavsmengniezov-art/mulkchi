using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.PropertyImages;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<PropertyImage> PropertyImages { get; set; }

    public async ValueTask<PropertyImage> InsertPropertyImageAsync(PropertyImage propertyImage)
    {
        var entry = await this.PropertyImages.AddAsync(propertyImage);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<PropertyImage> SelectAllPropertyImages()
        => this.PropertyImages.AsQueryable();

    public async ValueTask<PropertyImage> SelectPropertyImageByIdAsync(Guid propertyImageId)
        => (await this.PropertyImages.FindAsync(propertyImageId))!;

    public async ValueTask<PropertyImage> UpdatePropertyImageAsync(PropertyImage propertyImage)
    {
        this.Entry(propertyImage).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return propertyImage;
    }

    public async ValueTask<PropertyImage> DeletePropertyImageByIdAsync(Guid propertyImageId)
    {
        PropertyImage propertyImage = (await this.PropertyImages.FindAsync(propertyImageId))!;
        propertyImage.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(propertyImage).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return propertyImage;
    }
}

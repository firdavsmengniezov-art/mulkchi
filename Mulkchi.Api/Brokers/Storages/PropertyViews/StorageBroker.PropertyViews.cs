using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.PropertyViews;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<PropertyView> PropertyViews { get; set; }

    public async ValueTask<PropertyView> InsertPropertyViewAsync(PropertyView propertyView)
    {
        var entry = await this.PropertyViews.AddAsync(propertyView);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<PropertyView> SelectAllPropertyViews()
        => this.PropertyViews.AsQueryable();

    public async ValueTask<PropertyView> SelectPropertyViewByIdAsync(Guid propertyViewId)
        => (await this.PropertyViews.FindAsync(propertyViewId))!;

    public async ValueTask<PropertyView> UpdatePropertyViewAsync(PropertyView propertyView)
    {
        this.Entry(propertyView).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return propertyView;
    }

    public async ValueTask<PropertyView> DeletePropertyViewByIdAsync(Guid propertyViewId)
    {
        PropertyView propertyView = (await this.PropertyViews.FindAsync(propertyViewId))!;
        propertyView.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(propertyView).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return propertyView;
    }
}

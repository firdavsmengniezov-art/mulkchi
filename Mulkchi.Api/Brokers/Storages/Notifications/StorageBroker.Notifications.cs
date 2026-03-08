using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Notifications;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Notification> Notifications { get; set; }

    public async ValueTask<Notification> InsertNotificationAsync(Notification notification)
    {
        var entry = await this.Notifications.AddAsync(notification);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Notification> SelectAllNotifications()
        => this.Notifications.AsQueryable();

    public async ValueTask<Notification> SelectNotificationByIdAsync(Guid notificationId)
        => (await this.Notifications.FindAsync(notificationId))!;

    public async ValueTask<Notification> UpdateNotificationAsync(Notification notification)
    {
        this.Entry(notification).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return notification;
    }

    public async ValueTask<Notification> DeleteNotificationByIdAsync(Guid notificationId)
    {
        Notification notification = (await this.Notifications.FindAsync(notificationId))!;
        notification.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(notification).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return notification;
    }
}

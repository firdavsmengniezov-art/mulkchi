using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Announcements;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Announcement> Announcements { get; set; }

    public async ValueTask<Announcement> InsertAnnouncementAsync(Announcement announcement)
    {
        var entry = await this.Announcements.AddAsync(announcement);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Announcement> SelectAllAnnouncements()
        => this.Announcements.AsQueryable();

    public async ValueTask<Announcement> SelectAnnouncementByIdAsync(Guid announcementId)
        => (await this.Announcements.FindAsync(announcementId))!;

    public async ValueTask<Announcement> UpdateAnnouncementAsync(Announcement announcement)
    {
        this.Entry(announcement).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return announcement;
    }

    public async ValueTask<Announcement> DeleteAnnouncementByIdAsync(Guid announcementId)
    {
        Announcement announcement = (await this.Announcements.FindAsync(announcementId))!;
        announcement.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(announcement).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return announcement;
    }
}

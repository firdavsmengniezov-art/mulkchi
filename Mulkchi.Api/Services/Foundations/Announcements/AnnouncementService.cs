using Mulkchi.Api.Models.Foundations.Announcements;
using Mulkchi.Api.Models.Foundations.Announcements.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Announcements;

public partial class AnnouncementService : IAnnouncementService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public AnnouncementService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Announcement> AddAnnouncementAsync(Announcement announcement) =>
        TryCatch(async () =>
        {
            ValidateAnnouncementOnAdd(announcement);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            announcement.CreatedDate = now;
            announcement.UpdatedDate = now;
            return await this.storageBroker.InsertAnnouncementAsync(announcement);
        });

    public IQueryable<Announcement> RetrieveAllAnnouncements() =>
        TryCatch(() => this.storageBroker.SelectAllAnnouncements());

    public ValueTask<Announcement> RetrieveAnnouncementByIdAsync(Guid announcementId) =>
        TryCatch(async () =>
        {
            ValidateAnnouncementId(announcementId);
            Announcement maybeAnnouncement = await this.storageBroker.SelectAnnouncementByIdAsync(announcementId);

            if (maybeAnnouncement is null)
                throw new NotFoundAnnouncementException(announcementId);

            return maybeAnnouncement;
        });

    public ValueTask<Announcement> ModifyAnnouncementAsync(Announcement announcement) =>
        TryCatch(async () =>
        {
            ValidateAnnouncementOnModify(announcement);
            announcement.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateAnnouncementAsync(announcement);
        });

    public ValueTask<Announcement> RemoveAnnouncementByIdAsync(Guid announcementId) =>
        TryCatch(async () =>
        {
            ValidateAnnouncementId(announcementId);
            return await this.storageBroker.DeleteAnnouncementByIdAsync(announcementId);
        });
}

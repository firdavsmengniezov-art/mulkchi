using Mulkchi.Api.Models.Foundations.Announcements;
using Mulkchi.Api.Models.Foundations.Announcements.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.Announcements;

public partial class AnnouncementService
{
    private void ValidateAnnouncementOnAdd(Announcement announcement)
    {
        ValidateAnnouncementIsNotNull(announcement);
        Validate(
        (Rule: IsInvalid(announcement.Id), Parameter: nameof(Announcement.Id)),
        (Rule: IsInvalid(announcement.CreatedBy), Parameter: nameof(Announcement.CreatedBy)),
        (Rule: IsInvalid(announcement.TitleUz), Parameter: nameof(Announcement.TitleUz)),
        (Rule: IsInvalid(announcement.ContentUz), Parameter: nameof(Announcement.ContentUz)));
    }

    private void ValidateAnnouncementOnModify(Announcement announcement)
    {
        ValidateAnnouncementIsNotNull(announcement);
        Validate(
        (Rule: IsInvalid(announcement.Id), Parameter: nameof(Announcement.Id)),
        (Rule: IsInvalid(announcement.CreatedBy), Parameter: nameof(Announcement.CreatedBy)),
        (Rule: IsInvalid(announcement.TitleUz), Parameter: nameof(Announcement.TitleUz)),
        (Rule: IsInvalid(announcement.ContentUz), Parameter: nameof(Announcement.ContentUz)));
    }

    private static void ValidateAnnouncementId(Guid announcementId)
    {
        if (announcementId == Guid.Empty)
        {
            throw new InvalidAnnouncementException(
                message: "Announcement id is invalid.");
        }
    }

    private static void ValidateAnnouncementIsNotNull(Announcement announcement)
    {
        if (announcement is null)
            throw new NullAnnouncementException(message: "Announcement is null.");
    }

    private static dynamic IsInvalid(Guid id) => new
    {
        Condition = id == Guid.Empty,
        Message = "Id is required."
    };

    private static dynamic IsInvalid(string text) => new
    {
        Condition = string.IsNullOrWhiteSpace(text),
        Message = "Value is required."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidAnnouncementException =
            new InvalidAnnouncementException(message: "Announcement data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidAnnouncementException.UpsertDataList(parameter, rule.Message);
        }

        invalidAnnouncementException.ThrowIfContainsErrors();
    }
}

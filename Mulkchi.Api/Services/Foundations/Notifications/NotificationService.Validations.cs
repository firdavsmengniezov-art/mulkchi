using Mulkchi.Api.Models.Foundations.Notifications;
using Mulkchi.Api.Models.Foundations.Notifications.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.Notifications;

public partial class NotificationService
{
    private void ValidateNotificationOnAdd(Notification notification)
    {
        ValidateNotificationIsNotNull(notification);
        Validate(
        (Rule: IsInvalid(notification.Id), Parameter: nameof(Notification.Id)),
        (Rule: IsInvalid(notification.TitleUz), Parameter: nameof(Notification.TitleUz)),
        (Rule: IsInvalid(notification.BodyUz), Parameter: nameof(Notification.BodyUz)));
    }

    private void ValidateNotificationOnModify(Notification notification)
    {
        ValidateNotificationIsNotNull(notification);
        Validate(
        (Rule: IsInvalid(notification.Id), Parameter: nameof(Notification.Id)),
        (Rule: IsInvalid(notification.TitleUz), Parameter: nameof(Notification.TitleUz)),
        (Rule: IsInvalid(notification.BodyUz), Parameter: nameof(Notification.BodyUz)));
    }

    private static void ValidateNotificationId(Guid notificationId)
    {
        if (notificationId == Guid.Empty)
        {
            throw new InvalidNotificationException(
                message: "Notification id is invalid.");
        }
    }

    private static void ValidateNotificationIsNotNull(Notification notification)
    {
        if (notification is null)
            throw new NullNotificationException(message: "Notification is null.");
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
        var invalidNotificationException =
            new InvalidNotificationException(message: "Notification data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidNotificationException.UpsertDataList(parameter, rule.Message);
        }

        invalidNotificationException.ThrowIfContainsErrors();
    }
}

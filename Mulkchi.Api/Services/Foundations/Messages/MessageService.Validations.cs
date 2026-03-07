using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Models.Foundations.Messages.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.Messages;

public partial class MessageService
{
    private void ValidateMessageOnAdd(Message message)
    {
        ValidateMessageIsNotNull(message);
        Validate(
        (Rule: IsInvalid(message.Id), Parameter: nameof(Message.Id)),
        (Rule: IsInvalid(message.Content), Parameter: nameof(Message.Content)),
        (Rule: IsInvalid(message.SenderId), Parameter: nameof(Message.SenderId)),
        (Rule: IsInvalid(message.ReceiverId), Parameter: nameof(Message.ReceiverId)));
    }

    private void ValidateMessageOnModify(Message message)
    {
        ValidateMessageIsNotNull(message);
        Validate(
        (Rule: IsInvalid(message.Id), Parameter: nameof(Message.Id)),
        (Rule: IsInvalid(message.Content), Parameter: nameof(Message.Content)),
        (Rule: IsInvalid(message.SenderId), Parameter: nameof(Message.SenderId)),
        (Rule: IsInvalid(message.ReceiverId), Parameter: nameof(Message.ReceiverId)));
    }

    private static void ValidateMessageId(Guid messageId)
    {
        if (messageId == Guid.Empty)
        {
            throw new InvalidMessageException(
                message: "Message id is invalid.");
        }
    }

    private static void ValidateMessageIsNotNull(Message message)
    {
        if (message is null)
            throw new NullMessageException(message: "Message is null.");
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
        var invalidMessageException =
            new InvalidMessageException(message: "Message data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidMessageException.UpsertDataList(parameter, rule.Message);
        }

        invalidMessageException.ThrowIfContainsErrors();
    }
}

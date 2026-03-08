using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Models.Foundations.Messages.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Messages;

public partial class MessageService : IMessageService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public MessageService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Message> AddMessageAsync(Message message) =>
        TryCatch(async () =>
        {
            ValidateMessageOnAdd(message);
            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            message.CreatedDate = now;
            message.UpdatedDate = now;
            return await this.storageBroker.InsertMessageAsync(message);
        });

    public IQueryable<Message> RetrieveAllMessages() =>
        TryCatch(() => this.storageBroker.SelectAllMessages());

    public ValueTask<Message> RetrieveMessageByIdAsync(Guid messageId) =>
        TryCatch(async () =>
        {
            ValidateMessageId(messageId);
            Message maybeMessage = await this.storageBroker.SelectMessageByIdAsync(messageId);

            if (maybeMessage is null)
                throw new NotFoundMessageException(messageId);

            return maybeMessage;
        });

    public ValueTask<Message> ModifyMessageAsync(Message message) =>
        TryCatch(async () =>
        {
            ValidateMessageOnModify(message);
            message.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateMessageAsync(message);
        });

    public ValueTask<Message> RemoveMessageByIdAsync(Guid messageId) =>
        TryCatch(async () =>
        {
            ValidateMessageId(messageId);
            return await this.storageBroker.DeleteMessageByIdAsync(messageId);
        });
}

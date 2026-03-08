using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Messages;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Message> Messages { get; set; }

    public async ValueTask<Message> InsertMessageAsync(Message message)
    {
        var entry = await this.Messages.AddAsync(message);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Message> SelectAllMessages()
        => this.Messages.AsQueryable();

    public async ValueTask<Message> SelectMessageByIdAsync(Guid messageId)
        => (await this.Messages.FindAsync(messageId))!;

    public async ValueTask<Message> UpdateMessageAsync(Message message)
    {
        this.Entry(message).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return message;
    }

    public async ValueTask<Message> DeleteMessageByIdAsync(Guid messageId)
    {
        Message message = (await this.Messages.FindAsync(messageId))!;
        message.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(message).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return message;
    }
}

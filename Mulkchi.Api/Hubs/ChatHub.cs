using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Services.Foundations.Messages;

namespace Mulkchi.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IMessageService messageService;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public ChatHub(
        IMessageService messageService,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.messageService = messageService;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    // Send message to specific user and save to DB
    public async Task SendMessage(Guid receiverId, string content)
    {
        var userIdClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out Guid senderId))
            throw new HubException("Unauthorized: invalid or missing token.");

        try
        {
            var message = new Message
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                Type = MessageType.Text,
                IsRead = false,
                CreatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset(),
                UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset()
            };

            Message savedMessage = await this.messageService.AddMessageAsync(message);

            await Clients.User(receiverId.ToString())
                .SendAsync("ReceiveMessage", savedMessage);

            await Clients.Caller
                .SendAsync("MessageSent", savedMessage);
        }
        catch (Exception exception)
        {
            this.loggingBroker.LogError(exception);
            throw;
        }
    }

    // Join a property chat room
    public async Task JoinPropertyRoom(Guid propertyId)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, propertyId.ToString());
            await Clients.Group(propertyId.ToString())
                .SendAsync("UserJoined", Context.ConnectionId);
        }
        catch (Exception exception)
        {
            this.loggingBroker.LogError(exception);
            throw;
        }
    }

    // Leave a property chat room
    public async Task LeavePropertyRoom(Guid propertyId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, propertyId.ToString());
            await Clients.Group(propertyId.ToString())
                .SendAsync("UserLeft", Context.ConnectionId);
        }
        catch (Exception exception)
        {
            this.loggingBroker.LogError(exception);
            throw;
        }
    }

    // Typing indicator
    public async Task SendTypingIndicator(Guid receiverId, bool isTyping)
    {
        try
        {
            await Clients.User(receiverId.ToString())
                .SendAsync("UserTyping", Context.UserIdentifier, isTyping);
        }
        catch (Exception exception)
        {
            this.loggingBroker.LogError(exception);
            throw;
        }
    }

    // Mark messages as read
    public async Task MarkAsRead(Guid messageId)
    {
        try
        {
            Message message = await this.messageService.RetrieveMessageByIdAsync(messageId);
            message.IsRead = true;
            message.ReadAt = this.dateTimeBroker.GetCurrentDateTimeOffset();
            message.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();

            Message updatedMessage = await this.messageService.ModifyMessageAsync(message);

            await Clients.User(message.SenderId.ToString())
                .SendAsync("MessageRead", messageId);
        }
        catch (Exception exception)
        {
            this.loggingBroker.LogError(exception);
            throw;
        }
    }

    public override async Task OnConnectedAsync()
    {
        this.loggingBroker.LogInformation(
            $"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        this.loggingBroker.LogInformation(
            $"Client disconnected: {Context.ConnectionId}");

        if (exception is not null)
            this.loggingBroker.LogError(exception);

        await base.OnDisconnectedAsync(exception);
    }
}

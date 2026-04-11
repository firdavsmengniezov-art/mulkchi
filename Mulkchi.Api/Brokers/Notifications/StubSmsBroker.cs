using Microsoft.Extensions.Logging;

namespace Mulkchi.Api.Brokers.Notifications;

/// <summary>
/// Stub SMS broker that logs messages instead of sending real SMS.
/// Replace with a real provider (Eskiz, Twilio, etc.) in production.
/// </summary>
public class StubSmsBroker : ISmsBroker
{
    private readonly ILogger<StubSmsBroker> logger;

    public StubSmsBroker(ILogger<StubSmsBroker> logger)
    {
        this.logger = logger;
    }

    public Task SendSmsAsync(string phoneNumber, string message)
    {
        this.logger.LogInformation("[SMS STUB] To: {Phone} | Message: {Message}", phoneNumber, message);
        return Task.CompletedTask;
    }
}

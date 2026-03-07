using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Mulkchi.Api.Hubs;

public class JwtUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

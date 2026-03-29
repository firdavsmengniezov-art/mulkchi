using System;
using System.Collections.Concurrent;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Mulkchi.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ConcurrentDictionary<string, DateTime> _authRequests = new();
    private readonly ConcurrentDictionary<string, DateTime> _uploadRequests = new();
    private readonly ConcurrentDictionary<string, int> _generalRequests = new();

    public RateLimitMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientIp = GetClientIp(context);
        var path = context.Request.Path.Value?.ToLower() ?? "";
        var method = context.Request.Method;

        // Check auth endpoints (20 requests per minute for development)
        if (path.StartsWith("/api/auth/"))
        {
            if (IsRateLimited(_authRequests, clientIp, TimeSpan.FromMinutes(1), 20))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "60";
                await context.Response.WriteAsync("Rate limit exceeded for auth endpoints");
                return;
            }
        }

        // Check upload endpoint (5 requests per minute)
        if (path.StartsWith("/api/propertyimages/upload"))
        {
            if (IsRateLimited(_uploadRequests, clientIp, TimeSpan.FromMinutes(1), 5))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "60";
                await context.Response.WriteAsync("Rate limit exceeded for upload endpoint");
                return;
            }
        }

        // Check general requests (200 requests per minute for development)
        if (method == "GET")
        {
            var currentCount = _generalRequests.GetOrAdd(clientIp, 0);
            if (currentCount >= 200)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "60";
                await context.Response.WriteAsync("Rate limit exceeded for general requests");
                return;
            }
            _generalRequests.AddOrUpdate(clientIp, 1, (key, value) => value + 1);

            // Reset counter after 1 minute
            _ = Task.Delay(TimeSpan.FromMinutes(1)).ContinueWith(_ => 
            {
                _generalRequests.TryGetValue(clientIp, out var currentCount);
                if (currentCount <= 1)
                {
                    _generalRequests.TryRemove(clientIp, out int _);
                }
            });
        }

        await _next(context);
    }

    private bool IsRateLimited(ConcurrentDictionary<string, DateTime> requests, string key, TimeSpan period, int maxRequests)
    {
        var now = DateTime.UtcNow;
        
        // Clean old entries
        var oldEntries = requests.Where(kvp => kvp.Value < now - period).ToList();
        foreach (var entry in oldEntries)
        {
            requests.TryRemove(entry.Key, out _);
        }

        // Check if rate limited
        if (requests.TryGetValue(key, out var lastRequest))
        {
            if (now - lastRequest < period)
            {
                return true;
            }
        }

        // Update last request time
        requests.AddOrUpdate(key, now, (k, v) => now);
        return false;
    }

    private string GetClientIp(HttpContext context)
    {
        var xForwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(xForwardedFor))
        {
            return xForwardedFor.Split(',')[0].Trim();
        }

        var xRealIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(xRealIp))
        {
            return xRealIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Mulkchi.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly bool _isEnabled;

    // Sliding window: IP -> queue of request timestamps
    private readonly ConcurrentDictionary<string, Queue<long>> _authRequests = new();
    private readonly ConcurrentDictionary<string, Queue<long>> _uploadRequests = new();
    private readonly ConcurrentDictionary<string, Queue<long>> _generalRequests = new();

    // Lock per key to avoid race conditions when mutating the queue
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    private const int AuthMaxRequests = 20;
    private const int AuthWindowSeconds = 60;
    private const int UploadMaxRequests = 30;
    private const int UploadWindowSeconds = 60;
    private const int GeneralMaxRequests = 300;
    private const int GeneralWindowSeconds = 60;

    public RateLimitMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _isEnabled = configuration.GetValue<bool>("RateLimiting:Enabled", true);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_isEnabled)
        {
            await _next(context);
            return;
        }

        var clientIp = GetClientIp(context);
        var path = context.Request.Path.Value?.ToLower() ?? "";

        if (path.StartsWith("/api/auth/"))
        {
            if (await IsRateLimitedAsync(_authRequests, clientIp, AuthWindowSeconds, AuthMaxRequests))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = AuthWindowSeconds.ToString();
                await context.Response.WriteAsync("Too many authentication attempts. Please try again later.");
                return;
            }
        }
        else if (path.StartsWith("/api/propertyimagesupload/upload"))
        {
            if (await IsRateLimitedAsync(_uploadRequests, clientIp, UploadWindowSeconds, UploadMaxRequests))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = UploadWindowSeconds.ToString();
                await context.Response.WriteAsync("Too many upload requests. Please try again later.");
                return;
            }
        }
        else
        {
            if (await IsRateLimitedAsync(_generalRequests, clientIp, GeneralWindowSeconds, GeneralMaxRequests))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = GeneralWindowSeconds.ToString();
                await context.Response.WriteAsync("Too many requests. Please slow down.");
                return;
            }
        }

        await _next(context);
    }

    private async Task<bool> IsRateLimitedAsync(
        ConcurrentDictionary<string, Queue<long>> store,
        string key,
        int windowSeconds,
        int maxRequests)
    {
        var semaphore = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await semaphore.WaitAsync();
        try
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var windowStart = now - windowSeconds;

            var queue = store.GetOrAdd(key, _ => new Queue<long>());

            // Evict timestamps outside the current window
            while (queue.Count > 0 && queue.Peek() <= windowStart)
                queue.Dequeue();

            if (queue.Count >= maxRequests)
                return true;

            queue.Enqueue(now);
            return false;
        }
        finally
        {
            semaphore.Release();
        }
    }

    private static string GetClientIp(HttpContext context)
    {
        var xForwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrEmpty(xForwardedFor))
            return xForwardedFor.Split(',')[0].Trim();

        var xRealIp = context.Request.Headers["X-Real-IP"].ToString();
        if (!string.IsNullOrEmpty(xRealIp))
            return xRealIp;

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

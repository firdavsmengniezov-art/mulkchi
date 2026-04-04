using System.Collections.Concurrent;
using System.Net;

namespace Mulkchi.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate next;
    private readonly IConfiguration configuration;

    private readonly ConcurrentDictionary<string, IpRateData> ipData =
        new(StringComparer.OrdinalIgnoreCase);

    public RateLimitMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        this.next = next;
        this.configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var rateLimitSection = this.configuration.GetSection("RateLimiting");
        bool isEnabled = rateLimitSection.GetValue<bool>("Enabled");

        if (!isEnabled)
        {
            await this.next(context);
            return;
        }

        string ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        int windowSeconds = rateLimitSection.GetValue("WindowSeconds", 60);
        int limit = GetLimit(path, rateLimitSection);

        IpRateData data = this.ipData.GetOrAdd(ip, _ => new IpRateData());
        bool allowed;

        lock (data)
        {
            long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            long windowStart = now - windowSeconds;

            while (data.Timestamps.Count > 0 && data.Timestamps.Peek() < windowStart)
                data.Timestamps.Dequeue();

            allowed = data.Timestamps.Count < limit;

            if (allowed)
                data.Timestamps.Enqueue(now);
        }

        if (!allowed)
        {
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers.Append("Retry-After", windowSeconds.ToString());
            await context.Response.WriteAsync("Too many requests. Please try again later.");
            return;
        }

        await this.next(context);
    }

    private static int GetLimit(string path, IConfigurationSection section)
    {
        if (path.Contains("/auth"))
            return section.GetValue("Auth", 20);

        if (path.Contains("/upload") || path.Contains("/images"))
            return section.GetValue("Upload", 30);

        return section.GetValue("General", 100);
    }

    private sealed class IpRateData
    {
        public Queue<long> Timestamps { get; } = new();
    }
}

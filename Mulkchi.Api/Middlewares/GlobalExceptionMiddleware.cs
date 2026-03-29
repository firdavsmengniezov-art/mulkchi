using System.Net;
using System.Text.Json;

namespace Mulkchi.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Kutilmagan xatolik: {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException =>
                (HttpStatusCode.Unauthorized, "Kirish taqiqlangan"),
            KeyNotFoundException =>
                (HttpStatusCode.NotFound, "Ma'lumot topilmadi"),
            ArgumentNullException =>
                (HttpStatusCode.BadRequest, "Noto'g'ri so'rov"),
            InvalidOperationException e =>
                (HttpStatusCode.BadRequest, e.Message),
            _ =>
                (HttpStatusCode.InternalServerError,
                 "Server xatoligi. Qayta urinib ko'ring.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            message,
            errors = new[] { exception.Message },
            statusCode = (int)statusCode
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response,
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }));
    }
}

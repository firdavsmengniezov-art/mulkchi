using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;

namespace Mulkchi.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
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
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.Clear();
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = GetStatusCode(exception);

        var response = new
        {
            error = new
            {
                code = GetErrorCode(exception),
                message = GetErrorMessage(exception),
                details = exception.InnerException?.Message,
                timestamp = DateTime.UtcNow
            }
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        return context.Response.WriteAsync(jsonResponse);
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            AuthValidationException => StatusCodes.Status400BadRequest,
            AuthDependencyValidationException => StatusCodes.Status400BadRequest,
            NotFoundUserByEmailException => StatusCodes.Status404NotFound,
            NotFoundPasswordResetTokenException => StatusCodes.Status400BadRequest,
            InvalidAuthException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            ArgumentException => StatusCodes.Status400BadRequest,
            InvalidOperationException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private static string GetErrorCode(Exception exception)
    {
        return exception switch
        {
            AuthValidationException => "AUTH_VALIDATION_ERROR",
            AuthDependencyValidationException => "AUTH_DEPENDENCY_VALIDATION_ERROR",
            NotFoundUserByEmailException => "USER_NOT_FOUND",
            NotFoundPasswordResetTokenException => "PASSWORD_RESET_TOKEN_NOT_FOUND",
            InvalidAuthException => "INVALID_AUTH_DATA",
            UnauthorizedAccessException => "UNAUTHORIZED",
            KeyNotFoundException => "KEY_NOT_FOUND",
            ArgumentException => "INVALID_ARGUMENT",
            InvalidOperationException => "INVALID_OPERATION",
            _ => "INTERNAL_SERVER_ERROR"
        };
    }

    private static string GetErrorMessage(Exception exception)
    {
        return exception switch
        {
            AuthValidationException => "Authentication validation failed.",
            AuthDependencyValidationException => exception.InnerException?.Message ?? "Authentication dependency validation failed.",
            NotFoundUserByEmailException => "User not found with the provided email.",
            NotFoundPasswordResetTokenException => "Password reset token is invalid or expired.",
            InvalidAuthException => "Invalid authentication data provided.",
            UnauthorizedAccessException => "Access is unauthorized.",
            KeyNotFoundException => "Requested resource not found.",
            ArgumentException => "Invalid argument provided.",
            InvalidOperationException => "Invalid operation attempted.",
            _ => "An internal server error occurred."
        };
    }
}

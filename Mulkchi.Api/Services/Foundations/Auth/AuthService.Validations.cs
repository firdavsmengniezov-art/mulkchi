using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;

namespace Mulkchi.Api.Services.Foundations.Auth;

public partial class AuthService
{
    private void ValidateLoginRequest(LoginRequest request)
    {
        if (request is null)
            throw new NullLoginRequestException(message: "Login request is null.");

        var invalidLoginRequestException =
            new InvalidLoginRequestException(message: "Auth request data is invalid.");

        if (IsInvalid(request.Email))
            invalidLoginRequestException.UpsertDataList(nameof(LoginRequest.Email), "Value is required.");

        if (IsInvalid(request.Password))
            invalidLoginRequestException.UpsertDataList(nameof(LoginRequest.Password), "Value is required.");

        invalidLoginRequestException.ThrowIfContainsErrors();
    }

    private void ValidateRegisterRequest(RegisterRequest request)
    {
        if (request is null)
            throw new NullRegisterRequestException(message: "Register request is null.");

        var invalidRegisterRequestException =
            new InvalidRegisterRequestException(message: "Auth request data is invalid.");

        if (IsInvalid(request.FirstName))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.FirstName), "Value is required.");

        if (IsInvalid(request.LastName))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.LastName), "Value is required.");

        if (IsInvalidEmail(request.Email))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.Email), "Email format is invalid.");

        if (IsInvalidPhone(request.Phone))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.Phone), "Phone format is invalid.");

        if (IsWeakPassword(request.Password))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.Password), "Password must be at least 6 characters.");

        invalidRegisterRequestException.ThrowIfContainsErrors();
    }

    private static bool IsInvalid(string text) =>
        string.IsNullOrWhiteSpace(text);

    private static bool IsInvalidEmail(string email) =>
        string.IsNullOrWhiteSpace(email)
            || !email.Contains('@')
            || !email.Contains('.');

    private static bool IsInvalidPhone(string phone) =>
        string.IsNullOrWhiteSpace(phone)
            || phone.Length < 5;

    private static bool IsWeakPassword(string password) =>
        string.IsNullOrWhiteSpace(password)
            || password.Length < 6;
}

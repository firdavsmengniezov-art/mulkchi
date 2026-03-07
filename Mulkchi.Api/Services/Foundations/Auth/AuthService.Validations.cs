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

        if (IsInvalid(request.Email))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.Email), "Value is required.");

        if (IsInvalid(request.Password))
            invalidRegisterRequestException.UpsertDataList(nameof(RegisterRequest.Password), "Value is required.");

        invalidRegisterRequestException.ThrowIfContainsErrors();
    }

    private static bool IsInvalid(string text) =>
        string.IsNullOrWhiteSpace(text);
}

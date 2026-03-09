using Mulkchi.Api.Models.Foundations.Auth;

namespace Mulkchi.Api.Services.Foundations.Auth;

public interface IAuthService
{
    ValueTask<AuthResponse> LoginAsync(LoginRequest request);
    ValueTask<AuthResponse> RegisterAsync(RegisterRequest request);
    ValueTask<AuthResponse> RefreshTokenAsync(string refreshToken);
    ValueTask LogoutAsync(string refreshToken);
    ValueTask ForgotPasswordAsync(string email);
    ValueTask ResetPasswordAsync(string token, string newPassword);
}

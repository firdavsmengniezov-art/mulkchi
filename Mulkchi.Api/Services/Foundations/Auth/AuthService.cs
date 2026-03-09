using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;
using Serilog;

namespace Mulkchi.Api.Services.Foundations.Auth;

public partial class AuthService : IAuthService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;
    private readonly IConfiguration configuration;

    public AuthService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker,
        IConfiguration configuration)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
        this.configuration = configuration;
    }

    public ValueTask<AuthResponse> LoginAsync(LoginRequest request) =>
        TryCatch(async () =>
        {
            ValidateLoginRequest(request);

            User? maybeUser = await this.storageBroker.SelectUserByEmailAsync(request.Email);

            if (maybeUser is null)
                throw new NotFoundUserByEmailException(
                    message: $"User with email '{request.Email}' was not found.");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new InvalidLoginRequestException(
                    message: "Password is required.");

            if (string.IsNullOrWhiteSpace(maybeUser.PasswordHash))
                throw new InvalidLoginRequestException(
                    message: "User account is missing password credentials. Please contact support.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, maybeUser.PasswordHash))
                throw new InvalidLoginRequestException(
                    message: "The provided credentials are invalid.");

            return await GenerateAndSaveAuthResponseAsync(maybeUser);
        });

    public ValueTask<AuthResponse> RegisterAsync(RegisterRequest request) =>
        TryCatch(async () =>
        {
            ValidateRegisterRequest(request);

            User? existingUser = await this.storageBroker.SelectUserByEmailAsync(request.Email);

            if (existingUser is not null)
                throw new AlreadyExistsUserEmailException(
                    message: $"A user with email '{request.Email}' already exists.");

            DateTimeOffset now = this.dateTimeBroker.GetCurrentDateTimeOffset();

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                PreferredLanguage = request.PreferredLanguage,
                Role = UserRole.Guest,
                CreatedDate = now,
                UpdatedDate = now
            };

            User addedUser = await this.storageBroker.InsertUserAsync(user);

            return await GenerateAndSaveAuthResponseAsync(addedUser);
        });

    public ValueTask<AuthResponse> RefreshTokenAsync(string refreshToken) =>
        TryCatch(async () =>
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new InvalidRefreshTokenException(
                    message: "Refresh token is required.");

            UserRefreshToken? storedToken =
                await this.storageBroker.SelectRefreshTokenAsync(refreshToken);

            if (storedToken is null || storedToken.IsRevoked)
                throw new InvalidRefreshTokenException(
                    message: "Refresh token is invalid or has been revoked.");

            if (storedToken.ExpiresAt <= this.dateTimeBroker.GetCurrentDateTimeOffset())
                throw new InvalidRefreshTokenException(
                    message: "Refresh token is invalid or expired.");

            User? maybeUser = await this.storageBroker.SelectUserByIdAsync(storedToken.UserId);

            if (maybeUser is null)
                throw new InvalidRefreshTokenException(
                    message: "Refresh token references a user that no longer exists.");

            storedToken.IsRevoked = true;
            await this.storageBroker.UpdateRefreshTokenAsync(storedToken);

            return await GenerateAndSaveAuthResponseAsync(maybeUser);
        });

    public ValueTask LogoutAsync(string refreshToken) =>
        TryCatch(async () =>
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new InvalidRefreshTokenException(
                    message: "Refresh token is required.");

            UserRefreshToken? storedToken =
                await this.storageBroker.SelectRefreshTokenAsync(refreshToken);

            if (storedToken is not null && !storedToken.IsRevoked)
            {
                storedToken.IsRevoked = true;
                await this.storageBroker.UpdateRefreshTokenAsync(storedToken);
            }
        });

    private async Task<AuthResponse> GenerateAndSaveAuthResponseAsync(User user)
    {
        var jwtSettings = this.configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        int expiryDays = int.TryParse(jwtSettings["ExpiryDays"], out int days) ? days : 7;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        DateTimeOffset now = this.dateTimeBroker.GetCurrentDateTimeOffset();
        DateTimeOffset expiresAt = now.AddDays(expiryDays);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        string token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        string refreshTokenValue = GenerateSecureRefreshToken();
        DateTimeOffset refreshExpiresAt = now.AddDays(expiryDays * 2);

        var userRefreshToken = new UserRefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = refreshExpiresAt,
            IsRevoked = false,
            CreatedDate = now
        };

        await this.storageBroker.InsertRefreshTokenAsync(userRefreshToken);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshTokenValue,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    public ValueTask ForgotPasswordAsync(string email) =>
        TryCatch(async () =>
        {
            ValidateEmail(email);

            User? user = await this.storageBroker.SelectUserByEmailAsync(email);
            
            // Always return success to prevent email enumeration
            if (user is null)
                return;

            // Generate secure token
            string token = GenerateSecureResetToken();
            DateTimeOffset now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            DateTimeOffset expiresAt = now.AddHours(1);

            var passwordResetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = token,
                ExpiresAt = expiresAt,
                IsUsed = false,
                CreatedDate = now
            };

            await this.storageBroker.InsertPasswordResetTokenAsync(passwordResetToken);

            // Send email (for now, just log - in production, use IEmailBroker)
            await SendPasswordResetEmailAsync(user.Email, token);
        });

    public ValueTask ResetPasswordAsync(string token, string newPassword) =>
        TryCatch(async () =>
        {
            ValidateResetPasswordRequest(token, newPassword);

            PasswordResetToken? resetToken = await this.storageBroker.SelectPasswordResetTokenByTokenAsync(token);

            if (resetToken is null)
                throw new NotFoundPasswordResetTokenException();

            if (resetToken.IsUsed || resetToken.ExpiresAt < this.dateTimeBroker.GetCurrentDateTimeOffset())
                throw new NotFoundPasswordResetTokenException();

            User? user = await this.storageBroker.SelectUserByIdAsync(resetToken.UserId);

            if (user is null)
                throw new NotFoundUserByEmailException(
                    message: $"User with ID '{resetToken.UserId}' was not found.");

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();

            await this.storageBroker.UpdateUserAsync(user);

            // Mark token as used
            resetToken.IsUsed = true;
            await this.storageBroker.UpdatePasswordResetTokenAsync(resetToken);
        });

    private static string GenerateSecureResetToken()
    {
        var randomBytes = new byte[32];
        RandomNumberGenerator.Fill(randomBytes);
        return Convert.ToBase64String(randomBytes).Replace("+", "-").Replace("/", "_").Trim('=');
    }

    private async Task SendPasswordResetEmailAsync(string email, string token)
    {
        // TODO: Implement email sending using IEmailBroker
        // For now, just log token (in production, send actual email)
        var resetUrl = $"https://mulkchi.uz/reset-password?token={token}";
        
        // Log for debugging - remove in production
        Log.Information("Password reset link generated for {Email}: {ResetUrl}", email, resetUrl);
        
        // In production:
        // await this.emailBroker.SendEmailAsync(
        //     email,
        //     "Password Reset Request",
        //     $"<h2>Password Reset</h2><p>Click <a href='{resetUrl}'>here</a> to reset your password.</p><p>This link will expire in 1 hour.</p>");
    }

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidAuthException("Email is required.");

        if (!email.Contains("@"))
            throw new InvalidAuthException("Invalid email format.");
    }

    private static void ValidateResetPasswordRequest(string token, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidAuthException("Reset token is required.");

        if (string.IsNullOrWhiteSpace(newPassword))
            throw new InvalidAuthException("New password is required.");

        if (newPassword.Length < 8)
            throw new InvalidAuthException("Password must be at least 8 characters long.");
    }

    private static string GenerateSecureRefreshToken()
    {
        var randomBytes = new byte[64];
        RandomNumberGenerator.Fill(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}

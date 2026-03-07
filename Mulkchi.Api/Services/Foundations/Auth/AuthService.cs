using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;

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

            if (!BCrypt.Net.BCrypt.Verify(request.Password, maybeUser.PasswordHash))
                throw new InvalidLoginRequestException(
                    message: "The provided credentials are invalid.");

            return GenerateAuthResponse(maybeUser);
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
                Role = request.Role,
                CreatedDate = now,
                UpdatedDate = now
            };

            User addedUser = await this.storageBroker.InsertUserAsync(user);

            return GenerateAuthResponse(addedUser);
        });

    public ValueTask<AuthResponse> RefreshTokenAsync(string refreshToken) =>
        TryCatch(async () =>
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new InvalidRefreshTokenException(
                    message: "Refresh token is required.");

            ClaimsPrincipal principal = ValidateRefreshToken(refreshToken);

            string? userIdValue = principal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userIdValue, out Guid userId))
                throw new InvalidRefreshTokenException(
                    message: "Refresh token contains invalid user identifier.");

            User? maybeUser = await this.storageBroker.SelectUserByIdAsync(userId);

            if (maybeUser is null)
                throw new NotFoundUserByEmailException(
                    message: $"User associated with this refresh token was not found.");

            return GenerateAuthResponse(maybeUser);
        });

    private AuthResponse GenerateAuthResponse(User user)
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

        var refreshClaims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var refreshDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: refreshClaims,
            expires: now.AddDays(expiryDays * 2).UtcDateTime,
            signingCredentials: credentials);

        string refreshToken = new JwtSecurityTokenHandler().WriteToken(refreshDescriptor);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    private ClaimsPrincipal ValidateRefreshToken(string refreshToken)
    {
        var jwtSettings = this.configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            return new JwtSecurityTokenHandler()
                .ValidateToken(refreshToken, validationParameters, out _);
        }
        catch (Exception exception)
        {
            throw new InvalidRefreshTokenException(
                message: "Refresh token is invalid or expired.",
                innerException: exception);
        }
    }
}

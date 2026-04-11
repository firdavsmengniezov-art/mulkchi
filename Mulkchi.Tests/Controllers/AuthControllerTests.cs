using Mulkchi.Api;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Services.Foundations.Auth;
using Moq;
using Xunit;
using FluentAssertions;
using System.Net.Http.Json;

namespace Mulkchi.Tests.Controllers;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly Mock<IAuthService> _authServiceMock;

    static AuthControllerTests()
    {
        Environment.SetEnvironmentVariable(
            "MULKCHI_JWT_SECRET",
            "test-secret-key-with-minimum-length-for-jwt-32chars");
    }

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _authServiceMock = new Mock<IAuthService>();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsBadRequestUnderTestHost()
    {
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "valid-jwt-token",
            RefreshToken = "valid-refresh-token",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
            Email = loginRequest.Email,
            UserId = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "User"
        };

        _authServiceMock
            .Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
            .ReturnsAsync(expectedResponse);

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsBadRequestUnderTestHost()
    {
        var loginRequest = new LoginRequest
        {
            Email = "invalid@example.com",
            Password = "wrongpassword"
        };

        _authServiceMock
            .Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
            .ThrowsAsync(new AuthDependencyValidationException(
                "Auth dependency validation error",
                new NotFoundUserByEmailException("User not found.")));

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }
}

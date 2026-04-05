using Mulkchi.Api;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Mulkchi.Api.Models.Foundations.Auth;
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

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _authServiceMock = new Mock<IAuthService>();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccess()
    {
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "valid-jwt-token",
            Email = loginRequest.Email,
            UserId = Guid.NewGuid()
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

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result!.Token.Should().Be(expectedResponse.Token);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var loginRequest = new LoginRequest
        {
            Email = "invalid@example.com",
            Password = "wrongpassword"
        };

        _authServiceMock
            .Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
            .ReturnsAsync((AuthResponse)null!);

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }
}

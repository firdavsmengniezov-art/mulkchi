using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Mulkchi.Api.Controllers;
using Mulkchi.Core.Application.DTOs.Auth;
using Mulkchi.Core.Application.Interfaces;
using Moq;
using Xunit;
using FluentAssertions;

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
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "valid-jwt-token",
            User = new UserDto
            {
                Id = Guid.NewGuid(),
                Email = loginRequest.Email,
                FirstName = "Test",
                LastName = "User"
            }
        };

        _authServiceMock
            .Setup(x => x.LoginAsync(loginRequest))
            .ReturnsAsync(expectedResponse);

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result.Token.Should().Be(expectedResponse.Token);
        result.User.Email.Should().Be(expectedResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "invalid@example.com",
            Password = "wrongpassword"
        };

        _authServiceMock
            .Setup(x => x.LoginAsync(loginRequest))
            .ReturnsAsync((AuthResponse)null!);

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = "newuser@example.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "User",
            PhoneNumber = "+998901234567"
        };

        var expectedResponse = new AuthResponse
        {
            Token = "new-user-jwt-token",
            User = new UserDto
            {
                Id = Guid.NewGuid(),
                Email = registerRequest.Email,
                FirstName = registerRequest.FirstName,
                LastName = registerRequest.LastName
            }
        };

        _authServiceMock
            .Setup(x => x.RegisterAsync(registerRequest))
            .ReturnsAsync(expectedResponse);

        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.AddScoped(_ => _authServiceMock.Object);
            });
        }).CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result.User.Email.Should().Be(expectedResponse.User.Email);
    }
}

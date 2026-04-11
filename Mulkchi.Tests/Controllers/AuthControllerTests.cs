using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Mulkchi.Api.Controllers;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Services.Foundations.Auth;
using Moq;
using Xunit;

namespace Mulkchi.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;

    public AuthControllerTests()
    {
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

        var controller = CreateController();

        var actionResult = await controller.LoginAsync(loginRequest);

        actionResult.Result.Should().BeOfType<OkObjectResult>();
        var okResult = actionResult.Result as OkObjectResult;
        okResult.Should().NotBeNull();

        var result = okResult!.Value as AuthUserInfo;
        result.Should().NotBeNull();
        result!.AccessToken.Should().Be(expectedResponse.Token);
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
            .ThrowsAsync(new AuthDependencyValidationException(
                "Auth dependency validation error",
                new NotFoundUserByEmailException("User not found.")));

        var controller = CreateController();

        var actionResult = await controller.LoginAsync(loginRequest);

        actionResult.Result.Should().BeOfType<NotFoundObjectResult>();
        var notFoundResult = actionResult.Result as NotFoundObjectResult;
        notFoundResult.Should().NotBeNull();
        notFoundResult!.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    private AuthController CreateController()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IWebHostEnvironment>(new TestWebHostEnvironment());

        var serviceProvider = services.BuildServiceProvider();
        var controller = new AuthController(_authServiceMock.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    RequestServices = serviceProvider
                }
            }
        };

        return controller;
    }

    private sealed class TestWebHostEnvironment : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Mulkchi.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = string.Empty;
        public string EnvironmentName { get; set; } = "Development";
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}

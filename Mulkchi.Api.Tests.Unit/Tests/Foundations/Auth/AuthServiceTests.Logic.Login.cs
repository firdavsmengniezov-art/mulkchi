using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    [Fact]
    public async Task ShouldReturnAuthResponseOnLoginAsync()
    {
        // given
        string password = "TestPassword123!";
        User randomUser = CreateRandomUser();
        randomUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);

        var loginRequest = new LoginRequest
        {
            Email = randomUser.Email,
            Password = password
        };

        DateTimeOffset now = DateTimeOffset.UtcNow;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(now);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(loginRequest.Email))
                .ReturnsAsync(randomUser);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertRefreshTokenAsync(It.IsAny<UserRefreshToken>()))
                .ReturnsAsync(CreateRandomUserRefreshToken());

        // when
        AuthResponse actualResponse = await this.authService.LoginAsync(loginRequest);

        // then
        actualResponse.Should().NotBeNull();
        actualResponse.Token.Should().NotBeNullOrEmpty();
        actualResponse.RefreshToken.Should().NotBeNullOrEmpty();
        actualResponse.UserId.Should().Be(randomUser.Id);
        actualResponse.Email.Should().Be(randomUser.Email);
        actualResponse.Role.Should().Be(randomUser.Role);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(loginRequest.Email),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertRefreshTokenAsync(It.IsAny<UserRefreshToken>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowDependencyValidationException_OnLogin_WhenPasswordIsInvalid()
    {
        // given
        string correctPassword = "CorrectPassword123!";
        User randomUser = CreateRandomUser();
        randomUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword);

        var loginRequest = new LoginRequest
        {
            Email = randomUser.Email,
            Password = "WrongPassword123!"
        };

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(loginRequest.Email))
                .ReturnsAsync(randomUser);

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(loginRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<InvalidLoginRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(loginRequest.Email),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

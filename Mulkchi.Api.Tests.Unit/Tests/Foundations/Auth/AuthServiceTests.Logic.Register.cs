using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    [Fact]
    public async Task ShouldReturnAuthResponseOnRegisterAsync()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        DateTimeOffset now = DateTimeOffset.UtcNow;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(now);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email))
                .ReturnsAsync((User?)null);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertUserAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) => user);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertRefreshTokenAsync(It.IsAny<UserRefreshToken>()))
                .ReturnsAsync(CreateRandomUserRefreshToken());

        this.tokenBrokerMock.Setup(broker =>
            broker.GenerateToken(It.IsAny<User>()))
                .Returns("test-jwt-token");

        this.tokenBrokerMock.Setup(broker =>
            broker.GenerateRefreshToken())
                .Returns("test-refresh-token");

        // when
        AuthResponse actualResponse = await this.authService.RegisterAsync(inputRequest);

        // then
        actualResponse.Should().NotBeNull();
        actualResponse.Token.Should().NotBeNullOrEmpty();
        actualResponse.RefreshToken.Should().NotBeNullOrEmpty();
        actualResponse.Email.Should().Be(inputRequest.Email);
        actualResponse.Role.Should().Be(UserRole.Guest);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertUserAsync(It.IsAny<User>()),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertRefreshTokenAsync(It.IsAny<UserRefreshToken>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

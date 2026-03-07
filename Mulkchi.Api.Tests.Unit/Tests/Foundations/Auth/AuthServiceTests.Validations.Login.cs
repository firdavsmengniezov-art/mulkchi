using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnLogin_WhenRequestIsNull()
    {
        // given
        LoginRequest? inputRequest = null;

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest!);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<NullLoginRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnLogin_WhenEmailIsEmpty()
    {
        // given
        LoginRequest inputRequest = CreateRandomLoginRequest();
        inputRequest.Email = string.Empty;

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<InvalidLoginRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnLogin_WhenPasswordIsEmpty()
    {
        // given
        LoginRequest inputRequest = CreateRandomLoginRequest();
        inputRequest.Password = string.Empty;

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<InvalidLoginRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowDependencyValidationException_OnLogin_WhenUserNotFound()
    {
        // given
        LoginRequest inputRequest = CreateRandomLoginRequest();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email))
                .ReturnsAsync((User?)null);

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest);

        // then
        AuthDependencyValidationException actualException =
            await Assert.ThrowsAsync<AuthDependencyValidationException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<NotFoundUserByEmailException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

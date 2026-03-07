using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnRegister_WhenRequestIsNull()
    {
        // given
        RegisterRequest? inputRequest = null;

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest!);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<NullRegisterRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnRegister_WhenFirstNameIsEmpty()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        inputRequest.FirstName = string.Empty;

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<InvalidRegisterRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnRegister_WhenEmailIsEmpty()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        inputRequest.Email = string.Empty;

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<InvalidRegisterRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnRegister_WhenPasswordIsEmpty()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        inputRequest.Password = string.Empty;

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest);

        // then
        AuthValidationException actualException =
            await Assert.ThrowsAsync<AuthValidationException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<InvalidRegisterRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowDependencyValidationException_OnRegister_WhenEmailAlreadyExists()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        User existingUser = CreateRandomUser();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email))
                .ReturnsAsync(existingUser);

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest);

        // then
        AuthDependencyValidationException actualException =
            await Assert.ThrowsAsync<AuthDependencyValidationException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<AlreadyExistsUserEmailException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(inputRequest.Email),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

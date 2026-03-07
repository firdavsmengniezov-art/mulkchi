using FluentAssertions;
using Microsoft.Data.SqlClient;
using Moq;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    [Fact]
    public async Task ShouldThrowDependencyException_OnLogin_WhenSqlExceptionOccurs()
    {
        // given
        LoginRequest inputRequest = CreateRandomLoginRequest();
        SqlException sqlException = CreateSqlException();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()))
                .ThrowsAsync(sqlException);

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest);

        // then
        AuthDependencyException actualException =
            await Assert.ThrowsAsync<AuthDependencyException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<FailedAuthStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowServiceException_OnLogin_WhenExceptionOccurs()
    {
        // given
        LoginRequest inputRequest = CreateRandomLoginRequest();
        var exception = new Exception();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()))
                .ThrowsAsync(exception);

        // when
        ValueTask<AuthResponse> loginTask =
            this.authService.LoginAsync(inputRequest);

        // then
        AuthServiceException actualException =
            await Assert.ThrowsAsync<AuthServiceException>(
                testCode: async () => await loginTask);

        actualException.InnerException.Should().BeOfType<FailedAuthServiceException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowDependencyException_OnRegister_WhenSqlExceptionOccurs()
    {
        // given
        RegisterRequest inputRequest = CreateRandomRegisterRequest();
        SqlException sqlException = CreateSqlException();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()))
                .ThrowsAsync(sqlException);

        // when
        ValueTask<AuthResponse> registerTask =
            this.authService.RegisterAsync(inputRequest);

        // then
        AuthDependencyException actualException =
            await Assert.ThrowsAsync<AuthDependencyException>(
                testCode: async () => await registerTask);

        actualException.InnerException.Should().BeOfType<FailedAuthStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByEmailAsync(It.IsAny<string>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}

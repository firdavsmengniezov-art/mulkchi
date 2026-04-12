using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.Auth;

public partial class AuthService
{
    private delegate ValueTask<AuthResponse> ReturningAuthResponseFunction();
    private delegate ValueTask ReturningNothingFunction();

    private async ValueTask<AuthResponse> TryCatch(ReturningAuthResponseFunction returningAuthResponseFunction)
    {
        try
        {
            return await returningAuthResponseFunction();
        }
        catch (NullLoginRequestException nullLoginRequestException)
        {
            throw CreateAndLogValidationException(nullLoginRequestException);
        }
        catch (NullRegisterRequestException nullRegisterRequestException)
        {
            throw CreateAndLogValidationException(nullRegisterRequestException);
        }
        catch (InvalidLoginRequestException invalidLoginRequestException)
        {
            throw CreateAndLogValidationException(invalidLoginRequestException);
        }
        catch (InvalidRegisterRequestException invalidRegisterRequestException)
        {
            throw CreateAndLogValidationException(invalidRegisterRequestException);
        }
        catch (InvalidRefreshTokenException invalidRefreshTokenException)
        {
            throw CreateAndLogValidationException(invalidRefreshTokenException);
        }
        catch (NotFoundUserByEmailException notFoundUserByEmailException)
        {
            throw CreateAndLogDependencyValidationException(notFoundUserByEmailException);
        }
        catch (AlreadyExistsUserEmailException alreadyExistsUserEmailException)
        {
            throw CreateAndLogDependencyValidationException(alreadyExistsUserEmailException);
        }
        catch (SqlException sqlException)
        {
            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: sqlException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (DbUpdateConcurrencyException dbUpdateConcurrencyException)
        {
            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: dbUpdateConcurrencyException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (DbUpdateException dbUpdateException)
        {
            if (IsDuplicateUserEmailConflict(dbUpdateException))
            {
                throw CreateAndLogDependencyValidationException(
                    new AlreadyExistsUserEmailException("A user with this email already exists."));
            }

            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: dbUpdateException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (Exception exception)
        {
            var failedService = new FailedAuthServiceException(
                message: "Failed auth service error occurred, contact support.",
                innerException: exception);

            throw CreateAndLogServiceException(failedService);
        }
    }

    private async ValueTask TryCatch(ReturningNothingFunction returningNothingFunction)
    {
        try
        {
            await returningNothingFunction();
        }
        catch (InvalidRefreshTokenException invalidRefreshTokenException)
        {
            throw CreateAndLogValidationException(invalidRefreshTokenException);
        }
        catch (SqlException sqlException)
        {
            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: sqlException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (DbUpdateConcurrencyException dbUpdateConcurrencyException)
        {
            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: dbUpdateConcurrencyException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (DbUpdateException dbUpdateException)
        {
            var failedStorage = new FailedAuthStorageException(
                message: "Failed auth storage error occurred, contact support.",
                innerException: dbUpdateException);

            throw CreateAndLogDependencyException(failedStorage);
        }
        catch (Exception exception)
        {
            var failedService = new FailedAuthServiceException(
                message: "Failed auth service error occurred, contact support.",
                innerException: exception);

            throw CreateAndLogServiceException(failedService);
        }
    }

    private AuthValidationException CreateAndLogValidationException(Xeption exception)
    {
        var authValidationException = new AuthValidationException(
            message: "Auth validation error occurred, fix the errors and try again.",
            innerException: exception);

        this.loggingBroker.LogError(authValidationException);

        return authValidationException;
    }

    private AuthDependencyValidationException CreateAndLogDependencyValidationException(Xeption exception)
    {
        var authDependencyValidationException = new AuthDependencyValidationException(
            message: "Auth dependency validation error occurred, fix the errors and try again.",
            innerException: exception);

        this.loggingBroker.LogError(authDependencyValidationException);

        return authDependencyValidationException;
    }

    private AuthDependencyException CreateAndLogDependencyException(Xeption exception)
    {
        var authDependencyException = new AuthDependencyException(
            message: "Auth dependency error occurred, contact support.",
            innerException: exception);

        this.loggingBroker.LogError(authDependencyException);

        return authDependencyException;
    }

    private AuthServiceException CreateAndLogServiceException(Xeption exception)
    {
        var authServiceException = new AuthServiceException(
            message: "Auth service error occurred, contact support.",
            innerException: exception);

        this.loggingBroker.LogError(authServiceException);

        return authServiceException;
    }

    private static bool IsDuplicateUserEmailConflict(DbUpdateException dbUpdateException)
    {
        static bool IsUsersEmailConstraintText(string text) =>
            text.Contains("IX_Users_Email", StringComparison.OrdinalIgnoreCase) ||
            (text.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) &&
             text.Contains("dbo.Users", StringComparison.OrdinalIgnoreCase));

        if (dbUpdateException.InnerException is SqlException sqlException &&
            (sqlException.Number == 2601 || sqlException.Number == 2627))
        {
            return IsUsersEmailConstraintText(sqlException.Message);
        }

        string errorText =
            $"{dbUpdateException.Message} {dbUpdateException.InnerException?.Message}";

        return IsUsersEmailConstraintText(errorText);
    }
}

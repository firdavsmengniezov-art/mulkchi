using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Users;
using Mulkchi.Api.Services.Foundations.Auth;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Auth;

public partial class AuthServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ILoggingBroker> loggingBrokerMock;
    private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
    private readonly IConfiguration configuration;
    private readonly IAuthService authService;

    public AuthServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.loggingBrokerMock = new Mock<ILoggingBroker>();
        this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
        this.configuration = CreateTestConfiguration();

        this.authService = new AuthService(
            this.storageBrokerMock.Object,
            this.loggingBrokerMock.Object,
            this.dateTimeBrokerMock.Object,
            this.configuration);
    }

    private static IConfiguration CreateTestConfiguration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "TestSecretKeyThatIsAtLeast32CharactersLong!!",
                ["JwtSettings:Issuer"] = "TestIssuer",
                ["JwtSettings:Audience"] = "TestAudience",
                ["JwtSettings:ExpiryDays"] = "7"
            })
            .Build();

    private static LoginRequest CreateRandomLoginRequest() =>
        new Filler<LoginRequest>().Create();

    private static RegisterRequest CreateRandomRegisterRequest()
    {
        var filler = new Filler<RegisterRequest>();
        filler.Setup()
            .OnProperty(r => r.Email).Use(() => $"user{Random.Shared.Next(1000, 9999)}@example.com")
            .OnProperty(r => r.Password).Use(() => $"Pass{Random.Shared.Next(1000, 9999)}word1");

        return filler.Create();
    }

    private static User CreateRandomUser()
    {
        var filler = new Filler<User>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow);

        return filler.Create();
    }

    private static UserRefreshToken CreateRandomUserRefreshToken()
    {
        var filler = new Filler<UserRefreshToken>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow.AddDays(14))
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow);

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}

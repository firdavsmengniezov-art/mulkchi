using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Services.Foundations.AiRecommendations;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.AiRecommendations;

public partial class AiRecommendationServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ILoggingBroker> loggingBrokerMock;
    private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
    private readonly IAiRecommendationService aiRecommendationService;

    public AiRecommendationServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.loggingBrokerMock = new Mock<ILoggingBroker>();
        this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
        this.aiRecommendationService = new AiRecommendationService(
            this.storageBrokerMock.Object,
            this.loggingBrokerMock.Object,
            this.dateTimeBrokerMock.Object);
    }

    private static AiRecommendation CreateRandomAiRecommendation()
    {
        var filler = new Filler<AiRecommendation>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow)
            .OnType<Guid>().Use(() => Guid.NewGuid())
            .OnType<string>().Use(() => "Valid Test String")
            .OnType<decimal>().Use(() => 50.0m); // Valid score between 0-100

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}

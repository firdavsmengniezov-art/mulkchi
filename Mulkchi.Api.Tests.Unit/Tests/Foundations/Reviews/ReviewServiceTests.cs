using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Reviews;
using Mulkchi.Api.Services.Foundations.Reviews;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Reviews;

public partial class ReviewServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ILoggingBroker> loggingBrokerMock;
    private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
    private readonly IReviewService reviewService;

    public ReviewServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.loggingBrokerMock = new Mock<ILoggingBroker>();
        this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
        this.reviewService = new ReviewService(
            this.storageBrokerMock.Object,
            this.loggingBrokerMock.Object,
            this.dateTimeBrokerMock.Object);
    }

    private static Review CreateRandomReview()
    {
        var filler = new Filler<Review>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow)
            .OnProperty(r => r.OverallRating).Use(() => (decimal)Random.Shared.Next(1, 6))
            .OnProperty(r => r.CleanlinessRating).Use(() => (decimal)Random.Shared.Next(1, 6))
            .OnProperty(r => r.LocationRating).Use(() => (decimal)Random.Shared.Next(1, 6))
            .OnProperty(r => r.ValueRating).Use(() => (decimal)Random.Shared.Next(1, 6))
            .OnProperty(r => r.CommunicationRating).Use(() => (decimal)Random.Shared.Next(1, 6))
            .OnProperty(r => r.AccuracyRating).Use(() => (decimal)Random.Shared.Next(1, 6));

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}

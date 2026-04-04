using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.Auth;
using Microsoft.Extensions.Localization;
using Mulkchi.Api.Resources;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ILoggingBroker> loggingBrokerMock;
    private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IStringLocalizer<SharedResource>> localizerMock;
    private readonly IPropertyService propertyService;

    public PropertyServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.loggingBrokerMock = new Mock<ILoggingBroker>();
        this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
        this.currentUserServiceMock = new Mock<ICurrentUserService>();
        this.localizerMock = new Mock<IStringLocalizer<SharedResource>>();
        this.propertyService = new PropertyService(
            this.storageBrokerMock.Object,
            this.loggingBrokerMock.Object,
            this.dateTimeBrokerMock.Object,
            this.currentUserServiceMock.Object,
            this.localizerMock.Object);
    }

    private static Property CreateRandomProperty()
    {
        var filler = new Filler<Property>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow);

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}

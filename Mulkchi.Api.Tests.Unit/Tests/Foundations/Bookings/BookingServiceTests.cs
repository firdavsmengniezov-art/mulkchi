using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Services.Foundations.Bookings;
using Mulkchi.Api.Services.Foundations.Auth;
using Mulkchi.Api.Brokers.Notifications;
using Microsoft.Extensions.Logging;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IEmailBroker> emailBrokerMock;
    private readonly Mock<ILogger<BookingService>> loggerMock;
    private readonly IBookingService bookingService;

    public BookingServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.currentUserServiceMock = new Mock<ICurrentUserService>();
        this.emailBrokerMock = new Mock<IEmailBroker>();
        this.loggerMock = new Mock<ILogger<BookingService>>();
        this.bookingService = new BookingService(
            this.storageBrokerMock.Object,
            this.currentUserServiceMock.Object,
            this.emailBrokerMock.Object,
            this.loggerMock.Object);
    }

    private static Booking CreateRandomBooking()
    {
        var filler = new Filler<Booking>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow);

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}

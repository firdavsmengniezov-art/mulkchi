using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public void ShouldRetrieveAllBookings()
    {
        // given
        IQueryable<Booking> randomBookings = CreateRandomBookings();
        IQueryable<Booking> expectedBookings = randomBookings;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllBookings())
                .Returns(expectedBookings);

        // when
        IQueryable<Booking> actualBookings = this.bookingService.RetrieveAllBookings();

        // then
        actualBookings.Should().BeEquivalentTo(expectedBookings);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllBookings(),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    private IQueryable<Booking> CreateRandomBookings()
    {
        return Enumerable.Range(0, 5)
            .Select(_ => CreateRandomBooking())
            .AsQueryable();
    }
}

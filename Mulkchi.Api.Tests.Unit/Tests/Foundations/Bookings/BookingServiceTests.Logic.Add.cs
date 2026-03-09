using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldAddBookingAsync()
    {
        // given
        Booking randomBooking = CreateRandomBooking();
        Booking inputBooking = randomBooking;
        Booking expectedBooking = inputBooking;

        this.storageBrokerMock.Setup(broker =>
            broker.InsertBookingAsync(inputBooking))
                .ReturnsAsync(expectedBooking);

        // when
        Booking actualBooking = await this.bookingService.AddBookingAsync(inputBooking);

        // then
        actualBooking.Should().BeEquivalentTo(expectedBooking);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(inputBooking),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

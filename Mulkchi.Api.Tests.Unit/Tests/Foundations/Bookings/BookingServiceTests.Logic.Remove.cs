using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldRemoveBookingAsync()
    {
        // given
        Guid randomBookingId = Guid.NewGuid();
        Booking randomBooking = CreateRandomBooking();
        Booking storageBooking = randomBooking;
        storageBooking.Id = randomBookingId;
        Booking expectedBooking = storageBooking;

        // Set up CurrentUserService mock to return the booking's guest ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(storageBooking.GuestId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectBookingByIdAsync(randomBookingId))
                .ReturnsAsync(storageBooking);

        this.storageBrokerMock.Setup(broker =>
            broker.DeleteBookingAsync(randomBookingId))
                .ReturnsAsync(expectedBooking);

        // when
        Booking actualBooking = await this.bookingService.RemoveBookingAsync(randomBookingId);

        // then
        actualBooking.Should().BeEquivalentTo(expectedBooking);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectBookingByIdAsync(randomBookingId),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.DeleteBookingAsync(randomBookingId),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}


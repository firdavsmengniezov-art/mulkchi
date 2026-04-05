using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldModifyBookingAsync()
    {
        // given
        Booking randomBooking = CreateRandomBooking();
        Booking inputBooking = randomBooking;
        Booking expectedBooking = inputBooking;

        // Set up CurrentUserService mock to return the booking's guest ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(inputBooking.GuestId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectBookingByIdAsync(inputBooking.Id))
                .ReturnsAsync(inputBooking);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateBookingAsync(inputBooking))
                .ReturnsAsync(expectedBooking);

        // when
        Booking actualBooking = await this.bookingService.ModifyBookingAsync(inputBooking);

        // then
        actualBooking.Should().BeEquivalentTo(expectedBooking);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectBookingByIdAsync(inputBooking.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateBookingAsync(inputBooking),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}


using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldRetrieveBookingByIdAsync()
    {
        // given
        Guid randomBookingId = Guid.NewGuid();
        Booking randomBooking = CreateRandomBooking();
        randomBooking.Id = randomBookingId;
        BookingResponse expectedBooking = new BookingResponse
        {
            Id = randomBooking.Id,
            PropertyId = randomBooking.PropertyId,
            GuestId = randomBooking.GuestId,
            CheckInDate = randomBooking.CheckInDate,
            CheckOutDate = randomBooking.CheckOutDate,
            TotalPrice = randomBooking.TotalPrice,
            Status = randomBooking.Status,
            CreatedDate = randomBooking.CreatedDate,
            UpdatedDate = randomBooking.UpdatedDate
        };

        // Set up CurrentUserService mock to return the booking's guest ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(expectedBooking.GuestId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectBookingByIdAsync(randomBookingId))
                .ReturnsAsync(randomBooking);

        // when
        BookingResponse actualBooking = await this.bookingService.RetrieveBookingByIdAsync(randomBookingId);

        // then
        actualBooking.Should().BeEquivalentTo(expectedBooking);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectBookingByIdAsync(randomBookingId),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}


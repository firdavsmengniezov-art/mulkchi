using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Models.Foundations.Bookings.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullBooking()
    {
        // given
        Booking? inputBooking = null;

        // when
        ValueTask<Booking> addBookingTask =
            this.bookingService.AddBookingAsync(inputBooking!);

        // then
        BookingValidationException actualException =
            await Assert.ThrowsAsync<BookingValidationException>(
                testCode: async () => await addBookingTask);

        actualException.InnerException.Should().BeOfType<NullBookingException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenPropertyIdIsEmpty()
    {
        // given
        Booking randomBooking = CreateRandomBooking();
        randomBooking.PropertyId = Guid.Empty;

        // when
        ValueTask<Booking> addBookingTask =
            this.bookingService.AddBookingAsync(randomBooking);

        // then
        await Assert.ThrowsAsync<BookingValidationException>(
            testCode: async () => await addBookingTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenGuestIdIsEmpty()
    {
        // given
        Booking randomBooking = CreateRandomBooking();
        randomBooking.GuestId = Guid.Empty;

        // when
        ValueTask<Booking> addBookingTask =
            this.bookingService.AddBookingAsync(randomBooking);

        // then
        await Assert.ThrowsAsync<BookingValidationException>(
            testCode: async () => await addBookingTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenCheckOutDateIsBeforeCheckInDate()
    {
        // given
        DateTimeOffset randomDateTime = DateTimeOffset.UtcNow;
        Booking invalidBooking = CreateRandomBooking();
        invalidBooking.CheckInDate = randomDateTime;
        invalidBooking.CheckOutDate = randomDateTime.AddMinutes(-1);

        // when
        ValueTask<Booking> addBookingTask =
            this.bookingService.AddBookingAsync(invalidBooking);

        // then
        await Assert.ThrowsAsync<BookingValidationException>(
            testCode: async () => await addBookingTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

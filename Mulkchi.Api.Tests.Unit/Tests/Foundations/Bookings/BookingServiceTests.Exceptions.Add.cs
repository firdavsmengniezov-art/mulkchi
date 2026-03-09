using FluentAssertions;
using Microsoft.Data.SqlClient;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Models.Foundations.Bookings.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Bookings;

public partial class BookingServiceTests
{
    [Fact]
    public async Task ShouldThrowDependencyException_OnAdd_WhenSqlExceptionOccurs()
    {
        // given
        Booking someBooking = CreateRandomBooking();
        SqlException sqlException = CreateSqlException();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()))
                .ThrowsAsync(sqlException);

        // when
        Func<Task> addBookingTask = async () =>
            await this.bookingService.AddBookingAsync(someBooking);

        // then
        BookingDependencyException actualException =
            await Assert.ThrowsAsync<BookingDependencyException>(
                testCode: async () => await addBookingTask());

        actualException.InnerException.Should().BeOfType<FailedBookingStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowServiceException_OnAdd_WhenExceptionOccurs()
    {
        // given
        Booking someBooking = CreateRandomBooking();
        var exception = new Exception();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()))
                .ThrowsAsync(exception);

        // when
        Func<Task> addBookingTask = async () =>
            await this.bookingService.AddBookingAsync(someBooking);

        // then
        BookingServiceException actualException =
            await Assert.ThrowsAsync<BookingServiceException>(
                testCode: async () => await addBookingTask());

        actualException.InnerException.Should().BeOfType<FailedBookingServiceException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(It.IsAny<Booking>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Models.Foundations.Properties;

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
        Property property = new Property { Id = inputBooking.PropertyId };

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(inputBooking.PropertyId))
                .ReturnsAsync(property);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertBookingAsync(inputBooking))
                .ReturnsAsync(expectedBooking);

        this.emailBrokerMock.Setup(broker =>
            broker.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

        // when
        Booking actualBooking = await this.bookingService.AddBookingAsync(inputBooking);

        // then
        actualBooking.Should().BeEquivalentTo(expectedBooking);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectPropertyByIdAsync(inputBooking.PropertyId),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertBookingAsync(inputBooking),
            Times.Once);

        this.emailBrokerMock.Verify(broker =>
            broker.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Exactly(2)); // One for guest, one for host

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.emailBrokerMock.VerifyNoOtherCalls();
    }
}

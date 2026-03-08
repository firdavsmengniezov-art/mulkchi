using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Payments;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Payments;

public partial class PaymentServiceTests
{
    [Fact]
    public async Task ShouldAddPaymentAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Payment randomPayment = CreateRandomPayment();
        Payment inputPayment = randomPayment;
        inputPayment.CreatedDate = randomDateTimeOffset;
        inputPayment.UpdatedDate = randomDateTimeOffset;
        Payment expectedPayment = inputPayment;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPaymentAsync(inputPayment))
                .ReturnsAsync(expectedPayment);

        // when
        Payment actualPayment = await this.paymentService.AddPaymentAsync(inputPayment);

        // then
        actualPayment.Should().BeEquivalentTo(expectedPayment);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPaymentAsync(inputPayment),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

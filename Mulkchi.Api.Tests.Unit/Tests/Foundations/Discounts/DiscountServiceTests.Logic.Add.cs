using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Discounts;

public partial class DiscountServiceTests
{
    [Fact]
    public async Task ShouldAddDiscountAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Discount randomDiscount = CreateRandomDiscount();
        Discount inputDiscount = randomDiscount;
        inputDiscount.CreatedDate = randomDateTimeOffset;
        inputDiscount.UpdatedDate = randomDateTimeOffset;
        Discount expectedDiscount = inputDiscount;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertDiscountAsync(inputDiscount))
                .ReturnsAsync(expectedDiscount);

        // when
        Discount actualDiscount = await this.discountService.AddDiscountAsync(inputDiscount);

        // then
        actualDiscount.Should().BeEquivalentTo(expectedDiscount);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountAsync(inputDiscount),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

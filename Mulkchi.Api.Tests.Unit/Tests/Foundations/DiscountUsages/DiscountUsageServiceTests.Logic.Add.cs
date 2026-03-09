using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldAddDiscountUsageAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        DiscountUsage inputDiscountUsage = randomDiscountUsage;
        inputDiscountUsage.CreatedDate = randomDateTimeOffset;
        inputDiscountUsage.UpdatedDate = randomDateTimeOffset;
        DiscountUsage expectedDiscountUsage = inputDiscountUsage;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertDiscountUsageAsync(inputDiscountUsage))
                .ReturnsAsync(expectedDiscountUsage);

        // when
        DiscountUsage actualDiscountUsage = await this.discountUsageService.AddDiscountUsageAsync(inputDiscountUsage);

        // then
        actualDiscountUsage.Should().BeEquivalentTo(expectedDiscountUsage);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(inputDiscountUsage),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
